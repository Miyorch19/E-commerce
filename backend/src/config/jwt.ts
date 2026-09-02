import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface UsuarioTokenPayload {
  sub: string;        // usuarioId
  negocioId: string;
  rolId: string;
  type: 'usuario';
  sesionId: string;   // referencia a la Sesion en BD para poder invalidarla
}

export interface ClienteTokenPayload {
  sub: string;        // clienteId
  negocioId: string;
  type: 'cliente';
}

export type TokenPayload = UsuarioTokenPayload | ClienteTokenPayload;

// ─── Generación ───────────────────────────────────────────────────────────────

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: Pick<TokenPayload, 'sub' | 'type' | 'negocioId'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

// ─── Verificación ─────────────────────────────────────────────────────────────

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

// ─── Expiración en segundos (para almacenar en DB) ────────────────────────────

export function refreshExpiresAt(): Date {
  const days = 7; // sincronizar con JWT_REFRESH_EXPIRES
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
