const fs = require('fs');
const path = require('path');

const srcDir = 'C:/ReactProjects/Restaurante/restaurante-web/src';
const destPages = 'frontend/src/pages/tienda/plantillas/restaurante-clasico';
const destComps = 'frontend/src/components/tienda/plantillas/restaurante-clasico';

function replaceThemeClasses(code) {
  // Replace custom colors with standard tailwind arbitrary values that use CSS variables
  // text-accent -> text-[var(--color-accent)]
  // bg-accent -> bg-[var(--color-accent)]
  // bg-cream -> bg-[var(--color-primary)]
  // text-cream -> text-[var(--color-primary)]
  // text-dark -> text-[var(--color-dark)]
  // bg-dark -> bg-[var(--color-dark)]
  // font-serif -> font-[var(--font-serif)]
  // font-mono -> font-[var(--font-mono)]
  // border-accent -> border-[var(--color-accent)]
  // border-cream -> border-[var(--color-primary)]
  // border-dark -> border-[var(--color-dark)]

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

// 1. Layout.tsx
let layout = fs.readFileSync(path.join(srcDir, 'components/Layout.tsx'), 'utf8');
layout = replaceThemeClasses(layout);
fs.writeFileSync(path.join(destComps, 'Layout.tsx'), layout);

// 2. Navbar.tsx
let navbar = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf8');
navbar = replaceThemeClasses(navbar);
// Replace Links
navbar = navbar.replace(/to="\/menu"/g, 'to="/tienda/menu"');
navbar = navbar.replace(/to="\/nosotros"/g, 'to="/tienda/nosotros"');
navbar = navbar.replace(/to="\/"/g, 'to="/tienda"');
navbar = navbar.replace(/location.pathname === '\/'/g, "location.pathname === '/tienda'");
navbar = navbar.replace(/navigate\('\/'\)/g, "navigate('/tienda')");
// Use tenant store for title
navbar = navbar.replace(
  "export default function Navbar({ hasDarkHero = false }: { hasDarkHero?: boolean }) {",
  "import { useTenantStore } from '../../../../../stores/useTenantStore';\nexport default function Navbar({ hasDarkHero = false }: { hasDarkHero?: boolean }) {\n  const negocio = useTenantStore(s => s.negocio);"
);
navbar = navbar.replace(
  '<span className="not-italic">LA BOCA</span>',
  '<span className="not-italic">{negocio?.nombre || "LA BOCA"}</span>'
);
fs.writeFileSync(path.join(destComps, 'Navbar.tsx'), navbar);

// 3. Footer.tsx
let footer = fs.readFileSync(path.join(srcDir, 'components/Footer.tsx'), 'utf8');
footer = replaceThemeClasses(footer);
footer = footer.replace(/import { restaurantInfo } from '..\/data\/mock';/, "import { useTenantStore } from '../../../../../stores/useTenantStore';");
footer = footer.replace(
  "export default function Footer() {",
  "export default function Footer() {\n  const negocio = useTenantStore(s => s.negocio);"
);
// replace restaurantInfo with negocio
footer = footer.replace(/restaurantInfo\.redesSociales\.facebook/g, "negocio?.sitioWeb");
footer = footer.replace(/restaurantInfo\.redesSociales\.instagram/g, "negocio?.sitioWeb");
// (Simulate social links with sitioWeb for now to avoid errors)
fs.writeFileSync(path.join(destComps, 'Footer.tsx'), footer);

console.log('Components copied and updated.');
