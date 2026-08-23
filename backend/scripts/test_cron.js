const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('1. Loging in as panel admin...');
  const resLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Domain': 'localhost', 'X-Auth-Context': 'panel' },
    body: JSON.stringify({ email: 'aldairhernandez763@gmail.com', password: 'Test1234' })
  });
  
  const loginData = await resLogin.json();
  const token = loginData.data.accessToken;
  console.log('✅ Logged in.');

  console.log('\n2. Triggering cron for the first time...');
  const resCron1 = await fetch('http://localhost:3001/api/admin/cron/membresias/ejecutar-ahora', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-Domain': 'localhost', 'X-Auth-Context': 'panel' }
  });
  console.log('Cron 1 Response:', resCron1.status);
  
  // Give it a second to process
  await new Promise(r => setTimeout(r, 4000));

  console.log('\n3. Triggering cron for the second time...');
  const resCron2 = await fetch('http://localhost:3001/api/admin/cron/membresias/ejecutar-ahora', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-Domain': 'localhost', 'X-Auth-Context': 'panel' }
  });
  console.log('Cron 2 Response:', resCron2.status);
  
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n4. Checking PagoMembresia in DB...');
  const now = new Date();
  const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const pagos = await prisma.pagoMembresia.findMany({
    where: { periodo }
  });
  
  pagos.forEach(p => {
    console.log(`Pago: ${p.id} | Estado: ${p.estado} | Periodo: ${p.periodo} | Membresia: ${p.membresiaId} | StripePI: ${p.stripePaymentId}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
