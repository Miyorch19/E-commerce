// E2E checkout test: creates a real pedido, generates a PaymentIntent, confirms it via Stripe SDK,
// and then verifies Pago.estado=APROBADO and Pedido.estado=CONFIRMADO in the DB.
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      host: 'localhost', port: 3001,
      path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: 'localhost', port: 3001, path, method: 'GET',
      headers
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const TENANT_HEADER = { 'X-Tenant-Domain': 'localhost', 'X-Auth-Context': 'tienda' };

  // 1. Login as cliente
  console.log('\n1. Login as cliente...');
  const loginRes = await post('/api/auth/login-cliente',
    { email: 'test@test.com', password: 'Test1234' },
    { 'X-Tenant-Domain': 'localhost' }
  );
  if (loginRes.status !== 200) {
    console.error('Login failed:', JSON.stringify(loginRes.data));
    process.exit(1);
  }
  const { accessToken } = loginRes.data.data;
  console.log('✅ Login OK, token acquired');

  const authHeaders = { ...TENANT_HEADER, 'Authorization': `Bearer ${accessToken}` };

  // 2. Get product list to find productoId
  console.log('\n2. Fetching productos...');
  const prodRes = await get('/api/productos', { 'X-Tenant-Domain': 'localhost' });
  const producto = prodRes.data.data[0];
  console.log(`✅ Producto: "${producto.nombre}" (id: ${producto.id}, precio: $${producto.precio})`);

  // 3. Create pedido
  console.log('\n3. POST /api/pedidos...');
  const pedidoRes = await post('/api/pedidos',
    { items: [{ productoId: producto.id, cantidad: 1 }] },
    authHeaders
  );
  if (pedidoRes.status !== 201) {
    console.error('Create pedido failed:', JSON.stringify(pedidoRes.data));
    process.exit(1);
  }
  const pedidoId = pedidoRes.data.data.id;
  console.log(`✅ Pedido creado: ${pedidoId}`);

  // 4. Create PaymentIntent
  console.log('\n4. POST /api/pedidos/:id/pago/stripe...');
  const piRes = await post(`/api/pedidos/${pedidoId}/pago/stripe`, {}, authHeaders);
  if (piRes.status !== 200) {
    console.error('Create PaymentIntent failed:', JSON.stringify(piRes.data));
    process.exit(1);
  }
  const { clientSecret } = piRes.data.data;
  const paymentIntentId = clientSecret.split('_secret_')[0];
  console.log(`✅ PaymentIntent: ${paymentIntentId}`);

  // 5. Confirm the PaymentIntent using test card
  console.log('\n5. Confirming PaymentIntent via Stripe SDK...');
  // Attach a test payment method
  const pm = await stripe.paymentMethods.create({
    type: 'card',
    card: { token: 'tok_visa' }
  });
  const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: pm.id,
    return_url: 'http://localhost:5173/tienda/checkout'
  });
  console.log(`✅ PaymentIntent status: ${confirmed.status}`);

  // 6. Wait a moment for webhook to fire
  console.log('\n6. Waiting 3s for webhook...');
  await new Promise(r => setTimeout(r, 3000));

  // 7. Check DB
  console.log('\n7. Checking DB...');
  const pago = await prisma.pago.findFirst({
    where: { pedidoId },
    orderBy: { createdAt: 'desc' }
  });
  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });

  console.log(`\n📋 Results:`);
  console.log(`   Pago.estado   = ${pago?.estado}`);
  console.log(`   Pedido.estado = ${pedido?.estado}`);
  console.log(`   Pedido.total  = ${pedido?.total}`);
  console.log(`   Pago.stripePI = ${pago?.stripePaymentId}`);

  const pagoOk = pago?.estado === 'APROBADO';
  const pedidoOk = pedido?.estado === 'CONFIRMADO';
  console.log(`\n${pagoOk && pedidoOk ? '🎉 BOTH STATES CORRECT' : '❌ MISMATCH DETECTED'}`);
  console.log(`   Pago APROBADO: ${pagoOk}`);
  console.log(`   Pedido CONFIRMADO: ${pedidoOk}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
