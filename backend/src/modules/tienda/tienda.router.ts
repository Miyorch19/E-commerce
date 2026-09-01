import { Router, IRouter } from 'express';
import * as tiendaController from './tienda.controller';

const router: IRouter = Router();

/**
 * GET /api/tienda/tema
 * Retorna el Tema y Tokens de Diseño del negocio actual. Público (sólo requiere resolveTenant).
 */
router.get('/tema', tiendaController.getTema);

export default router;
