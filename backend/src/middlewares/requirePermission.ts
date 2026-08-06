import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';

export function requirePermission(permisoClave: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.usuario) {
        throw new AppError('Access restricted to panel users.', 403);
      }

      const rolId = req.usuario.rol.id;

      const hasPermission = await prisma.rolPermiso.findFirst({
        where: {
          rolId: rolId,
          permiso: { clave: permisoClave }
        }
      });

      if (!hasPermission) {
        throw new AppError(`Missing required permission: ${permisoClave}`, 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
