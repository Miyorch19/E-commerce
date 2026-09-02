import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTiendaStore } from '../../../../stores/useTiendaStore'
import { reservacionesApi, Reservacion } from '../../../../api/reservaciones'

export default function MisReservacionesPage() {
  const navigate = useNavigate()
  const cliente = useTiendaStore((s) => s.cliente)
  const token = useTiendaStore((s) => s.token)

  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const fetchReservaciones = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await reservacionesApi.getMisReservaciones()
      setReservaciones(res.data.data)
    } catch (err: any) {
      console.error('Error fetching mis reservaciones:', err)
      if (err.response?.status === 401) {
        navigate('/tienda/login')
        return
      }
      setErrorMsg('Error al obtener tus reservaciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchReservaciones()
    }
  }, [token])

  const handleCancelar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reservación?')) {
      return
    }

    setCancelingId(id)
    try {
      await reservacionesApi.cancelarReservacion(id)
      // Update local status
      setReservaciones((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: 'CANCELADA' } : r))
      )
    } catch (err: any) {
      console.error('Error al cancelar reservacion:', err)
      alert(
        err.response?.data?.message ||
          'No se pudo cancelar la reservación. Inténtalo de nuevo.'
      )
    } finally {
      setCancelingId(null)
    }
  }

  // Helper for badge color
  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-emerald-700 text-white border-emerald-800'
      case 'PENDIENTE':
        return 'bg-amber-600 text-white border-amber-700'
      case 'CANCELADA':
        return 'bg-red-800 text-white border-red-900 opacity-80'
      case 'COMPLETADA':
        return 'bg-blue-700 text-white border-blue-800'
      case 'NO_SHOW':
        return 'bg-gray-700 text-white border-gray-800'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  if (!cliente || !token) {
    return (
      <div className="bg-[var(--color-primary)] min-h-screen pt-28 pb-16 px-4 font-[family-name:var(--font-mono)] flex justify-center items-center">
        <div className="bg-[var(--color-primary)] border-2 border-[var(--color-accent)] p-8 max-w-md w-full text-center shadow-lg">
          <h2 className="font-[family-name:var(--font-serif)] italic text-3xl text-[var(--color-accent)] mb-4">
            /Mis Reservaciones/
          </h2>
          <p className="text-[var(--color-dark)] text-sm mb-6 uppercase tracking-wider">
            Inicia sesión para ver el historial de tus reservaciones.
          </p>
          <Link
            to="/tienda/login"
            className="inline-block bg-[var(--color-accent)] text-[var(--color-primary)] px-8 py-3 text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-primary)] min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-mono)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] italic text-4xl sm:text-5xl text-[var(--color-accent)] mb-1">
              /Mis Reservaciones/
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dark)]/80">
              Historial y estado de tus mesas reservadas
            </p>
          </div>
          <Link
            to="/tienda/reservar"
            className="inline-block bg-[var(--color-accent)] text-[var(--color-primary)] px-6 py-3 text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity text-center"
          >
            + Nueva Reservación
          </Link>
        </div>

        <div className="border-b-2 border-dashed border-[var(--color-accent)] mb-8"></div>

        {errorMsg && (
          <div className="bg-red-100 border-2 border-red-500 text-red-800 p-4 mb-8 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-sm uppercase tracking-widest text-[var(--color-accent)]">
            Cargando reservaciones...
          </div>
        ) : reservaciones.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--color-dark)]/20 p-8">
            <p className="text-sm uppercase tracking-wider text-[var(--color-dark)]/80 mb-4">
              Aún no tienes ninguna reservación registrada.
            </p>
            <Link
              to="/tienda/reservar"
              className="inline-block border-2 border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
            >
              Reservar una Mesa
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservaciones.map((r) => {
              const canCancel =
                r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'
              const fechaFormatted = r.fecha ? r.fecha.split('T')[0] : ''

              return (
                <div
                  key={r.id}
                  className="border-2 border-[var(--color-dark)]/20 p-5 bg-transparent text-[var(--color-dark)] transition-all hover:border-[var(--color-accent)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base uppercase tracking-wider">
                          {r.zona?.nombre || 'Zona'}
                        </h3>
                        <span
                          className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 border ${getBadgeStyle(
                            r.estado
                          )}`}
                        >
                          {r.estado}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-dark)]/90 pt-1">
                        <p>
                          <strong className="text-[var(--color-accent)] uppercase">
                            Fecha:
                          </strong>{' '}
                          {fechaFormatted}
                        </p>
                        <p>
                          <strong className="text-[var(--color-accent)] uppercase">
                            Hora:
                          </strong>{' '}
                          {r.horaInicio}
                        </p>
                        <p>
                          <strong className="text-[var(--color-accent)] uppercase">
                            Personas:
                          </strong>{' '}
                          {r.numeroPersonas}
                        </p>
                      </div>

                      {r.notas && (
                        <p className="text-xs text-[var(--color-dark)]/70 italic pt-1">
                          Notas: "{r.notas}"
                        </p>
                      )}
                    </div>

                    {canCancel && (
                      <div>
                        <button
                          onClick={() => handleCancelar(r.id)}
                          disabled={cancelingId === r.id}
                          className="w-full sm:w-auto border border-red-600 text-red-600 px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {cancelingId === r.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
