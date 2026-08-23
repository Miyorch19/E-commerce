require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const BASE = 'http://localhost:3001/api';
const DOMINIO = 'localhost';
const EMAIL = 'aldairhernandez763@gmail.com';
const PASSWORD = 'Test1234';
const NEGOCIO_ID = 'cmsgz900j0000lee1qecmhag5';
const PERIODO = '2026-08';

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  PASO 5 — POST /api/membresias/:id/pago (periodo ' + PERIODO + ')');
  console.log('════════════════════════════════════════════════════════════');

  // Login
  const loginRes = await post(`${BASE}/auth/login`,
    { email: EMAIL, password: PASSWORD },
    { 'X-Tenant-Domain': DOMINIO, 'X-Auth-Context': 'panel' }
  );
  const { accessToken } = loginRes.data.data;
  console.log('Login HTTP Status:', loginRes.status, '✅');

  const AUTH = {
    'Authorization': `Bearer ${accessToken}`,
    'X-Tenant-Domain': DOMINIO,
    'X-Auth-Context': 'panel',
  };

  // Confirm current state
  const negocio = await db.negocio.findUnique({
    where: { id: NEGOCIO_ID },
    select: { stripeCustomerId: true, stripeMetodoPagoId: true }
  });
  console.log('\n[BD] Estado previo del Negocio:');
  console.log('  stripeCustomerId :', negocio.stripeCustomerId);
  console.log('  stripeMetodoPagoId:', negocio.stripeMetodoPagoId);

  const membresia = await db.membresia.findFirst({
    where: { negocioId: NEGOCIO_ID },
    include: { plan: { select: { precio: true, nombre: true } } }
  });
  console.log('\n[BD] Membresía:');
  console.log('  id     :', membresia.id);
  console.log('  plan   :', membresia.plan.nombre, '— precio:', membresia.plan.precio.toString(), 'MXN');
  console.log('  estado :', membresia.estado);

  const pagosAnteriores = await db.pagoMembresia.count({ where: { membresiaId: membresia.id } });
  console.log('\n[BD] PagosMembresia existentes:', pagosAnteriores, '(debe ser 0 tras limpieza)');

  // ── 5.1 COBRO EXITOSO ──────────────────────────────────────────
  console.log('\n─── 5.1 Cobro exitoso (tarjeta 4242) ───');
  const pagoRes = await post(
    `${BASE}/membresias/${membresia.id}/pago`,
    { periodo: PERIODO },
    AUTH
  );
  console.log('POST /api/membresias/' + membresia.id + '/pago');
  console.log('  HTTP Status:', pagoRes.status);
  console.log('  Response body:', JSON.stringify(pagoRes.data, null, 4));

  const pagoBD1 = await db.pagoMembresia.findFirst({
    where: { membresiaId: membresia.id, periodo: PERIODO },
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n[BD] PagoMembresia después del cobro:');
  console.log('  id             :', pagoBD1?.id);
  console.log('  periodo        :', pagoBD1?.periodo);
  console.log('  estado         :', pagoBD1?.estado);
  console.log('  stripePaymentId:', pagoBD1?.stripePaymentId);
  console.log('  monto          :', pagoBD1?.monto?.toString(), 'MXN');

  // ── 5.2 IDEMPOTENCIA ───────────────────────────────────────────
  console.log('\n─── 5.2 Idempotencia (mismo periodo, misma tarjeta) ───');
  const pagoRes2 = await post(
    `${BASE}/membresias/${membresia.id}/pago`,
    { periodo: PERIODO },
    AUTH
  );
  console.log('POST /api/membresias/' + membresia.id + '/pago (2do intento)');
  console.log('  HTTP Status:', pagoRes2.status);
  console.log('  Response body:', JSON.stringify(pagoRes2.data, null, 4));

  const countAfterRetry = await db.pagoMembresia.count({
    where: { membresiaId: membresia.id, periodo: PERIODO }
  });
  console.log('\n[BD] Cantidad de PagoMembresia para periodo', PERIODO, 'tras 2 llamadas:', countAfterRetry);
  console.log('  PaymentIntentId 1er intento:', pagoRes.data?.data?.paymentIntentId);
  console.log('  PaymentIntentId 2do intento:', pagoRes2.data?.data?.paymentIntentId);
  const mismaPI = pagoRes.data?.data?.paymentIntentId === pagoRes2.data?.data?.paymentIntentId;
  console.log('  Mismo PaymentIntent (idempotencia):', mismaPI ? '✅ SÍ' : '❌ NO');

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  PASO 5 COMPLETADO');
  console.log('════════════════════════════════════════════════════════════');

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error('FATAL:', e.message);
  await db.$disconnect();
  process.exit(1);
});
