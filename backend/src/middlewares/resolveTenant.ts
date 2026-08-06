import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { config } from '../config/env';

/**
 * Resuelve el tenant (Negocio) a partir del header Host.
 *
 * Estrategia de resolución (en orden de prioridad):
 *  1. Header `X-Tenant-Domain`  → útil en desarrollo/testing con herramientas como Postman.
 *  2. Subdominio del Host        → si BASE_DOMAIN está configurado, ej. "tienda.miapp.com" → "tienda".
 *  3. Dominio completo           → para dominios custom, ej. "www.tiendapropia.com".
 *
 * El campo `Negocio.dominio` debe almacenar el identificador exacto
 * que este middleware extraerá (slug o dominio completo).
 *
 * Adjunta `req.negocio` si el Negocio existe y está activo.
 */
export async function resolveTenant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hostHeader =
      (req.headers['x-tenant-domain'] as string | undefined) ||
      (req.headers['host'] as string | undefined);

    if (!hostHeader) {
      res.status(400).json({
        status: 'fail',
        message: 'Host header is required to resolve tenant.',
      });
      return;
    }

    // Eliminar puerto si lo hay → "tienda.miapp.com:3001" → "tienda.miapp.com"
    const hostname = hostHeader.split(':')[0].toLowerCase();

    const dominio = extractDominio(hostname);

    const negocio = await prisma.negocio.findFirst({
      where: { dominio, activo: true },
    });

    if (!negocio) {
      res.status(404).json({
        status: 'fail',
        message: `Tenant not found for domain: "${dominio}".`,
      });
      return;
    }

    req.negocio = negocio;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Extrae el identificador de dominio a usar para buscar el Negocio.
 *
 * - Si BASE_DOMAIN está definido y el hostname lo contiene como sufijo:
 *     "tienda.miapp.com" con BASE_DOMAIN="miapp.com" → "tienda"
 * - En cualquier otro caso usa el hostname completo:
 *     "www.tiendapropia.com" → "www.tiendapropia.com"
 *     "localhost" (dev sin BASE_DOMAIN) → "localhost"
 */
function extractDominio(hostname: string): string {
  const base = config.baseDomain;

  if (base && hostname.endsWith(`.${base}`)) {
    // Extraer subdominio: "tienda.miapp.com" → "tienda"
    return hostname.slice(0, hostname.length - base.length - 1);
  }

  // Dominio custom o localhost en dev
  return hostname;
}
