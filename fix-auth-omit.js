const fs = require('fs');
const p = 'backend/src/modules/auth/auth.service.ts';
let code = fs.readFileSync(p, 'utf8');

const target = \    const { passwordHash: _ph, rol, ...usuarioRest } = usuario;
    const permisos = rol?.permisos?.map((rp: any) => rp.permiso.clave) || [];
    const usuarioSafe = { ...usuarioRest, rol, permisos };\;

const targetWin = \    const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\r\n    const permisos = rol?.permisos?.map((rp: any) => rp.permiso.clave) || [];\r\n    const usuarioSafe = { ...usuarioRest, rol, permisos };\;

const target3 = \      const { passwordHash: _ph, rol, ...usuarioRest } = usuario;
      const permisos = rol?.permisos?.map((rp: any) => rp.permiso.clave) || [];
      const usuarioSafe = { ...usuarioRest, rol, permisos };\;

const target3Win = \      const { passwordHash: _ph, rol, ...usuarioRest } = usuario;\r\n      const permisos = rol?.permisos?.map((rp: any) => rp.permiso.clave) || [];\r\n      const usuarioSafe = { ...usuarioRest, rol, permisos };\;


const replacement = \    const { passwordHash: _ph, rol, ...usuarioRest } = usuario;
    const permisos = rol?.permisos?.map((rp: any) => rp.permiso.clave) || [];
    let rolSafe = undefined;
    if (rol) {
      const { permisos: _p, ...restRol } = rol;
      rolSafe = restRol;
    }
    const usuarioSafe = { ...usuarioRest, rol: rolSafe, permisos };\;

const replacement3 = \      const { passwordHash: _ph, rol, ...usuarioRest } = usuario;
      const permisos = rol?.permisos?.map((rp: any) => rp.permiso.clave) || [];
      let rolSafe = undefined;
      if (rol) {
        const { permisos: _p, ...restRol } = rol;
        rolSafe = restRol;
      }
      const usuarioSafe = { ...usuarioRest, rol: rolSafe, permisos };\;

code = code.replace(target, replacement);
code = code.replace(targetWin, replacement);

// The one in refreshAccessToken and loginGoogle might be indented more
code = code.replace(target3, replacement3);
code = code.replace(target3Win, replacement3);
// and one more time for the 3rd occurrence
code = code.replace(target3, replacement3);
code = code.replace(target3Win, replacement3);

fs.writeFileSync(p, code, 'utf8');
