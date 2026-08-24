import { Request, Response, NextFunction } from 'express';
import * as productosService from './productos.service';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const negocioId = req.negocio.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await productosService.getActiveProducts(negocioId, page, limit);

    res.json({
      status: 'ok',
      data: data.items,
      meta: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const negocioId = req.negocio.id;
    const { id } = req.params;

    const producto = await productosService.getActiveProductById(negocioId, id);

    if (!producto) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    res.json({
      status: 'ok',
      data: producto
    });
  } catch (error) {
    next(error);
  }
}
