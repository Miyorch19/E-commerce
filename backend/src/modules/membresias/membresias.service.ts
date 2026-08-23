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

  // Buscar si ya existe un intento de pago para este periodo
  const existingPago = await prisma.pagoMembresia.findUnique({
    where: {
      membresiaId_periodo: {
        membresiaId: membresia.id,
        periodo: periodo,
      },
    },
  });

  // Si ya existe y está APROBADO, no hacer nada y retornar éxito.
  if (existingPago?.estado === EstadoPago.APROBADO) {
    return { status: 'succeeded', paymentIntentId: existingPago.stripePaymentId };
  }

  const amountCents = Math.round(Number(membresia.plan.precio) * 100);
  // La key combina membresía + periodo + método de pago, de modo que:
  //   - Un reintento genuino (mismo periodo + misma tarjeta) reutiliza la key → Stripe deduplica.
  //   - Un cambio de tarjeta o de periodo genera una key distinta → Stripe crea un nuevo PaymentIntent.
  const idempotencyKey = `membresia_${membresia.id}_${periodo}_${negocio.stripeMetodoPagoId}`;

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

    const estadoNuevo = paymentIntent.status === 'succeeded' ? EstadoPago.APROBADO : EstadoPago.PENDIENTE;

    // Actualizar registro existente o crear uno nuevo
    await prisma.pagoMembresia.upsert({
      where: {
        membresiaId_periodo: {
          membresiaId: membresia.id,
          periodo: periodo,
        },
      },
      update: {
        estado: estadoNuevo,
        stripePaymentId: paymentIntent.id,
      },
      create: {
        membresiaId: membresia.id,
        monto: membresia.plan.precio,
        estado: estadoNuevo,
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
      
      await prisma.pagoMembresia.upsert({
        where: {
          membresiaId_periodo: {
            membresiaId: membresia.id,
            periodo: periodo,
          },
        },
        update: {
          estado: EstadoPago.REQUIERE_AUTENTICACION,
          stripePaymentId: paymentIntent?.id || null,
        },
        create: {
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

      await prisma.pagoMembresia.upsert({
        where: {
          membresiaId_periodo: {
            membresiaId: membresia.id,
            periodo: periodo,
          },
        },
        update: {
          estado: EstadoPago.RECHAZADO,
          stripePaymentId: paymentIntent?.id || null,
        },
        create: {
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
