const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const negocio = await prisma.negocio.findUnique({
    where: { id: 'cmsgz900j0000lee1qecmhag5' },
    select: { stripeAccountId: true, stripeOnboardingCompleto: true }
  });
  console.log(JSON.stringify(negocio, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
