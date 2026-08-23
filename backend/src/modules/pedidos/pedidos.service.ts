import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { AppError } from '../../middlewares/errorHandler';
import { EstadoPago, MetodoPago, TipoPedido } from '@prisma/client';
import type { CrearPedidoDto } from './pedidos.schema';

export async function createStripePayment(
  pedidoId: string,
  clienteId: string,
  negocioId: string
): Promise<{ clientSecret: string }> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { negocio: true, pagos: true, items: true },
  });

  if (!pedido || pedido.negocioId !== negocioId) throw new AppError('Order not found.', 404);
  if (pedido.clienteId !== clienteId) throw new AppError('Forbidden: Order belongs to another client.', 403);
  if (!pedido.negocio.stripeAccountId || !pedido.negocio.stripeOnboardingCompleto)
    throw new AppError('The business cannot accept payments currently.', 400);

  const pagado = pedido.pagos.some((p) => p.estado === EstadoPago.APROBADO);
  if (pagado) throw new AppError('Order is already paid.', 400);

  const computedSubtotal = pedido.items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0);
  const computedTotal = computedSubtotal + Number(pedido.impuestos) - Number(pedido.descuento);

  if (Math.abs(computedTotal - Number(pedido.total)) > 0.01)
    throw new AppError('Monto del pedido inconsistente.', 409);

  const amountCents = Math.round(computedTotal * 100);
  const idempotencyKey = pedido.id + '-attempt-' + (pedido.pagos.length + 1);

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: 'mxn',
      payment_method_types: ['card'],
      transfer_data: { destination: pedido.negocio.stripeAccountId },
      application_fee_amount: 0,
      on_behalf_of: pedido.negocio.stripeAccountId,
      metadata: { pedidoId: pedido.id, clienteId, negocioId },
    },
    { idempotencyKey }
  );

  await prisma.pago.create({
    data: {
      pedidoId: pedido.id,
      monto: pedido.total,
      metodo: MetodoPago.STRIPE,
      estado: EstadoPago.PENDIENTE,
      stripePaymentId: paymentIntent.id,
    },
  });

  return { clientSecret: paymentIntent.client_secret! };
}

export async function crearPedido(dto: CrearPedidoDto, clienteId: string, negocioId: string) {
  const { items, tipo = 'LOCAL', direccionEntrega, notasCliente } = dto;

  if (tipo === 'DELIVERY' && !direccionEntrega?.trim())
    throw new AppError('direccionEntrega is required for DELIVERY orders.', 422);

  type ResolvedItem = { productoId: string; varianteId?: string; nombre: string; precio: number; cantidad: number; subtotal: number };
  const resolvedItems: ResolvedItem[] = [];

  for (const item of items) {
    const producto = await prisma.producto.findFirst({
      where: { id: item.productoId, negocioId, activo: true },
    });
    if (!producto) throw new AppError('Producto ' + item.productoId + ' no encontrado o no disponible en esta tienda.', 404);

    let precio = Number(producto.precio);
    let varianteId: string | undefined;

    if (item.varianteId) {
      const variante = await prisma.varianteProducto.findFirst({
        where: { id: item.varianteId, productoId: producto.id, activo: true },
      });
      if (!variante) throw new AppError('Variante ' + item.varianteId + ' no encontrada para producto ' + producto.nombre, 404);
      precio = Number(variante.precio);
      varianteId = variante.id;
    }

    resolvedItems.push({
      productoId: producto.id,
      varianteId,
      nombre: producto.nombre,
      precio,
      cantidad: item.cantidad,
      subtotal: parseFloat((precio * item.cantidad).toFixed(2)),
    });
  }

  const subtotal = parseFloat(resolvedItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
  const total = subtotal;

  const ultimo = await prisma.pedido.findFirst({
    where: { negocioId },
    orderBy: { numero: 'desc' },
    select: { numero: true },
  });
  const numero = (ultimo?.numero ?? 0) + 1;

  const pedido = await prisma.$transaction(async (tx) => {
    return tx.pedido.create({
      data: {
        negocioId,
        clienteId,
        numero,
        tipo: tipo as TipoPedido,
        subtotal,
        descuento: 0,
        impuestos: 0,
        total,
        moneda: 'MXN',
        direccionEntrega: direccionEntrega ?? null,
        notasCliente: notasCliente ?? null,
        items: {
          create: resolvedItems.map((i) => ({
            productoId: i.productoId,
            varianteId: i.varianteId ?? null,
            nombre: i.nombre,
            precio: i.precio,
            cantidad: i.cantidad,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { items: true },
    });
  });

  return pedido;
}

export async function getPedidoById(pedidoId: string, clienteId: string, negocioId: string) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { items: true, pagos: true },
  });

  if (!pedido || pedido.negocioId !== negocioId) throw new AppError('Order not found.', 404);
  if (pedido.clienteId !== clienteId) throw new AppError('Forbidden: Order belongs to another client.', 403);

  return pedido;
}