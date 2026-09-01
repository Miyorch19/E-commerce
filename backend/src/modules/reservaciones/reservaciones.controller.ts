import { Request, Response, NextFunction } from 'express';
import * as svc from './reservaciones.service';
import { AppError } from '../../middlewares/errorHandler';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requirePermiso(permiso: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const permisos: string[] = (req.usuario as any)?.rol?.permisos?.map((rp: any) => rp.permiso?.clave) ??
      (req.usuario as any)?.permisos ?? [];
    if (!permisos.includes(permiso)) {
      return next(new AppError(`Forbidden: requires ${permiso}`, 403));
    }
    next();
  };
}

function serviceError(error: unknown, next: NextFunction) {
  if (error instanceof Error) {
    if (error.message === 'NOT_FOUND') return next(new AppError('Recurso no encontrado.', 404));
    if (error.message === 'ZONA_NOT_FOUND') return next(new AppError('Zona no encontrada o no activa.', 404));
    if (error.message === 'DIA_CERRADO') return next(new AppError('El negocio está cerrado ese día.', 422));
    if (error.message === 'HORA_FUERA_DE_HORARIO') return next(new AppError('La hora seleccionada está fuera del horario de apertura.', 422));
    if (error.message === 'CAPACIDAD_EXCEDIDA') {
      const err = error as any;
      return next(new AppError(
        `Capacidad de la zona excedida. Ocupadas: ${err.personasOcupadas}/${err.capacidadMaxima} personas.`, 422
      ));
    }
    if (error.message === 'NO_CANCELABLE') return next(new AppError('Solo se pueden cancelar reservaciones PENDIENTE o CONFIRMADA.', 422));
  }
  next(error);
}

// ─── PANEL: Zonas ─────────────────────────────────────────────────────────────

export const getZonas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getZonas(req.negocio!.id, req.query.all === 'true');
    res.json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

export const createZona = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, descripcion, capacidadMaxima } = req.body;
    if (!nombre || !capacidadMaxima) throw new AppError('nombre y capacidadMaxima son requeridos.', 400);
    const data = await svc.createZona(req.negocio!.id, { nombre, descripcion, capacidadMaxima: Number(capacidadMaxima) });
    res.status(201).json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

export const updateZona = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateZona(req.negocio!.id, req.params.id, req.body);
    res.json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

export const toggleZona = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.toggleZona(req.negocio!.id, req.params.id);
    res.json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

// ─── PANEL: Horario ───────────────────────────────────────────────────────────

export const getHorarios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getHorarios(req.negocio!.id);
    res.json({ status: 'ok', data });
  } catch (e) { next(e); }
};

export const updateHorarioDia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dia } = req.params;
    const { horaInicio, horaFin, activo } = req.body;
    const data = await svc.upsertHorarioDia(req.negocio!.id, dia.toUpperCase(), { horaInicio, horaFin, activo });
    res.json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

// ─── PANEL: Reservaciones ─────────────────────────────────────────────────────

export const getReservacionesPanel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha, estado, zonaId } = req.query as Record<string, string>;
    const data = await svc.getReservacionesNegocio(req.negocio!.id, { fecha, estado, zonaId });
    res.json({ status: 'ok', data });
  } catch (e) { next(e); }
};

export const cambiarEstado = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estado } = req.body;
    if (!['CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_SHOW'].includes(estado)) {
      throw new AppError('Estado inválido.', 400);
    }
    const data = await svc.cambiarEstadoReservacion(req.negocio!.id, req.params.id, estado);
    res.json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

// ─── TIENDA PÚBLICA: Zonas + Horario ─────────────────────────────────────────

export const getZonasPublicas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getZonas(req.negocio!.id, false);
    res.json({ status: 'ok', data });
  } catch (e) { next(e); }
};

export const getHorarioPublico = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const horarios = await svc.getHorarios(req.negocio!.id);
    // Calcular slots para cada día activo (intervalo de 30 min)
    const data = horarios.map(h => ({
      ...h,
      slots: h.activo ? svc.calcularSlots(h.horaInicio, h.horaFin, 30) : [],
    }));
    res.json({ status: 'ok', data });
  } catch (e) { next(e); }
};

// ─── TIENDA PÚBLICA: Reservaciones ───────────────────────────────────────────

export const crearReservacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cliente) throw new AppError('Autenticación de cliente requerida.', 401);
    const { zonaId, fecha, horaInicio, numeroPersonas, notas } = req.body;
    if (!zonaId || !fecha || !horaInicio || !numeroPersonas) {
      throw new AppError('zonaId, fecha, horaInicio y numeroPersonas son requeridos.', 400);
    }
    const data = await svc.crearReservacion(req.negocio!.id, req.cliente.id, {
      zonaId,
      fecha: new Date(fecha),
      horaInicio,
      numeroPersonas: Number(numeroPersonas),
      notas,
    });
    res.status(201).json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};

export const getMisReservaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cliente) throw new AppError('Autenticación de cliente requerida.', 401);
    const data = await svc.getMisReservaciones(req.negocio!.id, req.cliente.id);
    res.json({ status: 'ok', data });
  } catch (e) { next(e); }
};

export const cancelarReservacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cliente) throw new AppError('Autenticación de cliente requerida.', 401);
    const data = await svc.cancelarMiReservacion(req.negocio!.id, req.cliente.id, req.params.id);
    res.json({ status: 'ok', data });
  } catch (e) { serviceError(e, next); }
};
