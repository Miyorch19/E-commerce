import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { config } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';

/**
 * Inicia el proceso de Stripe Connect (Onboarding) para un negocio.
 * Si el negocio no tiene cuenta de Stripe, crea una tipo "express".
 * Luego, genera un Account Link para continuar el onboarding.
 */
export async function createStripeOnboardingLink(
  negocioId: string
): Promise<{ url: string }> {
  let negocio = await prisma.negocio.findUnique({
    where: { id: negocioId },
  });

  if (!negocio) {
    throw new AppError('Business not found.', 404);
  }

  // 1. Crear Stripe Account si no existe
  if (!negocio.stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company',
      company: {
        name: negocio.nombre,
      },
      email: negocio.email || undefined,
    });

    // Guardar el account ID en el negocio
    negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: { stripeAccountId: account.id },
    });
  }

  // 2. Generar Account Link para el onboarding
  const origin = config.baseDomain === 'localhost' ? 'http://localhost:5173' : `https://panel.${config.baseDomain}`;
  
  const accountLink = await stripe.accountLinks.create({
    account: negocio.stripeAccountId!,
    refresh_url: `${origin}/configuracion/pagos/reintentar`,
    return_url: `${origin}/configuracion/pagos/exito`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}

/**
 * Crea un SetupIntent en la cuenta principal de la plataforma para cobrarle la membresía al Negocio.
 */
export async function createPlatformSetupIntent(
  negocioId: string
): Promise<{ clientSecret: string }> {
  let negocio = await prisma.negocio.findUnique({
    where: { id: negocioId },
  });

  if (!negocio) {
    throw new AppError('Business not found.', 404);
  }

  // 1. Crear un Stripe Customer en la CUENTA PRINCIPAL si no existe
  let stripeCustomerId = negocio.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: negocio.email || undefined,
      name: negocio.nombre,
      metadata: {
        negocioId: negocio.id,
        tipo: 'negocio',
      },
    });
    stripeCustomerId = customer.id;

    await prisma.negocio.update({
      where: { id: negocio.id },
      data: { stripeCustomerId },
    });
  }

  // 2. Crear un SetupIntent para ese Customer
  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    metadata: {
      negocioId: negocio.id,
      tipo: 'negocio',
    },
  });

  return { clientSecret: setupIntent.client_secret! };
}

export async function checkStripeAccountStatus(negocioId: string) {
  const negocio = await prisma.negocio.findUnique({ where: { id: negocioId } });
  if (!negocio) throw new AppError('Business not found', 404);
  if (!negocio.stripeAccountId) throw new AppError('Stripe account not linked', 400);

  const account = await stripe.accounts.retrieve(negocio.stripeAccountId);
  const isComplete = account.charges_enabled && account.details_submitted;

  if (isComplete && !negocio.stripeOnboardingCompleto) {
    await prisma.negocio.update({
      where: { id: negocioId },
      data: { stripeOnboardingCompleto: true }
    });
  }

  return {
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    onboardingCompleto: isComplete || negocio.stripeOnboardingCompleto
  };
}

