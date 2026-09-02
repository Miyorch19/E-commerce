import { useState, useEffect, useRef } from 'react'
import { Filter, RefreshCw, Check, X, CheckCheck, UserX, AlertTriangle } from 'lucide-react'
import { reservacionesApi, Reservacion, ZonaRestaurante } from '../../api/reservaciones'
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui'

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }

  return { toasts, addToast }
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  confirmClass?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmClass = 'bg-rose-600 hover:bg-rose-700 text-white',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type DestructiveAction = 'CANCELADA' | 'NO_SHOW'

interface PendingAction {
  reservacion: Reservacion
  estado: DestructiveAction
}

export function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [zonas, setZonas] = useState<ZonaRestaurante[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const { toasts, addToast } = useToast()

  // Filters
  const [filterFecha, setFilterFecha] = useState<string>('')
  const [filterEstado, setFilterEstado] = useState<string>('')
  const [filterZonaId, setFilterZonaId] = useState<string>('')

  const fetchInitial = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const [resZonas, resReservas] = await Promise.all([
        reservacionesApi.getZonasPanel(),
        reservacionesApi.getReservacionesPanel({
          fecha: filterFecha || undefined,
          estado: filterEstado || undefined,
          zonaId: filterZonaId || undefined,
        }),
      ])
      setZonas(resZonas.data.data)
      setReservaciones(resReservas.data.data)
    } catch (err: any) {
      console.error('Error fetching panel reservaciones:', err)
      setErrorMsg(err.response?.data?.message || 'Error al cargar reservaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitial()
  }, [filterFecha, filterEstado, filterZonaId])

  // Direct action (non-destructive)
  const handleDirectAction = async (
    id: string,
    nuevoEstado: 'CONFIRMADA' | 'COMPLETADA'
  ) => {
    try {
      await reservacionesApi.cambiarEstadoPanel(id, nuevoEstado)
      setReservaciones((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
      )
      const label = nuevoEstado === 'CONFIRMADA' ? 'Reservación confirmada' : 'Reservación completada'
      addToast(`✓ ${label}`, 'success')
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Error al cambiar estado', 'error')
    }
  }

  // Destructive action: request confirmation
  const handleRequestDestructive = (reservacion: Reservacion, estado: DestructiveAction) => {
    setPendingAction({ reservacion, estado })
  }

  // Destructive action: confirmed
  const handleConfirmDestructive = async () => {
    if (!pendingAction) return
    const { reservacion, estado } = pendingAction
    setPendingAction(null)
    try {
      await reservacionesApi.cambiarEstadoPanel(reservacion.id, estado)
      setReservaciones((prev) =>
        prev.map((r) => (r.id === reservacion.id ? { ...r, estado } : r))
      )
      const label = estado === 'CANCELADA' ? 'Reservación cancelada' : 'Marcado como No-Show'
      addToast(`${label}`, estado === 'CANCELADA' ? 'error' : 'success')
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Error al cambiar estado', 'error')
    }
  }

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'PENDIENTE':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'COMPLETADA':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'CANCELADA':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'NO_SHOW':
        return 'bg-slate-100 text-slate-500 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const confirmModalConfig = pendingAction
    ? pendingAction.estado === 'CANCELADA'
      ? {
          title: 'Cancelar reservación',
          description: `¿Estás seguro de cancelar la reservación de ${
            pendingAction.reservacion.cliente?.nombre || 'este cliente'
          } el ${pendingAction.reservacion.fecha?.split('T')[0]} a las ${pendingAction.reservacion.horaInicio}?`,
          confirmLabel: 'Sí, cancelar',
          confirmClass: 'bg-rose-600 hover:bg-rose-700 text-white',
        }
      : {
          title: 'Marcar como No-Show',
          description: `¿Confirmas que ${
            pendingAction.reservacion.cliente?.nombre || 'el cliente'
          } no se presentó el ${pendingAction.reservacion.fecha?.split('T')[0]} a las ${pendingAction.reservacion.horaInicio}?`,
          confirmLabel: 'Sí, marcar No-Show',
          confirmClass: 'bg-slate-900 hover:bg-slate-800 text-white',
        }
    : null

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in slide-in-from-bottom-4 fade-in duration-300 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmModalConfig && (
        <ConfirmModal
          open={!!pendingAction}
          title={confirmModalConfig.title}
          description={confirmModalConfig.description}
          confirmLabel={confirmModalConfig.confirmLabel}
          confirmClass={confirmModalConfig.confirmClass}
          onConfirm={handleConfirmDestructive}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Reservaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitorea y administra el estado de las reservaciones de tus clientes
          </p>
        </div>
        <button
          onClick={fetchInitial}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filtros:</span>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NO_SHOW">No-Show</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Zona
            </label>
            <select
              value={filterZonaId}
              onChange={(e) => setFilterZonaId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="">Todas las zonas</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre}
                </option>
              ))}
            </select>
          </div>

          {(filterFecha || filterEstado || filterZonaId) && (
            <div className="pt-4 sm:pt-0">
              <button
                onClick={() => {
                  setFilterFecha('')
                  setFilterEstado('')
                  setFilterZonaId('')
                }}
                className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          {/* Header row skeleton */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex gap-4">
            {[120, 80, 100, 70, 80, 100, 60].map((w, i) => (
              <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}px` }} />
            ))}
          </div>
          {/* Data row skeletons */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="px-4 py-4 flex gap-4 items-center border-b border-slate-100 last:border-0"
            >
              <div className="space-y-1.5 flex-1">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-44" />
              </div>
              <div className="skeleton h-4 w-20 shrink-0" />
              <div className="space-y-1.5 shrink-0">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-16" />
              </div>
              <div className="skeleton h-4 w-16 shrink-0" />
              <div className="skeleton h-6 w-24 rounded-full shrink-0" />
              <div className="skeleton h-3 w-20 shrink-0" />
              <div className="flex gap-1.5 ml-auto shrink-0">
                <div className="skeleton h-7 w-7 rounded-lg" />
                <div className="skeleton h-7 w-7 rounded-lg" />
                <div className="skeleton h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : reservaciones.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 mx-auto flex items-center justify-center mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Sin reservaciones</h3>
          <p className="text-xs text-slate-500 mt-1">
            No hay reservaciones que coincidan con los filtros aplicados.
          </p>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Fecha &amp; Hora</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservaciones.map((r) => {
                const fechaFormatted = r.fecha ? r.fecha.split('T')[0] : ''
                return (
                  <TableRow
                    key={r.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <TableCell>
                      <div>
                        <span className="font-semibold text-slate-900 block text-sm">
                          {r.cliente?.nombre || 'Cliente'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {r.cliente?.email || '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800 text-sm">
                        {r.zona?.nombre || 'Zona'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-slate-800 block">{fechaFormatted}</span>
                        <span className="text-slate-500 font-mono">{r.horaInicio}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800 text-sm">
                        {r.numeroPersonas} pers.
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
                          r.estado
                        )}`}
                      >
                        {r.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 italic max-w-[140px] truncate block">
                        {r.notas || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Confirmar — no destructivo */}
                        {r.estado !== 'CONFIRMADA' &&
                          r.estado !== 'COMPLETADA' &&
                          r.estado !== 'CANCELADA' && (
                            <button
                              onClick={() => handleDirectAction(r.id, 'CONFIRMADA')}
                              title="Confirmar reservación"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-all duration-200 hover:scale-105"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                        {/* Completar — no destructivo */}
                        {r.estado !== 'COMPLETADA' &&
                          r.estado !== 'CANCELADA' &&
                          r.estado !== 'NO_SHOW' && (
                            <button
                              onClick={() => handleDirectAction(r.id, 'COMPLETADA')}
                              title="Marcar como completada"
                              className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80 transition-all duration-200 hover:scale-105"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                        {/* Cancelar — destructivo, requiere confirmación */}
                        {r.estado !== 'CANCELADA' &&
                          r.estado !== 'COMPLETADA' && (
                            <button
                              onClick={() =>
                                handleRequestDestructive(r, 'CANCELADA')
                              }
                              title="Cancelar reservación"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 transition-all duration-200 hover:scale-105"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                        {/* No-Show — destructivo, requiere confirmación */}
                        {r.estado !== 'NO_SHOW' &&
                          r.estado !== 'COMPLETADA' &&
                          r.estado !== 'CANCELADA' && (
                            <button
                              onClick={() =>
                                handleRequestDestructive(r, 'NO_SHOW')
                              }
                              title="Marcar No-Show"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80 transition-all duration-200 hover:scale-105"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
