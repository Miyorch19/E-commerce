import { Router } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * GET /health
 * Verifica que la API y la base de datos estén operativas.
 */
router.get('/health', async (_req, res, next) => {
  try {
    // Ping rápido a la base de datos
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
