const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  // Paso 1: Estado del Negocio
  const negocio = await db.negocio.findFirst({
    select: {
      id: true,
      nombre: true,
      dominio: true,
      stripeAccountId: true,
      stripeOnboardingCompleto: true,
    }
  });
  console.log('=== PASO 1: NEGOCIO ===');
  console.log(JSON.stringify(negocio, null, 2));

  if (!negocio) { await db.$disconnect(); return; }

  // Paso 2: Buscar cliente de prueba
  const cliente = await db.clienteAuth.findFirst({
    where: { negocioId: negocio.id },
    select: { id: true, email: true, nombre: true }
  });
  console.log('\n=== CLIENTE DE PRUEBA ===');
  console.log(JSON.stringify(cliente, null, 2));

  // Paso 2b: Buscar pedido de prueba con items
  const pedido = await db.pedido.findFirst({
    where: { negocioId: negocio.id },
    include: {
      items: true,
      pagos: { orderBy: { createdAt: 'desc' } }
    },
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n=== PEDIDO MAS RECIENTE ===');
  if (pedido) {
    const computedSubtotal = pedido.items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0);
    const computedTotal = computedSubtotal + Number(pedido.impuestos) - Number(pedido.descuento);
    console.log(JSON.stringify({
      id: pedido.id,
      numero: pedido.numero,
      estado: pedido.estado,
      total: pedido.total,
      impuestos: pedido.impuestos,
      descuento: pedido.descuento,
      clienteId: pedido.clienteId,
      negocioId: pedido.negocioId,
      items: pedido.items.map(i => ({ id: i.id, productoId: i.productoId, cantidad: i.cantidad, precio: i.precio })),
      computedSubtotal,
      computedTotal,
      totalMatchesComputed: Math.abs(computedTotal - Number(pedido.total)) <= 0.01,
      pagos: pedido.pagos.map(p => ({ id: p.id, estado: p.estado, stripePaymentId: p.stripePaymentId }))
    }, null, 2));
  } else {
    console.log('NO EXISTE PEDIDO de prueba.');
  }

  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
