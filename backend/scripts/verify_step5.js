require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const BASE_URL = 'http://localhost:3001/api';
const NEGOCIO_ID = 'cmsgz900j0000lee1qecmhag5';
const DOMINIO = 'localhost';
const EMAIL = 'aldairhernandez763@gmail.com';
const PASSWORD = 'Test1234';

async function testPayment(token, membresiaId, periodo) {
  console.log(`\n--- Probando pago para membresia ${membresiaId}, periodo: ${periodo} ---`);
  const res = await fetch(`${BASE_URL}/membresias/${membresiaId}/pago`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Domain': DOMINIO,
      'X-Auth-Context': 'panel'
    },
    body: JSON.stringify({ periodo })
  });
  const data = await res.json();
  console.log(`Status HTTP: ${res.status}`);
  console.log('Response body:', JSON.stringify(data, null, 2));

  // Verificar DB
  const pagoDB = await db.pagoMembresia.findFirst({
    where: { membresiaId, periodo },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Estado en DB:`, pagoDB ? pagoDB.estado : 'No encontrado');
}

async function main() {
  // Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Domain': DOMINIO, 'X-Auth-Context': 'panel' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;

  // Get membresia
  const membresia = await db.membresia.findFirst({ where: { negocioId: NEGOCIO_ID } });
  
  // 5.1 Caso Exitoso (tarjeta 4242)
  await testPayment(token, membresia.id, '2026-08');

  // 5.2 Idempotencia (mismo periodo)
  await testPayment(token, membresia.id, '2026-08');

  // Para testear las otras tarjetas, necesitamos crear un PaymentMethod y asignarlo al customer
  const createAndSetCard = async (tokenCard) => {
    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: tokenCard } });
    const negocio = await db.negocio.findUnique({ where: { id: NEGOCIO_ID } });
    await stripe.paymentMethods.attach(pm.id, { customer: negocio.stripeCustomerId });
    await db.negocio.update({
      where: { id: NEGOCIO_ID },
      data: { stripeMetodoPagoId: pm.id }
    });
    return pm.id;
  };

  // 5.3 3D Secure (tarjeta 4000 0027 6000 3184 - token: tok_threeDSecure2Required)
  console.log('\n--- Configurando tarjeta 3D Secure ---');
  await createAndSetCard('tok_threeDSecure2Required');
  await testPayment(token, membresia.id, '2026-09');

  // 5.4 Rechazo (tarjeta genérica de rechazo - token: tok_chargeCustomerFail)
  console.log('\n--- Configurando tarjeta de rechazo ---');
  await createAndSetCard('tok_chargeCustomerFail');
  await testPayment(token, membresia.id, '2026-10');

  await db.$disconnect();
}

main().catch(console.error);
