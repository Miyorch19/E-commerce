const API = 'http://localhost:3001';
const HEADERS = {
  'Content-Type': 'application/json',
  'X-Tenant-Domain': 'localhost',
};

async function req(method, path, body, token) {
  const headers = { ...HEADERS };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const json = await res.json();
  return { status: res.status, json };
}

async function runVerification() {
  console.log('--- STEP 1: AUTHENTICATE CLIENT ---');
  let clienteToken;
  const reg = await req('POST', '/api/auth/register', {
    nombre: 'Cliente Frontend Verification',
    email: 'frontend.test@example.com',
    password: 'Password123!',
  });
  if (reg.status === 201) {
    clienteToken = reg.json.data.accessToken;
  } else {
    const login = await req('POST', '/api/auth/login-cliente', {
      email: 'frontend.test@example.com',
      password: 'Password123!',
    });
    clienteToken = login.json.data.accessToken;
  }
  console.log('Client token obtained:', !!clienteToken);

  console.log('\n--- STEP 2: GET ZONAS ---');
  const zonasRes = await req('GET', '/api/tienda/zonas');
  console.log('Status:', zonasRes.status);
  console.log('Active zones:', zonasRes.json.data?.map(z => ({ id: z.id, nombre: z.nombre, cap: z.capacidadMaxima })));
  const zona = zonasRes.json.data?.find(z => z.capacidadMaxima === 4) || zonasRes.json.data?.[0];

  console.log('\n--- STEP 3: GET HORARIO ---');
  const horarioRes = await req('GET', '/api/tienda/horario');
  console.log('Status:', horarioRes.status);

  // Compute next Friday
  const d = new Date();
  const day = d.getUTCDay();
  const diff = ((5 - day + 7) % 7) || 7;
  const friday = new Date(d);
  friday.setUTCDate(d.getUTCDate() + diff);
  const dateStr = friday.toISOString().split('T')[0];
  console.log('Test date (Friday):', dateStr);

  console.log('\n--- STEP 4: CREATE VALID RESERVATION (20:00, 4 pers) ---');
  const r1 = await req('POST', '/api/tienda/reservaciones', {
    zonaId: zona.id,
    fecha: dateStr,
    horaInicio: '20:00',
    numeroPersonas: 4,
    notas: 'Mesa exterior',
  }, clienteToken);
  console.log('Status:', r1.status);
  console.log('Response:', JSON.stringify(r1.json, null, 2));

  console.log('\n--- STEP 5: CREATE OVERLAPPING RESERVATION (21:00, 1 pers) ---');
  const r2 = await req('POST', '/api/tienda/reservaciones', {
    zonaId: zona.id,
    fecha: dateStr,
    horaInicio: '21:00',
    numeroPersonas: 1,
    notas: 'Solapado test',
  }, clienteToken);
  console.log('Status:', r2.status);
  console.log('422 Response Error Message:', JSON.stringify(r2.json, null, 2));

  console.log('\n--- STEP 6: GET MIS RESERVACIONES ---');
  const misRes = await req('GET', '/api/tienda/reservaciones/mis-reservaciones', null, clienteToken);
  console.log('Status:', misRes.status);
  console.log('Reservations count:', misRes.json.data?.length);
  const createdRes = misRes.json.data?.find(r => r.id === r1.json.data?.id);
  console.log('Created Reservation in list:', createdRes);

  console.log('\n--- STEP 7: CANCEL RESERVATION ---');
  if (createdRes) {
    const cancelRes = await req('PATCH', `/api/tienda/reservaciones/${createdRes.id}/cancelar`, null, clienteToken);
    console.log('Status:', cancelRes.status);
    console.log('Cancelled Reservation Status:', cancelRes.json.data?.estado);
  }
}

runVerification().catch(console.error);
