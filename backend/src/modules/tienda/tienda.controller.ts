import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';

// -----------------------------------------------------------------------------
// GET /api/tienda/tema
// Devuelve el Tema del negocio actual (público — solo requiere resolveTenant).
// Incluye también los TokenDiseno[] adicionales del negocio.
// -----------------------------------------------------------------------------
export async function getTema(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.negocio) {
      throw new AppError('Tenant not resolved.', 500);
    }

    const tema = await prisma.tema.findUnique({
      where: { negocioId: req.negocio.id },
      include: {
        negocio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            descripcion: true,
            logo: true,
            email: true,
            telefono: true,
            whatsapp: true,
            direccion: true,
            ciudad: true,
          },
        },
      },
    });

    // Si el negocio aún no tiene Tema configurado, devolvemos defaults
    if (!tema) {
      res.status(200).json({
        status: 'ok',
        data: {
          plantilla: 'default',
          colorPrimario: '#ffffff',
          colorSecundario: '#000000',
          colorAcento: '#6366f1',
          fontPrimaria: 'Inter',
          fontSecundaria: null,
          borderRadius: '8px',
          logoUrl: null,
          faviconUrl: null,
        },
      });
      return;
    }

    // También traemos los TokenDiseno extras
    const tokens = await prisma.tokenDiseno.findMany({
      where: { negocioId: req.negocio.id },
      select: { clave: true, valor: true },
    });

    res.status(200).json({
      status: 'ok',
      data: {
        ...tema,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}
