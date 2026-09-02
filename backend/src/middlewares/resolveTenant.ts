import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { config } from '../config/env';

// ─── Tenant Cache ─────────────────────────────────────────────────────────────
// El Negocio se busca en CADA request. Con DB remota (Neon/Supabase) eso cuesta
// ~800-900 ms POR REQUEST. Cacheamos en memoria con TTL de 5 minutos.
// Cuando cualquier dato del Negocio se actualiza en DB, se invalida llamando a `invalidateNegocioCache(negocioId)`.

interface CacheEntry {
  negocio: any;
  expiresAt: number;
}

const tenantCache = new Map<string, CacheEntry>(); // Key: dominio
const negocioIdToDominioMap = new Map<string, string>(); // Key: negocioId -> Value: dominio
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Invalida el caché de un Negocio específico (por negocioId o dominio) o limpia todo si no se pasa id.
 */
export function invalidateTenantCache(key?: string) {
  if (!key) {
    tenantCache.clear();
    negocioIdToDominioMap.clear();
    return;
  }
  // Si la llave está directamente en tenantCache (es un dominio)
  if (tenantCache.has(key)) {
    tenantCache.delete(key);
  }
  // Si la llave es un negocioId, buscar el dominio correspondiente y borrarlo
  const dominio = negocioIdToDominioMap.get(key);
  if (dominio) {
    tenantCache.delete(dominio);
    negocioIdToDominioMap.delete(key);
  }
}

/**
 * Alias de conveniencia para invalidar caché de Negocio por id o dominio.
 */
export const invalidateNegocioCache = invalidateTenantCache;

function getCachedTenant(dominio: string): any | null {
  const entry = tenantCache.get(dominio);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tenantCache.delete(dominio);
    return null;
  }
  return entry.negocio;
}

function setCachedTenant(dominio: string, negocio: any): void {
  tenantCache.set(dominio, { negocio, expiresAt: Date.now() + CACHE_TTL_MS });
  if (negocio.id) {
    negocioIdToDominioMap.set(negocio.id, dominio);
  }
}

// ─── Session Cache ────────────────────────────────────────────────────────────
// La Sesion también se busca en cada request autenticado. Cacheamos 1 minuto.
// Se invalida en logout.

interface SessionCacheEntry {
  sesion: any;
  expiresAt: number;
}

const sessionCache = new Map<string, SessionCacheEntry>();
const SESSION_CACHE_TTL_MS = 60 * 1000; // 1 minuto

export function getCachedSession(sesionId: string): any | null {
  const entry = sessionCache.get(sesionId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    sessionCache.delete(sesionId);
    return null;
  }
  return entry.sesion;
}

export function setCachedSession(sesionId: string, sesion: any): void {
  sessionCache.set(sesionId, { sesion, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
}

export function invalidateSessionCache(sesionId: string): void {
  sessionCache.delete(sesionId);
}

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
 * Resultado cacheado en memoria (TTL 5 min) para evitar DB roundtrip por request.
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

    // ── Cache hit ────────────────────────────────────────────────────────────
    const cached = getCachedTenant(dominio);
    if (cached) {
      req.negocio = cached;
      return next();
    }

    // ── Cache miss: consultar DB ─────────────────────────────────────────────
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

    setCachedTenant(dominio, negocio);
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
