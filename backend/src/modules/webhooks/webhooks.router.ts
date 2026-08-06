import { Router, IRouter } from 'express';
import * as webhooksController from './webhooks.controller';

const router: IRouter = Router();

/**
 * POST /api/webhooks/stripe
 * IMPORTANTE (Stripe Dashboard): Configura esto en el dashboard normal de webhooks (Direct).
 * Maneja eventos de la cuenta principal de la plataforma.
 * - payment_intent.succeeded
 * - setup_intent.succeeded
 * Requiere: STRIPE_WEBHOOK_SECRET
 */
router.post('/stripe', webhooksController.stripeWebhook);

/**
 * POST /api/webhooks/stripe-connect
 * IMPORTANTE (Stripe Dashboard): Configura esto como "Connect event destination".
 * Maneja eventos de las cuentas conectadas.
 * - account.updated
 * Requiere: STRIPE_CONNECT_WEBHOOK_SECRET
 */
router.post('/stripe-connect', webhooksController.stripeConnectWebhook);

export default router;
