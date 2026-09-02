import Stripe from 'stripe';
import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { EstadoPago, EstadoMembresia, EstadoPedido, Prisma } from '@prisma/client';
import { invalidateNegocioCache } from '../../middlewares/resolveTenant';

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  try {
    await prisma.webhookEventProcesado.create({
      data: {
        id: event.id,
        tipo: event.type,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      console.log(`⏭️ Webhook event ${event.id} already processed. Skipping.`);
      return;
    }
    throw error;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        if (metadata && metadata.pedidoId) {
          // Es el pago de un pedido (Connect destination charge)
          await prisma.pago.updateMany({
            where: {
              pedidoId: metadata.pedidoId,
              stripePaymentId: paymentIntent.id,
            },
            data: { estado: EstadoPago.APROBADO },
          });

          // Sincronizar el estado del Pedido a CONFIRMADO
          await prisma.pedido.update({
            where: { id: metadata.pedidoId },
            data: { estado: EstadoPedido.CONFIRMADO },
          });
        } else if (metadata && metadata.membresiaId) {
          // Es el pago de una membresía a la plataforma
          await prisma.pagoMembresia.updateMany({
            where: {
              membresiaId: metadata.membresiaId,
              stripePaymentId: paymentIntent.id,
            },
            data: { estado: 'APROBADO' },
          });

          await prisma.membresia.update({
            where: { id: metadata.membresiaId },
            data: { estado: EstadoMembresia.ACTIVA },
          });
        }
        break;
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        const metadata = setupIntent.metadata;

        if (metadata && setupIntent.payment_method) {
          // Recuperar detalles de la tarjeta desde Stripe
          const paymentMethod = await stripe.paymentMethods.retrieve(
            setupIntent.payment_method as string
          );

          if (paymentMethod.type === 'card' && paymentMethod.card) {
            if (metadata.tipo === 'cliente' && metadata.clienteId) {
              // Guardar en la base de datos de cliente final
              await prisma.metodoPagoCliente.create({
                data: {
                  clienteId: metadata.clienteId,
                  stripeCustomerId: setupIntent.customer as string,
                  stripePaymentMethod: paymentMethod.id,
                  tipo: 'tarjeta',
                  ultimosCuatro: paymentMethod.card.last4,
                  marca: paymentMethod.card.brand,
                  expMes: paymentMethod.card.exp_month,
                  expAnio: paymentMethod.card.exp_year,
                },
              });
            } else if (metadata.tipo === 'negocio' && metadata.negocioId) {
              // Guardar en el negocio principal
              await prisma.negocio.update({
                where: { id: metadata.negocioId },
                data: { stripeMetodoPagoId: paymentMethod.id },
              });
              invalidateNegocioCache(metadata.negocioId);
            }
          }
        }
        break;
      }

      // Manejar otros eventos si es necesario (e.g. payment_intent.payment_failed)
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (businessError) {
    console.error(`🚨 Error processing webhook event ${event.id}:`, businessError);
    // No borramos el registro de WebhookEventProcesado para evitar reprocesar un cargo en caso de retry,
    // es preferible revisión manual.
    throw businessError;
  }
}

export async function handleStripeConnectWebhook(event: Stripe.Event): Promise<void> {
  try {
    await prisma.webhookEventProcesado.create({
      data: {
        id: event.id,
        tipo: event.type,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      console.log(`⚠️ Webhook Connect event ${event.id} already processed. Skipping.`);
      return;
    }
    throw error;
  }

  try {
    switch (event.type) {
      case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      // Stripe manda `details_submitted: true` cuando el onboarding básico está listo
      if (account.details_submitted) {
        const negocios = await prisma.negocio.findMany({
          where: { stripeAccountId: account.id },
          select: { id: true },
        });
        await prisma.negocio.updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboardingCompleto: true },
        });
        negocios.forEach((n) => invalidateNegocioCache(n.id));
      }
      break;
    }
    
    // Manejar otros eventos de Connect si es necesario
    default:
        console.log(`Unhandled connect event type ${event.type}`);
    }
  } catch (businessError) {
    console.error(`🚨 Error processing connect webhook event ${event.id}:`, businessError);
    throw businessError;
  }
}
