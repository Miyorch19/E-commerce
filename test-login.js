
async function testLogin() {
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
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
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
testLogin();
