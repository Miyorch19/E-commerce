import { Negocio, Usuario, ClienteAuth, Rol } from '@prisma/client';

// Tipos extendidos con relaciones necesarias
export type UsuarioConRol = Usuario & { rol: Rol };

declare global {
  namespace Express {
    interface Request {
      /** Tenant resuelto por el middleware resolveTenant */
      negocio?: Negocio;
      /** Usuario del panel (empleado/dueño), adjuntado por authenticate */
      usuario?: UsuarioConRol;
      /** Cliente final B2C, adjuntado por authenticate */
      cliente?: ClienteAuth;
      /** ID de sesión activa del usuario de panel */
      sesionId?: string;
    }
  }
}
