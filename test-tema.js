async function test() {
  const res = await fetch('http://localhost:3001/api/tienda/tema', {
    headers: { 'X-Tenant-Domain': 'localhost' }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
