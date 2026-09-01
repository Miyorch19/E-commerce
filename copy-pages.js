const fs = require('fs');
const path = require('path');

const srcDir = 'C:/ReactProjects/Restaurante/restaurante-web/src';
const destPages = 'frontend/src/pages/tienda/plantillas/restaurante-clasico';
const destComps = 'frontend/src/components/tienda/plantillas/restaurante-clasico';

function replaceThemeClasses(code) {
  return code
    .replace(/\btext-accent\b/g, 'text-[var(--color-accent)]')
    .replace(/\bbg-accent\b/g, 'bg-[var(--color-accent)]')
    .replace(/\bborder-accent\b/g, 'border-[var(--color-accent)]')
    .replace(/\btext-cream\b/g, 'text-[var(--color-primary)]')
    .replace(/\bbg-cream\b/g, 'bg-[var(--color-primary)]')
    .replace(/\bborder-cream\b/g, 'border-[var(--color-primary)]')
    .replace(/\btext-dark\b/g, 'text-[var(--color-dark)]')
    .replace(/\bbg-dark\b/g, 'bg-[var(--color-dark)]')
    .replace(/\bborder-dark\b/g, 'border-[var(--color-dark)]')
    .replace(/\bfont-serif\b/g, 'font-[var(--font-serif)]')
    .replace(/\bfont-mono\b/g, 'font-[var(--font-mono)]');
}

// 1. Home.tsx
let home = fs.readFileSync(path.join(srcDir, 'pages/Home.tsx'), 'utf8');
home = replaceThemeClasses(home);
home = home.replace(/import { restaurantInfo, menuItems } from '\.\.\/data\/mock';/, "import { useTenantStore } from '../../../../stores/useTenantStore';\nimport { useProductos } from '../../../../hooks/useProductos';");
home = home.replace(
  "export default function Home() {",
  "export default function Home() {\n  const negocio = useTenantStore(s => s.negocio);\n  const { productos: menuItems } = useProductos();"
);
home = home.replace(/import { useLayoutConfig } from '\.\.\/components\/Layout';/, "import { useLayoutConfig } from '../../../../components/tienda/plantillas/restaurante-clasico/Layout';");
home = home.replace(/to="\/menu"/g, 'to="/tienda/menu"');
fs.writeFileSync(path.join(destPages, 'Home.tsx'), home);

// 2. Menu.tsx
let menu = fs.readFileSync(path.join(srcDir, 'pages/Menu.tsx'), 'utf8');
menu = replaceThemeClasses(menu);
menu = menu.replace(/import { menuItems, restaurantInfo } from '\.\.\/data\/mock';/, "import { useTenantStore } from '../../../../stores/useTenantStore';\nimport { useProductos } from '../../../../hooks/useProductos';");
menu = menu.replace(/import type { MenuItem } from '\.\.\/types';/, "import type { MenuItem } from '../../../../hooks/useProductos';");
menu = menu.replace(
  "export default function Menu() {",
  "export default function Menu() {\n  const negocio = useTenantStore(s => s.negocio);\n  const { productos: menuItems } = useProductos();"
);
menu = menu.replace(/restaurantInfo\.nombrePrincipal/g, 'negocio?.nombre || ""');
fs.writeFileSync(path.join(destPages, 'Menu.tsx'), menu);

// 3. About.tsx
let about = fs.readFileSync(path.join(srcDir, 'pages/About.tsx'), 'utf8');
about = replaceThemeClasses(about);
about = about.replace(/import { restaurantInfo } from '\.\.\/data\/mock';/, "import { useTenantStore } from '../../../../stores/useTenantStore';");
about = about.replace(/import { useLayoutConfig } from '\.\.\/components\/Layout';/, "import { useLayoutConfig } from '../../../../components/tienda/plantillas/restaurante-clasico/Layout';");
about = about.replace(
  "export default function About() {",
  "export default function About() {\n  const negocio = useTenantStore(s => s.negocio);"
);
about = about.replace(/restaurantInfo\.nombrePrincipal/g, 'negocio?.nombre || ""');
fs.writeFileSync(path.join(destPages, 'About.tsx'), about);

console.log('Pages copied and updated.');
