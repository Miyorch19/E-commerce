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
import productosRouter from '../modules/productos/productos.router';
import tiendaRouter from '../modules/tienda/tienda.router';
import reservacionesRouter from '../modules/reservaciones/reservaciones.router';
import cronRouter from '../cron/cron.router';

// Módulo auth (login, register, refresh, logout, me)
router.use('/auth', authRouter);

// Módulos de dominio
router.use('/negocios', negociosRouter);
router.use('/pedidos', pedidosRouter);
router.use('/membresias', membresiasRouter);
router.use('/clientes', clientesRouter);
router.use('/productos', productosRouter);
router.use('/tienda', tiendaRouter);
router.use('/tienda', reservacionesRouter);

// Módulo de administración interna (cron)
router.use('/admin/cron', cronRouter);

export default router;
