const fs = require('fs');
const p = 'frontend/src/api/negocios.ts';
let code = fs.readFileSync(p, 'utf8');

const injection = \getActual: () =>
    apiClient.get('/api/negocios/actual', { headers: { 'X-Auth-Context': 'panel' } }),

  stripeOnboarding:\;

code = code.replace('stripeOnboarding:', injection);
fs.writeFileSync(p, code, 'utf8');
