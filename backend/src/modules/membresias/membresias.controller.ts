import { Request, Response, NextFunction } from 'express';
import * as membresiasService from './membresias.service';
import { AppError } from '../../middlewares/errorHandler';

/**
 * ─── POST /membresias/:id/pago ────────────────────────────────────────────────
 * Este endpoint está diseñado para ser invocado por un job programado (cron/scheduler) 
 * una vez al mes por cada Membresia activa, no por el frontend directamente. 
 * La implementación del scheduler (qué corre el cron, cómo itera las membresías, 
 * manejo de reintentos a nivel de job) es un prompt aparte.
 */
export async function createStripePayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { periodo } = req.body;

    if (!periodo || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
      throw new AppError('Formato de periodo inválido. Use YYYY-MM.', 400);
    }

    if (!req.negocio) {
      throw new AppError('Tenant not resolved.', 500);
    }

    const result = await membresiasService.createStripePayment(
      id,
      req.negocio.id,
      periodo
    );

    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}
