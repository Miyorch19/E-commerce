require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const BASE_URL = 'http://localhost:3001/api';
const NEGOCIO_ID = 'cmsgz900j0000lee1qecmhag5';
const DOMINIO = 'localhost';
const EMAIL = 'aldairhernandez763@gmail.com';
const PASSWORD = 'Test1234';

async function main() {
  console.log('--- Iniciando Verificación E2E de Facturación ---');

  // 1. Iniciar sesión
  let token;
  try {
    console.log(`\n1. Iniciando sesión como ${EMAIL}...`);
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Tenant-Domain': DOMINIO, 
        'X-Auth-Context': 'panel' 
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    token = loginData.data.accessToken;
    console.log('   ✅ Login exitoso. Token obtenido.');
  } catch (error) {
    console.error('   ❌ Error en login:', error.message);
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Domain': DOMINIO,
    'X-Auth-Context': 'panel'
  };

  // 2. Crear SetupIntent
  let clientSecret;
  try {
    console.log(`\n2. Llamando a POST /negocios/${NEGOCIO_ID}/stripe/metodo-pago/setup-intent...`);
    const setupRes = await fetch(`${BASE_URL}/negocios/${NEGOCIO_ID}/stripe/metodo-pago/setup-intent`, {
      method: 'POST',
      headers: authHeaders
    });
    const setupData = await setupRes.json();
    if (!setupRes.ok) throw new Error(JSON.stringify(setupData));
    clientSecret = setupData.data.clientSecret;
    console.log('   ✅ SetupIntent creado exitosamente.');
    console.log('   Client Secret:', clientSecret);
  } catch (error) {
    console.error('   ❌ Error al crear SetupIntent:', error.message);
    return;
  }

  // 3. Confirmar SetupIntent vía API de Stripe (simulando frontend)
  let setupIntentId = clientSecret.split('_secret_')[0];
  try {
    console.log('\n3. Confirmando SetupIntent con tarjeta de prueba (4242) vía Stripe API...');
    
    // Necesitamos un PaymentMethod de prueba. Stripe permite crear uno usando la API.
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_visa' }, // token de prueba para 4242
    });

    const confirmedSetupIntent = await stripe.setupIntents.confirm(setupIntentId, {
      payment_method: paymentMethod.id,
    });
    
    console.log('   ✅ SetupIntent confirmado. Status:', confirmedSetupIntent.status);
  } catch (error) {
    console.error('   ❌ Error al confirmar SetupIntent:', error.message);
    return;
  }

  console.log('\n--- Esperando 3 segundos para que el webhook setup_intent.succeeded procese ---');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Verificar que el backend guardó el payment method id en el negocio
  // Ya que esto requeriría consultar prisma directamente o algún endpoint. Vamos a asumir que si el webhook corrió, lo guardó. 
  // Podremos verlo en db:check.

  console.log('\n--- Verificación parcial completada. ---');
}

main();
