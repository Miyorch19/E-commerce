import { Request, Response, NextFunction } from 'express';
import * as clientesService from './clientes.service';
import { AppError } from '../../middlewares/errorHandler';

// ─── POST /clientes/stripe/setup-intent ───────────────────────────────────────

export async function createSetupIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.negocio) {
      throw new AppError('Tenant not resolved.', 500);
    }

    if (!req.cliente) {
      throw new AppError('Unauthorized: Clients only.', 401);
    }

    const result = await clientesService.createSetupIntent(
      req.cliente.id,
      req.negocio.id
    );

    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}
