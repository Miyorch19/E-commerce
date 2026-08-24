import { Router, IRouter } from 'express';
import * as productosController from './productos.controller';

const router: IRouter = Router();

/**
 * GET /api/productos
 * Retorna los productos activos del negocio. Pblico (sólo requiere resolveTenant).
 */
router.get('/', productosController.getProducts);

/**
 * GET /api/productos/:id
 * Retorna el detalle de un producto activo. Pblico.
 */
router.get('/:id', productosController.getProductById);

export default router;
