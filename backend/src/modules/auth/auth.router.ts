import { Router, IRouter } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import {
  validate,
  loginUsuarioSchema,
  loginClienteSchema,
  registerClienteSchema,
  refreshTokenSchema,
  loginGoogleSchema,
} from './auth.schema';

const router: IRouter = Router();

/**
 * POST /auth/login
 * Login de usuarios del panel de administración.
 * Requiere resolveTenant (montado en el router padre).
 */
router.post(
  '/login',
  validate(loginUsuarioSchema),
  authController.loginUsuario
);

/**
 * POST /auth/register
 * Registro de clientes finales B2C ligados al tenant actual.
 * Requiere resolveTenant (montado en el router padre).
 */
router.post(
  '/register',
  validate(registerClienteSchema),
  authController.registerCliente
);

/**
 * POST /auth/refresh
 * Emite un nuevo access token usando el refresh token.
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

/**
 * POST /auth/google
 * Login con Google Identity Services (soporta panel y tienda).
 */
router.post(
  '/google',
  validate(loginGoogleSchema),
  authController.loginGoogle
);

/**
 * POST /auth/logout
 * Revoca la sesión activa del usuario de panel.
 * Requiere JWT válido.
 */
router.post('/logout', authenticate, authController.logoutUsuario);

/**
 * GET /auth/me
 * Devuelve el perfil del usuario o cliente autenticado.
 * Requiere JWT válido (usuario o cliente).
 */
router.get('/me', authenticate, authController.me);

/**
 * POST /auth/login-cliente
 * Login exclusivo para clientes de la tienda (ClienteAuth) por email/password.
 * Nunca autentica usuarios del panel.
 * Requiere resolveTenant (montado en el router padre).
 */
router.post(
  '/login-cliente',
  validate(loginClienteSchema),
  authController.loginCliente
);

export default router;
