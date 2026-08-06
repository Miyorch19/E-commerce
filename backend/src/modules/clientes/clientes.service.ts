import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { AppError } from '../../middlewares/errorHandler';

/**
 * Crea un SetupIntent para que un cliente pueda guardar una tarjeta de crédito para uso futuro.
 */
export async function createSetupIntent(
  clienteId: string,
  negocioId: string
): Promise<{ clientSecret: string }> {
  let cliente = await prisma.clienteAuth.findUnique({
    where: { id: clienteId },
  });

  if (!cliente || cliente.negocioId !== negocioId) {
    throw new AppError('Client not found.', 404);
  }

  // 1. Crear un Stripe Customer si el cliente no tiene uno
  let stripeCustomerId = cliente.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: cliente.email,
      name: cliente.nombre,
      metadata: {
        clienteId: cliente.id,
        negocioId: negocioId,
        tipo: 'cliente',
      },
    });
    stripeCustomerId = customer.id;

    await prisma.clienteAuth.update({
      where: { id: cliente.id },
      data: { stripeCustomerId },
    });
  }

  // 2. Crear un SetupIntent para ese Customer
  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    metadata: {
      clienteId: cliente.id,
      negocioId: negocioId,
      tipo: 'cliente',
    },
  });

  return { clientSecret: setupIntent.client_secret! };
}
