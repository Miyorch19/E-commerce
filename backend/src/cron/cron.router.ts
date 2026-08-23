import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { requirePermission } from '../middlewares/requirePermission';
import { procesarPagosMembresias } from './cron.service';

const router = Router();

/**
 * POST /api/admin/cron/membresias/ejecutar-ahora
 * 
 * CONSIDERACIÓN: En producción esto debería estar protegido para que
 * solo un "Super Admin" de plataforma pueda ejecutarlo, ya que actualmente
 * cobra TODAS las membresías activas de todos los negocios, no solo 
 * las del negocio que llama al endpoint.
 * Por ahora, para pruebas, permitimos que cualquier admin con `facturacion:gestionar` lo dispare.
 */
router.post(
  '/membresias/ejecutar-ahora',
  authenticate,
  requirePermission('facturacion:gestionar'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Disparamos el job de forma asíncrona sin bloquear la respuesta HTTP
      procesarPagosMembresias().catch((err) => {
        console.error('Error in manual cron execution:', err);
      });

      res.status(200).json({
        status: 'ok',
        message: 'Cron job initiated in the background.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
