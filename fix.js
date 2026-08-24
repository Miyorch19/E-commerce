const fs = require('fs');
const path = 'backend/src/modules/auth/auth.service.ts';
let content = fs.readFileSync(path, 'utf8');

const includeOld = 'include: { rol: true },';
const includeNew = 'include: { rol: { include: { rolPermisos: { include: { permiso: true } } } } },';

content = content.replaceAll(includeOld, includeNew);

content = content.replace(
  'const { passwordHash: _ph, ...usuarioSafe } = usuario;\r\n\r\n  return { accessToken, refreshToken, usuario: usuarioSafe };',
  'const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\r\n  const permisos = rol?.rolPermisos?.map(rp => rp.permiso.clave) || [];\r\n  const usuarioSafe = { ...usuarioRest, rol, permisos };\r\n\r\n  return { accessToken, refreshToken, usuario: usuarioSafe };'
);

content = content.replace(
  'const { passwordHash: _ph, ...usuarioSafe } = usuario;\n\n  return { accessToken, refreshToken, usuario: usuarioSafe };',
  'const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\n  const permisos = rol?.rolPermisos?.map(rp => rp.permiso.clave) || [];\n  const usuarioSafe = { ...usuarioRest, rol, permisos };\n\n  return { accessToken, refreshToken, usuario: usuarioSafe };'
);

content = content.replace(
  'const { passwordHash: _ph, ...usuarioSafe } = usuario;\r\n    return { accessToken, refreshToken, data: usuarioSafe, type: \'usuario\' };',
  'const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\r\n    const permisos = rol?.rolPermisos?.map(rp => rp.permiso.clave) || [];\r\n    const usuarioSafe = { ...usuarioRest, rol, permisos };\r\n    return { accessToken, refreshToken, data: usuarioSafe, type: \'usuario\' };'
);

content = content.replace(
  'const { passwordHash: _ph, ...usuarioSafe } = usuario;\n    return { accessToken, refreshToken, data: usuarioSafe, type: \'usuario\' };',
  'const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\n    const permisos = rol?.rolPermisos?.map(rp => rp.permiso.clave) || [];\n    const usuarioSafe = { ...usuarioRest, rol, permisos };\n    return { accessToken, refreshToken, data: usuarioSafe, type: \'usuario\' };'
);

content = content.replace(
  'return { accessToken };\r\n  }',
  'const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\r\n    const permisos = rol?.rolPermisos?.map(rp => rp.permiso.clave) || [];\r\n    const usuarioSafe = { ...usuarioRest, rol, permisos };\r\n\r\n    return { accessToken, usuario: usuarioSafe };\r\n  }'
);

content = content.replace(
  'return { accessToken };\n  }',
  'const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\n    const permisos = rol?.rolPermisos?.map(rp => rp.permiso.clave) || [];\n    const usuarioSafe = { ...usuarioRest, rol, permisos };\n\n    return { accessToken, usuario: usuarioSafe };\n  }'
);

content = content.replace(
  'Promise<{ accessToken: string }>',
  'Promise<{ accessToken: string; usuario?: Record<string, unknown> }>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
