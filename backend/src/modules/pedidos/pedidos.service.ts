import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { AppError } from '../../middlewares/errorHandler';
import { EstadoPago, MetodoPago } from '@prisma/client';

/**
 * Crea un PaymentIntent para pagar un Pedido utilizando un Destination Charge (Stripe Connect).
 * El 100% del dinero va a la cuenta del negocio (application_fee_amount = 0).
 */
export async function createStripePayment(
  pedidoId: string,
  clienteId: string,
  negocioId: string
): Promise<{ clientSecret: string }> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      negocio: true,
      pagos: true,
      items: true,
    },
  });

  if (!pedido || pedido.negocioId !== negocioId) {
    throw new AppError('Order not found.', 404);
  }

  if (pedido.clienteId !== clienteId) {
    throw new AppError('Forbidden: Order belongs to another client.', 403);
  }

  if (!pedido.negocio.stripeAccountId || !pedido.negocio.stripeOnboardingCompleto) {
    throw new AppError('The business cannot accept payments currently.', 400);
  }

  // Verificar si ya está pagado
  const pagado = pedido.pagos.some((p) => p.estado === EstadoPago.APROBADO);
  if (pagado) {
    throw new AppError('Order is already paid.', 400);
  }

  // Recalcular el monto sumando los ítems de la base de datos
  const computedSubtotal = pedido.items.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );
  
  const computedTotal = computedSubtotal + Number(pedido.impuestos) - Number(pedido.descuento);

  // Verificamos que el total calculado coincida con el total guardado en el pedido (margen de error de 1 centavo por redondeos)
  if (Math.abs(computedTotal - Number(pedido.total)) > 0.01) {
    throw new AppError(
      'Monto del pedido inconsistente. El total no coincide con la suma de los ítems.',
      409
    );
  }

  // Amount in cents
  const amountCents = Math.round(computedTotal * 100);

  // Generamos una idempotency key determinista basada en la cantidad de intentos
  // para evitar crear múltiples PaymentIntents si el cliente hace retiros simultáneos.
  const idempotencyKey = `${pedido.id}-attempt-${pedido.pagos.length + 1}`;

  // Crear PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: 'mxn', // Fijo a MXN para este demo (se puede hacer configurable)
      payment_method_types: ['card'],
      transfer_data: {
        destination: pedido.negocio.stripeAccountId,
      },
      // application_fee_amount = 0 implica que la plataforma se queda 0 (negocio 100%)
      application_fee_amount: 0,
      
      // NOTA SOBRE ON_BEHALF_OF:
      // Hace responsable al negocio por contracargos y comisiones de Stripe, sacando a la 
      // plataforma de ser el "merchant of record".
      // Limitación de Stripe: La cuenta Connect y la plataforma deben estar en el mismo país,
      // o tener la misma moneda de liquidación, de lo contrario esta llamada fallará.
      on_behalf_of: pedido.negocio.stripeAccountId,
      
      metadata: {
        pedidoId: pedido.id,
        clienteId: clienteId,
        negocioId: negocioId,
      },
    },
    {
      idempotencyKey,
    }
  );

  // Registrar intento de pago en la BD
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
