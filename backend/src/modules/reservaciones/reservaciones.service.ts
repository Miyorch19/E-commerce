import { prisma } from '../../config/prisma';

// ─── Helper: sumar minutos a "HH:MM" ─────────────────────────────────────────
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// ─── Helper: verificar solapamiento de rangos ─────────────────────────────────
// [aStart, aEnd) overlaps [bStart, bEnd) si aStart < bEnd && bStart < aEnd
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function rangesOverlap(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string
): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) &&
         timeToMinutes(bStart) < timeToMinutes(aEnd);
}

// ─── ZonaRestaurante ─────────────────────────────────────────────────────────

export async function getZonas(negocioId: string, includeInactive = false) {
  return prisma.zonaRestaurante.findMany({
    where: {
      negocioId,
      ...(includeInactive ? {} : { activo: true }),
    },
    orderBy: { nombre: 'asc' },
  });
}

export async function createZona(negocioId: string, data: {
  nombre: string;
  descripcion?: string;
  capacidadMaxima: number;
}) {
  return prisma.zonaRestaurante.create({
    data: { negocioId, ...data },
  });
}

export async function updateZona(negocioId: string, id: string, data: {
  nombre?: string;
  descripcion?: string;
  capacidadMaxima?: number;
}) {
  const zona = await prisma.zonaRestaurante.findFirst({ where: { id, negocioId } });
  if (!zona) throw new Error('NOT_FOUND');
  return prisma.zonaRestaurante.update({ where: { id }, data });
}

export async function toggleZona(negocioId: string, id: string) {
  const zona = await prisma.zonaRestaurante.findFirst({ where: { id, negocioId } });
  if (!zona) throw new Error('NOT_FOUND');
  return prisma.zonaRestaurante.update({ where: { id }, data: { activo: !zona.activo } });
}

// ─── Horario ─────────────────────────────────────────────────────────────────

export async function getHorarios(negocioId: string) {
  return prisma.horario.findMany({
    where: { negocioId, staffId: null }, // solo horarios del negocio, no de staff
    orderBy: { dia: 'asc' },
  });
}

export async function upsertHorarioDia(negocioId: string, dia: string, data: {
  horaInicio?: string;
  horaFin?: string;
  activo?: boolean;
}) {
  const existing = await prisma.horario.findFirst({
    where: { negocioId, dia: dia as any, staffId: null },
  });
  if (existing) {
    return prisma.horario.update({ where: { id: existing.id }, data });
  }
  // Crear si no existe
  return prisma.horario.create({
    data: {
      negocioId,
      dia: dia as any,
      horaInicio: data.horaInicio ?? '09:00',
      horaFin: data.horaFin ?? '22:00',
      activo: data.activo ?? true,
    },
  });
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export function calcularSlots(horaInicio: string, horaFin: string, intervaloMinutos = 30): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(horaInicio);
  const end = timeToMinutes(horaFin);
  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += intervaloMinutos;
  }
  return slots;
}

// ─── Reservaciones ───────────────────────────────────────────────────────────

export async function validarCapacidadZona(
  negocioId: string,
  zonaId: string,
  fecha: Date,
  horaInicio: string,
  numeroPersonas: number,
  duracionMinutos: number,
  excludeId?: string, // para edición futura
): Promise<{ ok: boolean; personasOcupadas: number; capacidadMaxima: number }> {
  const zona = await prisma.zonaRestaurante.findFirst({
    where: { id: zonaId, negocioId, activo: true },
  });
  if (!zona) throw new Error('ZONA_NOT_FOUND');

  const horaFin = addMinutes(horaInicio, duracionMinutos);

  // Traer reservaciones activas de esa zona en esa fecha
  const reservas = await prisma.reservacion.findMany({
    where: {
      negocioId,
      zonaId,
      fecha,
      activo: true,
      estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { horaInicio: true, numeroPersonas: true },
  });

  // Solo contar las que se solapan con la nueva reservación
  let personasOcupadas = 0;
  for (const r of reservas) {
    const rFin = addMinutes(r.horaInicio, duracionMinutos);
    if (rangesOverlap(horaInicio, horaFin, r.horaInicio, rFin)) {
      personasOcupadas += r.numeroPersonas;
    }
  }

  return {
    ok: personasOcupadas + numeroPersonas <= zona.capacidadMaxima,
    personasOcupadas,
    capacidadMaxima: zona.capacidadMaxima,
  };
}

export async function crearReservacion(
  negocioId: string,
  clienteId: string,
  data: {
    zonaId: string;
    fecha: Date;
    horaInicio: string;
    numeroPersonas: number;
    notas?: string;
  }
) {
  // 1. Obtener duracion del negocio
  const negocio = await prisma.negocio.findUnique({
    where: { id: negocioId },
    select: { duracionMinutos: true },
  });
  if (!negocio) throw new Error('NEGOCIO_NOT_FOUND');

  // 2. Verificar que el día esté abierto y la hora sea válida
  const fechaObj = new Date(data.fecha);
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const diaSemana = diasSemana[fechaObj.getUTCDay()];

  const horario = await prisma.horario.findFirst({
    where: { negocioId, dia: diaSemana as any, staffId: null, activo: true },
  });
  if (!horario) throw new Error('DIA_CERRADO');

  // Verificar que horaInicio esté dentro del rango
  const hIni = timeToMinutes(data.horaInicio);
  const hOpen = timeToMinutes(horario.horaInicio);
  const hClose = timeToMinutes(horario.horaFin);
  if (hIni < hOpen || hIni >= hClose) throw new Error('HORA_FUERA_DE_HORARIO');

  // 3. Validar capacidad con solapamiento
  const capacidad = await validarCapacidadZona(
    negocioId, data.zonaId, data.fecha, data.horaInicio,
    data.numeroPersonas, negocio.duracionMinutos,
  );
  if (!capacidad.ok) {
    throw Object.assign(new Error('CAPACIDAD_EXCEDIDA'), {
      personasOcupadas: capacidad.personasOcupadas,
      capacidadMaxima: capacidad.capacidadMaxima,
    });
  }

  // 4. Crear reservación
  return prisma.reservacion.create({
    data: {
      negocioId,
      clienteId,
      zonaId: data.zonaId,
      fecha: data.fecha,
      horaInicio: data.horaInicio,
      numeroPersonas: data.numeroPersonas,
      notas: data.notas,
    },
    include: {
      zona: { select: { nombre: true, capacidadMaxima: true } },
      cliente: { select: { nombre: true, email: true } },
    },
  });
}

export async function getReservacionesNegocio(negocioId: string, filters: {
  fecha?: string;
  estado?: string;
  zonaId?: string;
}) {
  return prisma.reservacion.findMany({
    where: {
      negocioId,
      activo: true,
      ...(filters.fecha ? { fecha: new Date(filters.fecha) } : {}),
      ...(filters.estado ? { estado: filters.estado as any } : {}),
      ...(filters.zonaId ? { zonaId: filters.zonaId } : {}),
    },
    include: {
      zona: { select: { nombre: true } },
      cliente: { select: { nombre: true, email: true, telefono: true } },
    },
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });
}

export async function cambiarEstadoReservacion(
  negocioId: string,
  id: string,
  estado: 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_SHOW'
) {
  const reservacion = await prisma.reservacion.findFirst({ where: { id, negocioId } });
  if (!reservacion) throw new Error('NOT_FOUND');
  return prisma.reservacion.update({ where: { id }, data: { estado } });
}

export async function getMisReservaciones(negocioId: string, clienteId: string) {
  return prisma.reservacion.findMany({
    where: { negocioId, clienteId, activo: true },
    include: { zona: { select: { nombre: true, descripcion: true } } },
    orderBy: [{ fecha: 'desc' }, { horaInicio: 'asc' }],
  });
}

export async function cancelarMiReservacion(
  negocioId: string,
  clienteId: string,
  id: string
) {
  const reservacion = await prisma.reservacion.findFirst({
    where: { id, negocioId, clienteId, activo: true },
  });
  if (!reservacion) throw new Error('NOT_FOUND');
  if (!['PENDIENTE', 'CONFIRMADA'].includes(reservacion.estado)) {
    throw new Error('NO_CANCELABLE');
  }
  return prisma.reservacion.update({
    where: { id },
    data: { estado: 'CANCELADA' },
  });
}
