const fs = require('fs');

// Update negocios.controller.ts
const ctrlPath = 'backend/src/modules/negocios/negocios.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');
ctrl += "\n\nexport async function getNegocioActual(\n  req: Request,\n  res: Response,\n  next: NextFunction\n): Promise<void> {\n  try {\n    if (!req.negocio) {\n      throw new AppError('Tenant not resolved.', 500);\n    }\n    res.status(200).json({ status: 'ok', data: req.negocio });\n  } catch (error) {\n    next(error);\n  }\n}\n";
fs.writeFileSync(ctrlPath, ctrl, 'utf8');

// Update negocios.router.ts
const routerPath = 'backend/src/modules/negocios/negocios.router.ts';
let router = fs.readFileSync(routerPath, 'utf8');
router = router.replace(
  "export default router;",
  "router.get('/actual', authenticate, negociosController.getNegocioActual);\n\nexport default router;"
);
fs.writeFileSync(routerPath, router, 'utf8');

console.log('Backend endpoints updated');
