import Stripe from 'stripe';
import { config } from './env';

// Singleton del cliente de Stripe
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-01-27.acacia' as any, // silenciar ts con "as any"
});
