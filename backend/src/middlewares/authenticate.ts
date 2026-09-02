import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { verifyToken, UsuarioTokenPayload, ClienteTokenPayload } from '../config/jwt';
import { AppError } from './errorHandler';
import { getCachedSession, setCachedSession } from './resolveTenant';

// ─── Usuario cache ────────────────────────────────────────────────────────────
// Cacheamos el usuario+rol 30 segundos para no pagar un roundtrip DB en cada
// request autenticado. El rol/permisos casi nunca cambia entre requests.

interface UsuarioCacheEntry {
  usuario: any;
  expiresAt: number;
}
const usuarioCache = new Map<string, UsuarioCacheEntry>();
const USUARIO_CACHE_TTL_MS = 30 * 1000; // 30 segundos

function getCachedUsuario(usuarioId: string): any | null {
  const e = usuarioCache.get(usuarioId);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { usuarioCache.delete(usuarioId); return null; }
  return e.usuario;
}
function setCachedUsuario(usuarioId: string, usuario: any) {
  usuarioCache.set(usuarioId, { usuario, expiresAt: Date.now() + USUARIO_CACHE_TTL_MS });
}
export function invalidateUsuarioCache(usuarioId: string) {
  usuarioCache.delete(usuarioId);
}

/**
 * Extrae el Bearer token del header Authorization.
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Middleware de autenticación.
 *
 * Flujo:
 *  1. Extrae el JWT del header `Authorization: Bearer <token>`.
 *  2. Verifica la firma y expiración.
 *  3. Según `payload.type`, carga el Usuario (con rol) o el ClienteAuth.
 *  4. ⚠️  Valida que el `negocioId` del token coincida con `req.negocio.id`
 *         → previene acceso cruzado entre tenants.
 *  5. Para usuarios de panel: verifica que la Sesion exista y no esté revocada.
 *  6. Adjunta `req.usuario` o `req.cliente` según corresponda.
 *
 * Requiere que `resolveTenant` haya corrido antes.
 * Sesion y Usuario se cachean en memoria para evitar roundtrips a la DB remota.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AppError('Authentication token is required.', 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new AppError('Token has expired.', 401);
      }
      if (err instanceof JsonWebTokenError) {
        throw new AppError('Invalid token.', 401);
      }
      throw err;
    }

    // ── Guardia de tenant ────────────────────────────────────────────────────
    if (!req.negocio) {
      throw new AppError('Tenant context is missing. Run resolveTenant first.', 500);
    }

    if (payload.negocioId !== req.negocio.id) {
      throw new AppError('Token does not belong to this tenant.', 403);
    }

    // ── Resolución por tipo de token ─────────────────────────────────────────

    if (payload.type === 'usuario') {
      await authenticateUsuario(req, payload as UsuarioTokenPayload);
    } else if (payload.type === 'cliente') {
      await authenticateCliente(req, payload as ClienteTokenPayload);
    } else {
      throw new AppError('Unknown token type.', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Valida usuario de panel:
 *  - Sesion: cacheada 60s, solo la busca en DB si no está en caché.
 *  - Usuario+Rol: cacheado 30s, solo lo busca en DB si no está en caché.
 *  - Ambas lookups corren en Promise.all cuando no hay caché.
 */
async function authenticateUsuario(
  req: Request,
  payload: UsuarioTokenPayload
): Promise<void> {
  // Intentar servir desde caché
  const cachedSesion = getCachedSession(payload.sesionId);
  const cachedUsuario = getCachedUsuario(payload.sub);

  let sesion = cachedSesion;
  let usuario = cachedUsuario;

  // Solo consultar DB para los que faltan en caché (en paralelo)
  if (!sesion && !usuario) {
    [sesion, usuario] = await Promise.all([
      prisma.sesion.findUnique({ where: { id: payload.sesionId } }),
      prisma.usuario.findFirst({
        where: { id: payload.sub, negocioId: req.negocio!.id, activo: true },
        include: { rol: true },
      }),
    ]);
    if (sesion) setCachedSession(payload.sesionId, sesion);
    if (usuario) setCachedUsuario(payload.sub, usuario);
  } else if (!sesion) {
    sesion = await prisma.sesion.findUnique({ where: { id: payload.sesionId } });
    if (sesion) setCachedSession(payload.sesionId, sesion);
  } else if (!usuario) {
    usuario = await prisma.usuario.findFirst({
      where: { id: payload.sub, negocioId: req.negocio!.id, activo: true },
      include: { rol: true },
    });
    if (usuario) setCachedUsuario(payload.sub, usuario);
  }

  if (!sesion || sesion.revokedAt !== null || sesion.expiraEl < new Date()) {
    throw new AppError('Session is invalid or has been revoked.', 401);
  }

  if (!usuario) {
    throw new AppError('User not found or inactive.', 401);
  }

  req.usuario = usuario;
  req.sesionId = sesion.id;
}

/**
 * Valida cliente final B2C:
 *  - Carga el ClienteAuth verificando negocioId y que esté activo.
 *  - No hay sesión en BD para clientes — el JWT es la única fuente de verdad.
 */
async function authenticateCliente(
  req: Request,
  payload: ClienteTokenPayload
): Promise<void> {
  const cliente = await prisma.clienteAuth.findFirst({
    where: {
      id: payload.sub,
      negocioId: req.negocio!.id,
      activo: true,
    },
  });

  if (!cliente) {
    throw new AppError('Client not found or inactive.', 401);
  }

  req.cliente = cliente;
}

// ─── Variante que sólo permite usuarios de panel ─────────────────────────────

export function requireUsuario(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.usuario) {
    return next(new AppError('Access restricted to panel users.', 403));
  }
  next();
}

// ─── Variante que sólo permite clientes finales ──────────────────────────────

export function requireCliente(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.cliente) {
    return next(new AppError('Access restricted to end clients.', 403));
  }
  next();
}
