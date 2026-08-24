const fs = require('fs');
const path = 'backend/src/modules/auth/auth.service.ts';
let content = fs.readFileSync(path, 'utf8');

// The file currently has the broken include:
const brokenInclude = 'include: { rol: { include: { rolPermisos: { include: { permiso: true } } } } },';
const fixedInclude = 'include: { rol: { include: { permisos: { include: { permiso: true } } } } },';

content = content.replaceAll(brokenInclude, fixedInclude);

// Fix mappings
content = content.replaceAll('rol?.rolPermisos?.map(rp =>', 'rol?.permisos?.map((rp: any) =>');

fs.writeFileSync(path, content, 'utf8');
console.log('done');
