const fs = require('fs');
const path = require('path');

// 1. Footer.tsx
let footerPath = 'frontend/src/components/tienda/plantillas/restaurante-clasico/Footer.tsx';
let footer = fs.readFileSync(footerPath, 'utf8');
footer = footer.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/stores\/useTenantStore/g, '../../../../stores/useTenantStore');
footer = footer.replace(/const negocio = useTenantStore\(s => s\.negocio\);/g, 'const negocio = useTenantStore((s: any) => s.negocio);');
fs.writeFileSync(footerPath, footer);

// 2. Navbar.tsx
let navbarPath = 'frontend/src/components/tienda/plantillas/restaurante-clasico/Navbar.tsx';
let navbar = fs.readFileSync(navbarPath, 'utf8');
navbar = navbar.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/stores\/useTenantStore/g, '../../../../stores/useTenantStore');
navbar = navbar.replace(/const negocio = useTenantStore\(s => s\.negocio\);/g, 'const negocio = useTenantStore((s: any) => s.negocio);');
fs.writeFileSync(navbarPath, navbar);

// 3. Home.tsx
let homePath = 'frontend/src/pages/tienda/plantillas/restaurante-clasico/Home.tsx';
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(/restaurantInfo\.email/g, 'negocio?.email || ""');
home = home.replace(/restaurantInfo\.whatsapp/g, 'negocio?.whatsapp || ""');
home = home.replace(/const negocio = useTenantStore\(s => s\.negocio\);/g, 'const negocio = useTenantStore((s: any) => s.negocio);');
fs.writeFileSync(homePath, home);

// 4. index.tsx
let indexPath = 'frontend/src/pages/tienda/plantillas/restaurante-clasico/index.tsx';
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/import Layout from '\.\.\/\.\.\/\.\.\/components\/tienda\/plantillas\/restaurante-clasico\/Layout'/g, "import Layout from '../../../../components/tienda/plantillas/restaurante-clasico/Layout'");
fs.writeFileSync(indexPath, index);

// 5. Menu.tsx and About.tsx s => s.negocio
let menuPath = 'frontend/src/pages/tienda/plantillas/restaurante-clasico/Menu.tsx';
let menu = fs.readFileSync(menuPath, 'utf8');
menu = menu.replace(/const negocio = useTenantStore\(s => s\.negocio\);/g, 'const negocio = useTenantStore((s: any) => s.negocio);');
fs.writeFileSync(menuPath, menu);

let aboutPath = 'frontend/src/pages/tienda/plantillas/restaurante-clasico/About.tsx';
let about = fs.readFileSync(aboutPath, 'utf8');
about = about.replace(/const negocio = useTenantStore\(s => s\.negocio\);/g, 'const negocio = useTenantStore((s: any) => s.negocio);');
fs.writeFileSync(aboutPath, about);

console.log('Fixed imports');
