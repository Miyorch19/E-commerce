import { Router, IRouter } from 'express';
import * as clientesController from './clientes.controller';
import { authenticate } from '../../middlewares/authenticate';

const router: IRouter = Router();

/**
 * POST /clientes/stripe/setup-intent
 * Requiere ser cliente final autenticado.
 */
router.post(
  '/stripe/setup-intent',
  authenticate,
  clientesController.createSetupIntent
);

export default router;
