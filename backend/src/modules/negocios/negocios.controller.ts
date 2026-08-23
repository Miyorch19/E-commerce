import { Request, Response, NextFunction } from 'express';
import * as negociosService from './negocios.service';
import { AppError } from '../../middlewares/errorHandler';

// ─── POST /negocios/:id/stripe/onboarding ───────────────────────────────────────

export async function createStripeOnboarding(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Validación de seguridad: un usuario solo puede afectar a su propio negocio
    if (req.negocio?.id !== id) {
      throw new AppError('Forbidden: Tenant mismatch.', 403);
    }

    // Nota: Deberíamos requerir que req.usuario tenga un rol de administrador,
    // pero por ahora simplificamos la guardia de tenant.
    if (!req.usuario) {
      throw new AppError('Unauthorized: Panel user only.', 401);
    }

    const result = await negociosService.createStripeOnboardingLink(id);
    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}

// --- POST /negocios/:id/stripe/metodo-pago/setup-intent ---------------------

export async function createPlatformSetupIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (req.negocio?.id !== id) {
      throw new AppError('Forbidden: Tenant mismatch.', 403);
    }

    if (!req.usuario) {
      throw new AppError('Unauthorized: Panel user only.', 401);
    }

    const result = await negociosService.createPlatformSetupIntent(id);
    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}

export async function checkStripeAccountStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (req.negocio?.id !== id) {
      throw new AppError('Forbidden: Tenant mismatch.', 403);
    }

    if (!req.usuario) {
      throw new AppError('Unauthorized: Panel user only.', 401);
    }

    const result = await negociosService.checkStripeAccountStatus(id);
    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}

