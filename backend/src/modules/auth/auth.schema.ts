import { z } from 'zod';

// En Zod v4, el mensaje de campo requerido se define con `error` (en lugar de required_error de v3)
const requiredString = (msg: string) =>
  z.string({ error: msg }).min(1, msg);

// ─── Login de usuario del panel ───────────────────────────────────────────────

export const loginUsuarioSchema = z.object({
  body: z.object({
    email: requiredString('Email is required.').email('Invalid email format.'),
    password: requiredString('Password is required.'),
  }),
});

export type LoginUsuarioDto = z.infer<typeof loginUsuarioSchema>['body'];

// ─── Registro de cliente final (B2C) ─────────────────────────────────────────

export const registerClienteSchema = z.object({
  body: z.object({
    nombre: requiredString('Name is required.').min(2, 'Name must be at least 2 characters.'),
    email: requiredString('Email is required.').email('Invalid email format.'),
    password: requiredString('Password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    telefono: z.string().optional(),
  }),
});

export type RegisterClienteDto = z.infer<typeof registerClienteSchema>['body'];

// ─── Refresh token ────────────────────────────────────────────────────────────

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: requiredString('Refresh token is required.'),
  }),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>['body'];

// ─── Login Google ─────────────────────────────────────────────────────────────

export const loginGoogleSchema = z.object({
  body: z.object({
    idToken: requiredString('idToken is required.'),
    contexto: z.enum(['panel', 'tienda'], {
      error: 'Contexto must be either "panel" or "tienda".',
    }),
  }),
});

export type LoginGoogleDto = z.infer<typeof loginGoogleSchema>['body'];

// ─── Helper: validar con Zod y lanzar 422 en fallo ───────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(422).json({
        status: 'fail',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    next();
  };
}
