const bcryptjs = require('bcryptjs');

const hash = '$2b$12$PdbXQVREc5bfu7qbUBpVr.oyBfWhdeGo6f1YYB0Hd0H8sqr3Yb9pe';
const passwords = ['test', 'Test1234', 'password', '123456', 'test123'];

async function main() {
  for (const pw of passwords) {
    const match = await bcryptjs.compare(pw, hash);
    console.log(`"${pw}" -> ${match ? '✅ MATCH' : '❌'}`);
  }
}
main();
