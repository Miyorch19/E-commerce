import { PrismaClient } from '@prisma/client';

declare global {
  // Evita múltiples instancias de PrismaClient en hot-reload (desarrollo)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Determina si se deben logear las queries de Prisma.
 *
 * Sólo se activa en desarrollo y si PRISMA_LOG_QUERIES no está explícitamente
 * en "false". Esto permite silenciar los logs desde el entorno sin tocar código:
 *   PRISMA_LOG_QUERIES=false   → sin query logs
 *   PRISMA_LOG_QUERIES=true    → con query logs (default en dev)
 *   (no definida)              → con query logs en dev, sin ellos en prod
 *
 * Nunca se activa en producción, independientemente del valor de la variable.
 */
const isDev = process.env['NODE_ENV'] === 'development';
const queryLogsEnabled = isDev && process.env['PRISMA_LOG_QUERIES'] !== 'false';

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: queryLogsEnabled
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
}
