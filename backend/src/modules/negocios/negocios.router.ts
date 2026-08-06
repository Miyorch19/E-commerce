import { Router, IRouter } from 'express';
import * as negociosController from './negocios.controller';
import { authenticate } from '../../middlewares/authenticate';
import { requirePermission } from '../../middlewares/requirePermission';

const router: IRouter = Router();

/**
 * POST /negocios/:id/stripe/onboarding
 * Requiere ser usuario del panel autenticado.
 */
router.post(
  '/:id/stripe/onboarding',
  authenticate,
  negociosController.createStripeOnboarding
);

/**
 * POST /negocios/:id/stripe/metodo-pago/setup-intent
 * Requiere ser usuario del panel autenticado y tener permiso facturacion:gestionar.
 */
router.post(
  '/:id/stripe/metodo-pago/setup-intent',
  authenticate,
  requirePermission('facturacion:gestionar'),
  negociosController.createPlatformSetupIntent
);

export default router;
