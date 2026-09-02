import { apiClient } from './client'

export interface ZonaRestaurante {
  id: string
  nombre: string
  descripcion?: string
  capacidadMaxima: number
  activo: boolean
}

export interface HorarioDia {
  id: string
  dia: string
  horaInicio: string
  horaFin: string
  activo: boolean
  slots?: string[]
}

export interface Reservacion {
  id: string
  negocioId: string
  clienteId: string
  zonaId: string
  fecha: string
  horaInicio: string
  numeroPersonas: number
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_SHOW'
  notas?: string
  zona?: {
    nombre: string
    descripcion?: string
  }
  cliente?: {
    nombre: string
    email: string
    telefono?: string
  }
}

export const reservacionesApi = {
  // Public tienda methods
  getZonas: () =>
    apiClient.get<{ status: string; data: ZonaRestaurante[] }>('/api/tienda/zonas'),

  getHorario: () =>
    apiClient.get<{ status: string; data: HorarioDia[] }>('/api/tienda/horario'),

  crearReservacion: (payload: {
    zonaId: string
    fecha: string
    horaInicio: string
    numeroPersonas: number
    notas?: string
  }) =>
    apiClient.post<{ status: string; data: Reservacion }>(
      '/api/tienda/reservaciones',
      payload,
      { headers: { 'X-Auth-Context': 'tienda' } }
    ),

  getMisReservaciones: () =>
    apiClient.get<{ status: string; data: Reservacion[] }>(
      '/api/tienda/reservaciones/mis-reservaciones',
      { headers: { 'X-Auth-Context': 'tienda' } }
    ),

  cancelarReservacion: (id: string) =>
    apiClient.patch<{ status: string; data: Reservacion }>(
      `/api/tienda/reservaciones/${id}/cancelar`,
      undefined,
      { headers: { 'X-Auth-Context': 'tienda' } }
    ),

  // Panel admin methods
  getZonasPanel: () =>
    apiClient.get<{ status: string; data: ZonaRestaurante[] }>(
      '/api/tienda/panel/zonas?all=true',
      { headers: { 'X-Auth-Context': 'panel' } }
    ),

  createZonaPanel: (payload: {
    nombre: string
    descripcion?: string
    capacidadMaxima: number
  }) =>
    apiClient.post<{ status: string; data: ZonaRestaurante }>(
      '/api/tienda/panel/zonas',
      payload,
      { headers: { 'X-Auth-Context': 'panel' } }
    ),

  updateZonaPanel: (
    id: string,
    payload: { nombre?: string; descripcion?: string; capacidadMaxima?: number }
  ) =>
    apiClient.put<{ status: string; data: ZonaRestaurante }>(
      `/api/tienda/panel/zonas/${id}`,
      payload,
      { headers: { 'X-Auth-Context': 'panel' } }
    ),

  toggleZonaPanel: (id: string) =>
    apiClient.patch<{ status: string; data: ZonaRestaurante }>(
      `/api/tienda/panel/zonas/${id}/toggle`,
      undefined,
      { headers: { 'X-Auth-Context': 'panel' } }
    ),

  getHorariosPanel: () =>
    apiClient.get<{ status: string; data: HorarioDia[] }>(
      '/api/tienda/panel/horario',
      { headers: { 'X-Auth-Context': 'panel' } }
    ),

  updateHorarioDiaPanel: (
    dia: string,
    payload: { horaInicio?: string; horaFin?: string; activo?: boolean }
  ) =>
    apiClient.put<{ status: string; data: HorarioDia }>(
      `/api/tienda/panel/horario/${dia}`,
      payload,
      { headers: { 'X-Auth-Context': 'panel' } }
    ),

  getReservacionesPanel: (params?: { fecha?: string; estado?: string; zonaId?: string }) =>
    apiClient.get<{ status: string; data: Reservacion[] }>(
      '/api/tienda/panel/reservaciones',
      { params, headers: { 'X-Auth-Context': 'panel' } }
    ),

  cambiarEstadoPanel: (
    id: string,
    estado: 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_SHOW'
  ) =>
    apiClient.patch<{ status: string; data: Reservacion }>(
      `/api/tienda/panel/reservaciones/${id}/estado`,
      { estado },
      { headers: { 'X-Auth-Context': 'panel' } }
    ),
}
