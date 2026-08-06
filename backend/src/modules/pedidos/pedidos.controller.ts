import { Request, Response, NextFunction } from 'express';
import * as pedidosService from './pedidos.service';
import { AppError } from '../../middlewares/errorHandler';

// ─── POST /pedidos/:id/pago/stripe ────────────────────────────────────────────

export async function createStripePayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!req.negocio) {
      throw new AppError('Tenant not resolved.', 500);
    }

    if (!req.cliente) {
      throw new AppError('Unauthorized: Clients only.', 401);
    }

    const result = await pedidosService.createStripePayment(
      id,
      req.cliente.id,
      req.negocio.id
    );

    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}
