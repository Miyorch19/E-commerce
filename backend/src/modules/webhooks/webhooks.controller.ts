import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { config } from '../../config/env';
import { stripe } from '../../config/stripe';
import * as webhooksService from './webhooks.service';
import { AppError } from '../../middlewares/errorHandler';

// ─── POST /webhooks/stripe ──────────────────────────────────────────────────

export async function stripeWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;

  try {
    // req.body DEBE ser el buffer original (express.raw)
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    await webhooksService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

// ─── POST /webhooks/stripe-connect ──────────────────────────────────────────

export async function stripeConnectWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookConnectSecret
    );
  } catch (err: any) {
    console.error(`⚠️ Connect Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    await webhooksService.handleStripeConnectWebhook(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}
