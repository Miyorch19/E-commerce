async function test() {
  try {
    console.log('--- 1. Login ---');
    const resLogin = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Context': 'panel',
        'X-Tenant-Domain': 'localhost'
      },
      body: JSON.stringify({
        email: 'aldairhernandez763@gmail.com',
        password: 'Test1234'
      })
    });
    const loginData = await resLogin.json();
    console.log('Token:', loginData.data.accessToken ? 'OK' : 'FAIL');
    console.log('Usuario permisos:', loginData.data.usuario.permisos);
    console.log('Usuario rol.permisos (debe ser undefined):', loginData.data.usuario.rol.permisos);
    
    const token = loginData.data.accessToken;
    
    console.log('\n--- 2. Fetch Negocio Actual ---');
    const resNegocio = await fetch('http://localhost:3001/api/negocios/actual', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'X-Auth-Context': 'panel',
        'X-Tenant-Domain': 'localhost'
      }
    });
    const negocioData = await resNegocio.json();
    console.log('Negocio ID:', negocioData.data.id);
    console.log('Negocio Nombre:', negocioData.data.nombre);
    const negocioId = negocioData.data.id;
    
    console.log('\n--- 3. Crear Setup Intent de Facturacion ---');
    const resBilling = await fetch('http://localhost:3001/api/negocios/' + negocioId + '/stripe/metodo-pago/setup-intent', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'X-Auth-Context': 'panel',
        'X-Tenant-Domain': 'localhost'
      }
    });
    const billingData = await resBilling.json();
    console.log('Respuesta Setup Intent:', JSON.stringify(billingData, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
