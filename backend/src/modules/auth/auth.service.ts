import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/env';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  refreshExpiresAt,
  UsuarioTokenPayload,
} from '../../config/jwt';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { LoginUsuarioDto, RegisterClienteDto, LoginGoogleDto } from './auth.schema';

const SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(config.google.clientId);

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — Usuario del panel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Autentica a un usuario del panel de administración.
 *
 * ⚠️  negocioId siempre proviene de req.negocio (tenant resuelto), nunca del body.
 */
export async function loginUsuario(
  dto: LoginUsuarioDto,
  negocioId: string,
  meta: { ip?: string; userAgent?: string }
): Promise<AuthTokens & { usuario: Record<string, unknown> }> {
  // Buscar usuario en el tenant actual
  const usuario = await prisma.usuario.findFirst({
    where: {
      email: dto.email,
      negocioId,          // filtro explícito por tenant
      activo: true,
    },
    include: { rol: true },
  });

  if (!usuario || !usuario.passwordHash) {
    // Mensaje genérico para no revelar si el email existe
    throw new AppError('Invalid credentials.', 401);
  }

  const passwordOk = await bcrypt.compare(dto.password, usuario.passwordHash);
  if (!passwordOk) {
    throw new AppError('Invalid credentials.', 401);
  }

  // Crear sesión en BD
  const sesion = await prisma.sesion.create({
    data: {
      usuarioId: usuario.id,
      negocioId,           // filtro explícito por tenant
      token: '',           // se actualiza inmediatamente abajo
      expiraEl: refreshExpiresAt(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  // Generar tokens con el sesionId ya conocido
  const payload: UsuarioTokenPayload = {
    sub: usuario.id,
    negocioId,
    rolId: usuario.rolId,
    type: 'usuario',
    sesionId: sesion.id,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: usuario.id, type: 'usuario' });

  // Guardar refresh token en la sesión
  await prisma.sesion.update({
    where: { id: sesion.id },
    data: { token: accessToken, refreshToken },
  });

  // Actualizar último acceso
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  const { passwordHash: _ph, ...usuarioSafe } = usuario;

  return { accessToken, refreshToken, usuario: usuarioSafe };
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — Cliente final (B2C)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo cliente final en el contexto del tenant.
 *
 * ⚠️  negocioId siempre proviene de req.negocio (tenant resuelto), nunca del body.
 */
export async function registerCliente(
  dto: RegisterClienteDto,
  negocioId: string
): Promise<AuthTokens & { cliente: Record<string, unknown> }> {
  // Verificar unicidad por [negocioId, email] (activo=true)
  const existing = await prisma.clienteAuth.findFirst({
    where: { negocioId, email: dto.email, activo: true },
  });

  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

  const cliente = await prisma.clienteAuth.create({
    data: {
      negocioId,           // filtro explícito por tenant
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      telefono: dto.telefono,
    },
  });

  const accessToken = signAccessToken({
    sub: cliente.id,
    negocioId,
    type: 'cliente',
  });

  const refreshToken = signRefreshToken({ sub: cliente.id, type: 'cliente' });

  const { passwordHash: _ph, ...clienteSafe } = cliente;

  return { accessToken, refreshToken, cliente: clienteSafe };
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT — Invalida la sesión del usuario de panel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Revoca la sesión en BD, invalidando inmediatamente el refresh token.
 * El access token expirará naturalmente (máx. 15 min).
 */
export async function logoutUsuario(sesionId: string): Promise<void> {
  await prisma.sesion.update({
    where: { id: sesionId },
    data: { revokedAt: new Date() },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH — Emite un nuevo access token usando el refresh token
// ─────────────────────────────────────────────────────────────────────────────

export async function refreshAccessToken(
  refreshToken: string,
  negocioId: string
): Promise<{ accessToken: string }> {
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  if (payload.negocioId !== negocioId) {
    throw new AppError('Token does not belong to this tenant.', 403);
  }

  if (payload.type === 'usuario') {
    // Verificar que la sesión con este refresh token exista y no esté revocada
    const sesion = await prisma.sesion.findFirst({
      where: {
        refreshToken,
        negocioId,
        revokedAt: null,
      },
    });

    if (!sesion || sesion.expiraEl < new Date()) {
      throw new AppError('Refresh token is invalid or expired.', 401);
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id: payload.sub, negocioId, activo: true },
      include: { rol: true },
    });

    if (!usuario) throw new AppError('User not found.', 401);

    const newPayload: UsuarioTokenPayload = {
      sub: usuario.id,
      negocioId,
      rolId: usuario.rolId,
      type: 'usuario',
      sesionId: sesion.id,
    };

    const accessToken = signAccessToken(newPayload);

    // Actualizar el access token almacenado en la sesión
    await prisma.sesion.update({
      where: { id: sesion.id },
      data: { token: accessToken },
    });

    return { accessToken };
  }

  if (payload.type === 'cliente') {
    const cliente = await prisma.clienteAuth.findFirst({
      where: { id: payload.sub, negocioId, activo: true },
    });

    if (!cliente) throw new AppError('Client not found.', 401);

    const accessToken = signAccessToken({
      sub: cliente.id,
      negocioId,
      type: 'cliente',
    });

    return { accessToken };
  }

  throw new AppError('Unknown token type.', 401);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN GOOGLE
// ─────────────────────────────────────────────────────────────────────────────

export async function loginGoogle(
  dto: LoginGoogleDto,
  negocioId: string,
  meta: { ip?: string; userAgent?: string }
): Promise<AuthTokens & { data: Record<string, unknown>; type: string }> {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: config.google.clientId,
    });
  } catch (err) {
    throw new AppError('Token de Google inválido', 401);
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError('Invalid Google token.', 401);
  }

  const { email, name, sub: googleId, picture, email_verified } = payload;

  // Prevención de Account Takeover:
  // Si vinculamos o creamos cuentas con un email que Google reporta como no verificado, 
  // un atacante podría secuestrar cuentas preexistentes no validadas o usurpar la identidad.
  if (!email_verified) {
    throw new AppError(
      'El email de tu cuenta de Google no está verificado, no se puede usar para iniciar sesión.',
      403
    );
  }

  if (dto.contexto === 'panel') {
    // Buscar Usuario (no se auto-registran)
    const usuario = await prisma.usuario.findFirst({
      where: { email, negocioId, activo: true },
      include: { rol: true },
    });

    if (!usuario) {
      throw new AppError('Panel user not found. Contact administrator.', 404);
    }

    // Vincular si faltaba googleId o avatar
    if (!usuario.googleId || !usuario.avatar) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          googleId: usuario.googleId || googleId,
          avatar: usuario.avatar || picture,
        },
      });
    }

    const sesion = await prisma.sesion.create({
      data: {
        usuarioId: usuario.id,
        negocioId,
        token: '',
        expiraEl: refreshExpiresAt(),
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    const jwtPayload: UsuarioTokenPayload = {
      sub: usuario.id,
      negocioId,
      rolId: usuario.rolId,
      type: 'usuario',
      sesionId: sesion.id,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken({ sub: usuario.id, type: 'usuario' });

    await prisma.sesion.update({
      where: { id: sesion.id },
      data: { token: accessToken, refreshToken },
    });

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const { passwordHash: _ph, ...usuarioSafe } = usuario;
    return { accessToken, refreshToken, data: usuarioSafe, type: 'usuario' };

  } else {
    // Buscar o crear ClienteAuth
    let cliente = await prisma.clienteAuth.findFirst({
      where: { negocioId, email, activo: true },
    });

    if (cliente) {
      // if (!cliente.activo) { ... } // Not needed because we searched with activo: true
      if (!cliente.googleId || !cliente.avatar) {
        cliente = await prisma.clienteAuth.update({
          where: { id: cliente.id },
          data: {
            googleId: cliente.googleId || googleId,
            avatar: cliente.avatar || picture,
            emailVerificado: true,
          },
        });
      }
    } else {
      cliente = await prisma.clienteAuth.create({
        data: {
          negocioId,
          email,
          nombre: name || 'Google User',
          googleId,
          avatar: picture,
          emailVerificado: true,
        },
      });
    }

    const accessToken = signAccessToken({
      sub: cliente.id,
      negocioId,
      type: 'cliente',
    });
    const refreshToken = signRefreshToken({ sub: cliente.id, type: 'cliente' });

    await prisma.clienteAuth.update({
      where: { id: cliente.id },
      data: { ultimoAcceso: new Date() },
    });

    const { passwordHash: _ph, ...clienteSafe } = cliente;
    return { accessToken, refreshToken, data: clienteSafe, type: 'cliente' };
  }
}


// -----------------------------------------------------------------------------
// LOGIN CLIENTE � email/password para ClienteAuth (tienda B2C)
// -----------------------------------------------------------------------------

/**
 * Autentica a un cliente de la tienda por email/password.
 *
 * ?  negocioId siempre proviene de req.negocio (tenant resuelto), nunca del body.
 * ?  Usa findFirst (no findUnique) porque el �ndice �nico en ClienteAuth es parcial
 *     (soporta soft delete con activo: Boolean).
 */
export async function loginCliente(
  dto: { email: string; password: string },
  negocioId: string
): Promise<AuthTokens & { cliente: Record<string, unknown> }> {
  const cliente = await prisma.clienteAuth.findFirst({
    where: { email: dto.email, negocioId, activo: true },
  });

  // 401 gen�rico � no revelamos si el email existe o si el registro fue por Google
  if (!cliente || !cliente.passwordHash) {
    throw new AppError('Invalid credentials.', 401);
  }

  const passwordOk = await bcrypt.compare(dto.password, cliente.passwordHash);
  if (!passwordOk) {
    throw new AppError('Invalid credentials.', 401);
  }

  const accessToken = signAccessToken({
    sub: cliente.id,
    negocioId,
    type: 'cliente',
  });
  const refreshToken = signRefreshToken({ sub: cliente.id, type: 'cliente' });

  await prisma.clienteAuth.update({
    where: { id: cliente.id },
    data: { ultimoAcceso: new Date() },
  });

  const { passwordHash: _ph, ...clienteSafe } = cliente;
  return { accessToken, refreshToken, cliente: clienteSafe };
}
