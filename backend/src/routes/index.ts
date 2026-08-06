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

import negociosRouter from '../modules/negocios/negocios.router';
import pedidosRouter from '../modules/pedidos/pedidos.router';
import membresiasRouter from '../modules/membresias/membresias.router';
import clientesRouter from '../modules/clientes/clientes.router';

// Módulo auth (login, register, refresh, logout, me)
router.use('/auth', authRouter);

// Módulos de Stripe
router.use('/negocios', negociosRouter);
router.use('/pedidos', pedidosRouter);
router.use('/membresias', membresiasRouter);
router.use('/clientes', clientesRouter);

export default router;
