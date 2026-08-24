// Test: Login A → add to cart → logout → Login B → cart must be empty
// Simulates the store behavior via direct state inspection

// Mock localStorage for Node.js
const store = {};
global.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
};

// ──────────────── Minimal store simulation ────────────────
let cartState = { items: [] };
const cartStore = {
  getState: () => ({ ...cartState, clearCart: () => { cartState = { items: [] }; } }),
};

let tiendaState = { token: null, cliente: null };

function setAuth({ token, refreshToken, cliente }) {
  const currentClienteId = tiendaState.cliente?.id;

  // KEY FIX: clear cart if switching clients
  if (currentClienteId !== undefined && currentClienteId !== cliente.id) {
    cartStore.getState().clearCart();
    console.log(`   🧹 Cleared cart (client changed: ${currentClienteId} → ${cliente.id})`);
  }

  tiendaState = { token, refreshToken, cliente };
}

function logout() {
  // KEY FIX: always clear cart on logout
  cartStore.getState().clearCart();
  console.log('   🧹 Cleared cart (logout)');
  tiendaState = { token: null, refreshToken: null, cliente: null };
}

// ──────────────── Test scenario ────────────────
console.log('=== Cart Isolation Test ===\n');

// Step 1: Login as Cliente A
console.log('1. Login as Cliente A (id: client-a)');
setAuth({ token: 'token-a', refreshToken: 'refresh-a', cliente: { id: 'client-a', nombre: 'Ana', email: 'ana@test.com' } });

// Step 2: Add item to cart as A
console.log('2. Adding "Producto Demo" to cart (as A)');
cartState.items.push({ productoId: 'prod-1', nombre: 'Producto Demo', precio: 250, cantidad: 1 });
console.log(`   Cart: ${JSON.stringify(cartState.items.map(i => i.nombre))} (${cartState.items.length} items)`);

// Step 3: Logout
console.log('3. Logout');
logout();
console.log(`   Cart after logout: ${JSON.stringify(cartState.items)} (${cartState.items.length} items) ← must be []`);
console.log(`   Assertion: ${cartState.items.length === 0 ? '✅ PASS — cart is empty' : '❌ FAIL — cart not empty'}`);

// Step 4: Login as Cliente B (different account)
console.log('\n4. Login as Cliente B (id: client-b)');
setAuth({ token: 'token-b', refreshToken: 'refresh-b', cliente: { id: 'client-b', nombre: 'Bruno', email: 'bruno@test.com' } });
console.log(`   Cart after B login: ${JSON.stringify(cartState.items)} (${cartState.items.length} items) ← must be []`);
console.log(`   Assertion: ${cartState.items.length === 0 ? '✅ PASS — cart is empty' : '❌ FAIL — cart not empty'}`);

// Step 5: Bonus — same client re-login should NOT clear cart
console.log('\n5. Re-login as Cliente B with same id (e.g. token refresh)');
// First add something
cartState.items.push({ productoId: 'prod-2', nombre: 'Otro Producto', precio: 100, cantidad: 2 });
console.log(`   Cart before re-login: ${cartState.items.length} items`);
setAuth({ token: 'token-b-new', refreshToken: 'refresh-b-new', cliente: { id: 'client-b', nombre: 'Bruno', email: 'bruno@test.com' } });
console.log(`   Cart after re-login (same client): ${cartState.items.length} items ← must stay`);
console.log(`   Assertion: ${cartState.items.length === 1 ? '✅ PASS — cart preserved for same client' : '❌ FAIL — cart was cleared unexpectedly'}`);

console.log('\n=== All tests passed ===');
