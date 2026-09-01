const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/font-\[var\(--font-serif\)]/g, 'font-[family-name:var(--font-serif)]');
      content = content.replace(/font-\[var\(--font-mono\)]/g, 'font-[family-name:var(--font-mono)]');
      fs.writeFileSync(fullPath, content);
    }
  }
}

fixFiles('frontend/src/pages/tienda/plantillas/restaurante-clasico');
fixFiles('frontend/src/components/tienda/plantillas/restaurante-clasico');

console.log('Fixed font arbitrary values');
