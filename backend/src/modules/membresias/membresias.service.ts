import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { AppError } from '../../middlewares/errorHandler';
import { EstadoMembresia, MetodoPago, EstadoPago } from '@prisma/client';

/**
 * Crea un PaymentIntent para el pago de la membresía del negocio.
 * Este pago va directo a la cuenta principal de la plataforma.
 */
export async function createStripePayment(
  membresiaId: string,
  negocioId: string,
  periodo: string
): Promise<{ status: string; paymentIntentId?: string; message?: string }> {
  const membresia = await prisma.membresia.findUnique({
    where: { id: membresiaId },
    include: {
      negocio: true,
      plan: true,
    },
  });

  if (!membresia || membresia.negocioId !== negocioId) {
    throw new AppError('Membership not found.', 404);
  }

  const { negocio } = membresia;

  if (!negocio.stripeCustomerId || !negocio.stripeMetodoPagoId) {
    throw new AppError(
      'El negocio no tiene un método de pago configurado para la facturación.',
      400
    );
  }

  const amountCents = Math.round(Number(membresia.plan.precio) * 100);
  const idempotencyKey = `membresia_${membresia.id}_${periodo}`;

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: 'mxn',
        customer: negocio.stripeCustomerId,
        payment_method: negocio.stripeMetodoPagoId,
        off_session: true,
        confirm: true,
        metadata: {
          membresiaId: membresia.id,
          negocioId: negocioId,
          periodo: periodo,
        },
      },
      { idempotencyKey }
    );

    // Guardar intención en PagoMembresia como APROBADO (si off_session+confirm tiene éxito sincrónico)
    // o PENDIENTE dependiendo de cómo configure Stripe el intent, pero success es success.
    await prisma.pagoMembresia.create({
      data: {
        membresiaId: membresia.id,
        monto: membresia.plan.precio,
        estado: paymentIntent.status === 'succeeded' ? EstadoPago.APROBADO : EstadoPago.PENDIENTE,
        metodo: MetodoPago.STRIPE,
        stripePaymentId: paymentIntent.id,
        periodo: periodo,
      },
    });

    return { status: 'succeeded', paymentIntentId: paymentIntent.id };
  } catch (error: any) {
    // Si la tarjeta pide autenticación 3D Secure
    if (error.type === 'StripeCardError' && error.code === 'authentication_required') {
      const paymentIntent = error.payment_intent;
      
      await prisma.pagoMembresia.create({
        data: {
          membresiaId: membresia.id,
          monto: membresia.plan.precio,
          estado: EstadoPago.REQUIERE_AUTENTICACION,
          metodo: MetodoPago.STRIPE,
          stripePaymentId: paymentIntent?.id || null,
          periodo: periodo,
        },
      });

      // TODO: Notificar al negocio para que ingrese al panel y reautentique la tarjeta
      return {
        status: 'authentication_required',
        paymentIntentId: paymentIntent?.id,
        message: 'La tarjeta requiere autenticación 3D Secure.',
      };
    } else if (error.type === 'StripeCardError') {
      // Otros rechazos de tarjeta (fondos insuficientes, declinada, etc.)
      const paymentIntent = error.payment_intent;

      await prisma.pagoMembresia.create({
        data: {
          membresiaId: membresia.id,
          monto: membresia.plan.precio,
          estado: EstadoPago.RECHAZADO,
          metodo: MetodoPago.STRIPE,
          stripePaymentId: paymentIntent?.id || null,
          periodo: periodo,
        },
      });

      return {
        status: 'failed',
        paymentIntentId: paymentIntent?.id,
        message: error.message || 'La tarjeta fue rechazada.',
      };
    }

    // Re-lanzar si es otro tipo de error (red, API, etc.)
    throw error;
  }
}
