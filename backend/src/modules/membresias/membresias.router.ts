import { Router, IRouter } from 'express';
import * as membresiasController from './membresias.controller';
import { authenticate } from '../../middlewares/authenticate';

const router: IRouter = Router();

/**
 * POST /membresias/:id/pago
 * Requiere ser un usuario de panel autenticado (admin del negocio).
 */
router.post(
  '/:id/pago',
  authenticate,
  membresiasController.createStripePayment
);

export default router;
