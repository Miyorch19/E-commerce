const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.pagoMembresia.deleteMany({});
  console.log('Deleted all PagoMembresia records');
}

main().catch(console.error).finally(() => prisma.$disconnect());
