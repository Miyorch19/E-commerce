require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const MEMBRESIA_ID = 'cmt4v1ajz000rfdc344bf7pzq';

  // Show what exists before cleanup
  const before = await db.pagoMembresia.findMany({
    where: { membresiaId: MEMBRESIA_ID },
    orderBy: { createdAt: 'desc' },
    select: { id: true, periodo: true, estado: true, stripePaymentId: true, monto: true }
  });
  console.log('=== PagoMembresia ANTES de limpieza ===');
  console.log(JSON.stringify(before, null, 2));

  // Delete all test data
  const deleted = await db.pagoMembresia.deleteMany({ where: { membresiaId: MEMBRESIA_ID } });
  console.log(`\n✅ Eliminados ${deleted.count} registro(s) de PagoMembresia (datos de prueba)`);

  const after = await db.pagoMembresia.findMany({ where: { membresiaId: MEMBRESIA_ID } });
  console.log(`\n=== PagoMembresia DESPUÉS de limpieza: ${after.length} registros ===`);

  await db.$disconnect();
}

main().catch(console.error);
