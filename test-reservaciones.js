const BASE = 'http://localhost:3001';
const TENANT_HEADERS = { 'Content-Type': 'application/json', 'X-Tenant-Domain': 'localhost' };

async function post(path, body, extraHeaders = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { ...TENANT_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function http(method, path, body, token) {
  const opts = {
    method,
    headers: { ...TENANT_HEADERS, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  return { status: res.status, data: await res.json() };
}

async function main() {
  // 1. Admin login
  console.log('\n=== 1. LOGIN ADMIN ===');
  const adminLogin = await post('/api/auth/login',
    { email: 'aldairhernandez763@gmail.com', password: 'Test1234' },
    { 'X-Auth-Context': 'panel' }
  );
  const adminToken = adminLogin.data?.data?.accessToken;
  console.log('Status:', adminLogin.status, '| Permisos:', adminLogin.data?.data?.usuario?.permisos);

  // 2. Register/login cliente
  console.log('\n=== 2. REGISTRAR/LOGIN CLIENTE ===');
  let clienteToken;
  const regRes = await post('/api/auth/register', {
    nombre: 'Cliente Test Reserva',
    email: 'reserva.test@example.com',
    password: 'Test1234!'
  });
  if (regRes.status === 201) {
    clienteToken = regRes.data?.data?.accessToken;
    console.log('Registro exitoso | Token:', clienteToken ? 'ok' : 'FAILED');
  } else {
    // Ya existe - login
    const loginRes = await post('/api/auth/login-cliente', {
      email: 'reserva.test@example.com', password: 'Test1234!'
    });
    clienteToken = loginRes.data?.data?.accessToken;
    console.log('Login existente status:', loginRes.status, '| Token:', clienteToken ? 'ok' : 'FAILED');
  }

  // 3. Crear zona Terraza cap 4
  console.log('\n=== 3. CREAR ZONA "Terraza Prueba" capacidad 4 ===');
  const zonaRes = await http('POST', '/api/tienda/panel/zonas', {
    nombre: 'Terraza Prueba',
    descripcion: 'Zona para test de solapamiento',
    capacidadMaxima: 4,
  }, adminToken);
  console.log('Status:', zonaRes.status);
  console.log(JSON.stringify(zonaRes.data, null, 2));
  const zonaId = zonaRes.data?.data?.id;

  // 4. Configurar horario viernes
  console.log('\n=== 4. HORARIO VIERNES 12:00-23:00 ===');
  const hRes = await http('PUT', '/api/tienda/panel/horario/VIERNES', {
    horaInicio: '12:00', horaFin: '23:00', activo: true
  }, adminToken);
  console.log('Status:', hRes.status, '|', hRes.data?.data?.dia, hRes.data?.data?.horaInicio, '-', hRes.data?.data?.horaFin);

  // 5. Calcular próximo viernes
  const hoy = new Date();
  const dia = hoy.getUTCDay();
  const diasHastaViernes = ((5 - dia + 7) % 7) || 7;
  const viernes = new Date(hoy);
  viernes.setUTCDate(hoy.getUTCDate() + diasHastaViernes);
  const fechaStr = viernes.toISOString().split('T')[0];
  console.log('\nFecha viernes para pruebas:', fechaStr);

  // 6. PRIMERA RESERVACIÓN: 4 personas a las 20:00 → DEBE ACEPTARSE
  console.log('\n=== 5. PRIMERA RESERVACIÓN: 4 personas a 20:00 (DEBE ACEPTARSE) ===');
  console.log('   zonaId:', zonaId, '| capacidadMaxima: 4 | duracionMinutos: 120 (20:00-22:00)');
  const r1 = await http('POST', '/api/tienda/reservaciones', {
    zonaId, fecha: fechaStr, horaInicio: '20:00', numeroPersonas: 4,
    notas: 'Mesa de cumpleaños - reserva completa',
  }, clienteToken);
  console.log('Status:', r1.status, '← Esperado: 201');
  console.log(JSON.stringify(r1.data, null, 2));

  // 7. SEGUNDA RESERVACIÓN: 1 persona a las 21:00 → DEBE RECHAZARSE
  // La reserva de 20:00-22:00 ocupa 4 personas.
  // La de 21:00-23:00 se solapa → total=5 > cap=4 → 422
  console.log('\n=== 6. SEGUNDA RESERVACIÓN: 1 persona a 21:00 (DEBE RECHAZARSE - SOLAPAMIENTO) ===');
  console.log('   Rango 21:00-23:00 solapa con 20:00-22:00 → total=5 > capacidad=4');
  const r2 = await http('POST', '/api/tienda/reservaciones', {
    zonaId, fecha: fechaStr, horaInicio: '21:00', numeroPersonas: 1,
    notas: 'Intento solapado',
  }, clienteToken);
  console.log('Status:', r2.status, '← Esperado: 422');
  console.log(JSON.stringify(r2.data, null, 2));

  // 8. Horario público con slots
  console.log('\n=== 7. GET /api/tienda/horario (slots calculados) ===');
  const hPub = await http('GET', '/api/tienda/horario', null, null);
  const vier = hPub.data?.data?.find(d => d.dia === 'VIERNES');
  if (vier) {
    console.log('VIERNES activo:', vier.activo);
    console.log('Primeros 8 slots:', vier.slots?.slice(0, 8));
    console.log('Total slots:', vier.slots?.length);
  }
}

main().catch(console.error);
