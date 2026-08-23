require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

const db = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

function sep(title) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // ── PASO 1: Login ──────────────────────────────────────────────
  sep('PASO 1 — Login + verificar permiso facturacion:gestionar');

  const loginResult = await post(`${BASE}/auth/login`,
    { email: EMAIL, password: PASSWORD },
    { 'X-Tenant-Domain': DOMINIO, 'X-Auth-Context': 'panel' }
  );

  console.log('POST /api/auth/login');
  console.log('  HTTP Status:', loginResult.status);

  if (loginResult.status !== 200) {
    console.error('  ❌ Login falló:', JSON.stringify(loginResult.data));
    await db.$disconnect();
    return;
  }

  const { accessToken, usuario: usuarioData } = loginResult.data.data;
  console.log('  accessToken (primeros 40 chars):', accessToken.substring(0, 40) + '...');
  console.log('  usuario.id:', usuarioData.id);
  console.log('  usuario.email:', usuarioData.email);
  console.log('  usuario.rol:', usuarioData.rol?.nombre);

  // Verificar permiso en BD directamente
  const tienePermiso = await db.rolPermiso.findFirst({
    where: {
      rol: { usuarios: { some: { id: usuarioData.id } } },
      permiso: { clave: 'facturacion:gestionar' }
    },
    include: { permiso: { select: { clave: true } } }
  });
  console.log('\n  [BD] rolPermiso para facturacion:gestionar:');
  console.log('  ', tienePermiso ? `✅ ENCONTRADO — permisoId: ${tienePermiso.permisoId}, clave: "${tienePermiso.permiso.clave}"` : '❌ NO ENCONTRADO');

  const AUTH_HEADERS = {
    'Authorization': `Bearer ${accessToken}`,
    'X-Tenant-Domain': DOMINIO,
    'X-Auth-Context': 'panel',
  };

  // ── PASO 2: SetupIntent ────────────────────────────────────────
  sep('PASO 2 — POST /api/negocios/:id/stripe/metodo-pago/setup-intent');

  // Limpiar stripeMetodoPagoId anterior para prueba limpia
  await db.negocio.update({ where: { id: NEGOCIO_ID }, data: { stripeMetodoPagoId: null } });
  console.log('  [PRE] stripeMetodoPagoId limpiado a null para prueba limpia');

  const setupResult = await post(
    `${BASE}/negocios/${NEGOCIO_ID}/stripe/metodo-pago/setup-intent`,
    {},
    AUTH_HEADERS
  );
  console.log('\nPOST /api/negocios/:id/stripe/metodo-pago/setup-intent');
  console.log('  HTTP Status:', setupResult.status);
  console.log('  Response body:', JSON.stringify(setupResult.data, null, 4));

  if (setupResult.status !== 200) {
    console.error('  ❌ SetupIntent falló');
    await db.$disconnect();
    return;
  }

  const clientSecret = setupResult.data.data.clientSecret;
  const setupIntentId = clientSecret.split('_secret_')[0];
  console.log('\n  setupIntentId:', setupIntentId);

  // Verificar que stripeCustomerId fue guardado
  const negocioAfterSetup = await db.negocio.findUnique({ where: { id: NEGOCIO_ID }, select: { stripeCustomerId: true, stripeMetodoPagoId: true } });
  console.log('  [BD] Negocio.stripeCustomerId:', negocioAfterSetup.stripeCustomerId);
  console.log('  [BD] Negocio.stripeMetodoPagoId (antes de webhook):', negocioAfterSetup.stripeMetodoPagoId);

  // Verificar metadata.tipo en Stripe
  const siRaw = await stripe.setupIntents.retrieve(setupIntentId);
  console.log('  [Stripe] setupIntent.metadata:', JSON.stringify(siRaw.metadata));

  // ── PASO 3: Confirmar SetupIntent con tarjeta 4242 ──────────────
  sep('PASO 3 — Confirmar SetupIntent con tarjeta 4242 4242 4242 4242');

  const pm = await stripe.paymentMethods.create({
    type: 'card',
    card: { token: 'tok_visa' },
  });
  console.log('  PaymentMethod creado:', pm.id, '| brand:', pm.card.brand, '| last4:', pm.card.last4, '| exp:', pm.card.exp_month + '/' + pm.card.exp_year);

  const confirmed = await stripe.setupIntents.confirm(setupIntentId, {
    payment_method: pm.id,
  });
  console.log('  SetupIntent.status después de confirm:', confirmed.status);
  console.log('  SetupIntent.payment_method:', confirmed.payment_method);

  // ── PASO 4: Webhook setup_intent.succeeded ─────────────────────
  sep('PASO 4 — Webhook setup_intent.succeeded → Negocio.stripeMetodoPagoId');

  console.log('  Esperando 5s para que stripe listen entregue el webhook...');
  await sleep(5000);

  const negocioAfterWebhook = await db.negocio.findUnique({
    where: { id: NEGOCIO_ID },
    select: { stripeCustomerId: true, stripeMetodoPagoId: true }
  });
  console.log('  [BD] Negocio.stripeCustomerId :', negocioAfterWebhook.stripeCustomerId);
  console.log('  [BD] Negocio.stripeMetodoPagoId:', negocioAfterWebhook.stripeMetodoPagoId);

  const webhookEvt = await db.webhookEventProcesado.findFirst({
    where: { tipo: 'setup_intent.succeeded' },
    orderBy: { procesadoEn: 'desc' }
  });
  console.log('  [BD] WebhookEventProcesado más reciente de tipo setup_intent.succeeded:');
  console.log('    id:', webhookEvt?.id);
  console.log('    tipo:', webhookEvt?.tipo);
  console.log('    createdAt:', webhookEvt?.createdAt);

  const metodoGuardado = negocioAfterWebhook.stripeMetodoPagoId;
  if (!metodoGuardado) {
    console.log('\n  ⚠️  stripeMetodoPagoId todavía null — webhook aún no procesado o stripe listen no forwarding.');
    console.log('  Asignando manualmente desde Stripe para continuar con Paso 5...');
    const pms = await stripe.paymentMethods.list({ customer: negocioAfterWebhook.stripeCustomerId, type: 'card' });
    if (pms.data.length > 0) {
      await db.negocio.update({ where: { id: NEGOCIO_ID }, data: { stripeMetodoPagoId: pms.data[0].id } });
      console.log('  [BD] stripeMetodoPagoId asignado manualmente:', pms.data[0].id);
    }
  } else {
    console.log('\n  ✅ stripeMetodoPagoId actualizado por webhook:', metodoGuardado);
  }

  // ── PASO 5: Pago de membresía ──────────────────────────────────
  sep('PASO 5 — POST /api/membresias/:id/pago (periodo ' + PERIODO + ')');

  const membresia = await db.membresia.findFirst({ where: { negocioId: NEGOCIO_ID } });
  console.log('  membresiaId:', membresia.id);
  console.log('  plan.precio: 499.00 MXN');

  // Limpiar pago anterior del mismo periodo para esta prueba
  await db.pagoMembresia.deleteMany({ where: { membresiaId: membresia.id, periodo: PERIODO } });
  console.log('  [PRE] PagoMembresia del periodo', PERIODO, 'eliminado para prueba limpia');

  const pagoResult = await post(
    `${BASE}/membresias/${membresia.id}/pago`,
    { periodo: PERIODO },
    AUTH_HEADERS
  );
  console.log('\nPOST /api/membresias/:id/pago');
  console.log('  HTTP Status:', pagoResult.status);
  console.log('  Response body:', JSON.stringify(pagoResult.data, null, 4));

  // Estado en BD
  const pagoEnBD = await db.pagoMembresia.findFirst({
    where: { membresiaId: membresia.id, periodo: PERIODO },
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n  [BD] PagoMembresia resultado:');
  console.log('    id:', pagoEnBD?.id);
  console.log('    periodo:', pagoEnBD?.periodo);
  console.log('    estado:', pagoEnBD?.estado);
  console.log('    stripePaymentId:', pagoEnBD?.stripePaymentId);
  console.log('    monto:', pagoEnBD?.monto?.toString(), 'MXN');

  console.log('\n\n' + '═'.repeat(60));
  console.log('  VERIFICACIÓN E2E COMPLETADA');
  console.log('═'.repeat(60));

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error('FATAL:', e);
  await db.$disconnect();
  process.exit(1);
});
