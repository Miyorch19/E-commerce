import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { AppError } from '../../middlewares/errorHandler';

// ─── POST /auth/login ─────────────────────────────────────────────────────────

/**
 * Login de usuarios del panel de administración.
 * negocioId se extrae de req.negocio (puesto por resolveTenant).
 */
export async function loginUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.negocio) throw new AppError('Tenant not resolved.', 500);

    const result = await authService.loginUsuario(
      req.body,
      req.negocio.id,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }
    );

    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}

// ─── POST /auth/register ──────────────────────────────────────────────────────

/**
 * Registro de clientes finales (B2C).
 * El cliente queda ligado al negocioId del tenant resuelto.
 */
export async function registerCliente(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.negocio) throw new AppError('Tenant not resolved.', 500);

    const result = await authService.registerCliente(req.body, req.negocio.id);

    res.status(201).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}

// ─── POST /auth/logout ────────────────────────────────────────────────────────

/**
 * Revoca la sesión activa del usuario del panel.
 * Requiere authenticate previo (que establece req.sesionId).
 */
export async function logoutUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.sesionId) throw new AppError('No active session found.', 400);

    await authService.logoutUsuario(req.sesionId);

    res.status(200).json({ status: 'ok', message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
}

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.negocio) throw new AppError('Tenant not resolved.', 500);

    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refreshAccessToken(refreshToken, req.negocio.id);

    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    next(error);
  }
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

/**
 * Devuelve el perfil del usuario o cliente autenticado actual.
 */
export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.usuario) {
      const { passwordHash: _ph, ...safe } = req.usuario as Record<string, unknown> & { passwordHash?: string };
      res.status(200).json({ status: 'ok', data: { type: 'usuario', ...safe } });
      return;
    }

    if (req.cliente) {
      const { passwordHash: _ph, ...safe } = req.cliente as Record<string, unknown> & { passwordHash?: string };
      res.status(200).json({ status: 'ok', data: { type: 'cliente', ...safe } });
      return;
    }

    throw new AppError('Not authenticated.', 401);
  } catch (error) {
    next(error);
  }
}
