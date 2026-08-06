import { Router, IRouter } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.router';
import { resolveTenant } from '../middlewares/resolveTenant';

const router: IRouter = Router();

// ── Sin tenant: health check público ─────────────────────────────────────────
router.use(healthRouter);

// ── Con tenant: todo lo demás requiere resolver el negocio ────────────────────
// resolveTenant corre antes de auth y cualquier módulo de negocio
router.use(resolveTenant);

// Módulo auth (login, register, refresh, logout, me)
router.use('/auth', authRouter);

// Aquí se montarán los módulos futuros (ya con tenant resuelto):
// router.use('/negocios',    authenticate, negociosRouter);
// router.use('/catalogo',    authenticate, catalogoRouter);
// router.use('/pedidos',     authenticate, pedidosRouter);
// router.use('/citas',       authenticate, citasRouter);
// router.use('/clientes',    authenticate, clientesRouter);
// router.use('/membresias',  authenticate, membresiasRouter);

export default router;
