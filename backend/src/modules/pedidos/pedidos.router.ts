import { Router, IRouter } from 'express';
import * as pedidosController from './pedidos.controller';
import { authenticate } from '../../middlewares/authenticate';

const router: IRouter = Router();

/**
 * POST /pedidos/:id/pago/stripe
 * Requiere ser un cliente final autenticado.
 */
router.post(
  '/:id/pago/stripe',
  authenticate,
  pedidosController.createStripePayment
);

export default router;
