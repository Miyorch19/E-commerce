import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTiendaStore } from '../../../../stores/useTiendaStore'
import {
  reservacionesApi,
  ZonaRestaurante,
  HorarioDia,
} from '../../../../api/reservaciones'

export default function ReservarPage() {
  const navigate = useNavigate()
  const cliente = useTiendaStore((s) => s.cliente)
  const token = useTiendaStore((s) => s.token)

  // State
  const [zonas, setZonas] = useState<ZonaRestaurante[]>([])
  const [horarios, setHorarios] = useState<HorarioDia[]>([])
  const [loadingZonas, setLoadingZonas] = useState(true)

  // Form selections
  const [selectedZonaId, setSelectedZonaId] = useState<string>('')
  const [fecha, setFecha] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedHora, setSelectedHora] = useState<string>('')
  const [numeroPersonas, setNumeroPersonas] = useState<number>(2)
  const [notas, setNotas] = useState<string>('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any | null>(null)

  // Initial load: zonas and horarios
  useEffect(() => {
    if (!token) return

    setLoadingZonas(true)
    Promise.all([
      reservacionesApi.getZonas(),
      reservacionesApi.getHorario(),
    ])
      .then(([resZonas, resHorarios]) => {
        const activeZonas = resZonas.data.data.filter((z) => z.activo)
        setZonas(activeZonas)
        if (activeZonas.length > 0) {
          setSelectedZonaId(activeZonas[0].id)
        }
        setHorarios(resHorarios.data.data)
      })
      .catch((err) => {
        console.error('Error fetching initial reservation data:', err)
        setErrorMsg('Error al cargar información del restaurante')
      })
      .finally(() => setLoadingZonas(false))
  }, [token])

  // Calculate day of week and available slots for selected fecha
  const getSelectedDayInfo = () => {
    if (!fecha) return { isClosed: false, slots: [] }
    // Parse fecha string (YYYY-MM-DD) in local/UTC date
    const [year, month, day] = fecha.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const dayNames = [
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
    ]
    const diaSemana = dayNames[dateObj.getDay()]
    const horarioDia = horarios.find((h) => h.dia === diaSemana)

    if (!horarioDia || !horarioDia.activo) {
      return { isClosed: true, slots: [] }
    }
    return { isClosed: false, slots: horarioDia.slots || [] }
  }

  const { isClosed, slots } = getSelectedDayInfo()

  // Reset selectedHora if it's no longer in the new slots list
  useEffect(() => {
    if (isClosed || (slots.length > 0 && !slots.includes(selectedHora))) {
      setSelectedHora(slots[0] || '')
    }
  }, [fecha, isClosed, slots, selectedHora])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!selectedZonaId) {
      setErrorMsg('Por favor selecciona una zona.')
      return
    }
    if (!fecha) {
      setErrorMsg('Por favor selecciona una fecha.')
      return
    }
    if (isClosed) {
      setErrorMsg('El restaurante está cerrado el día seleccionado.')
      return
    }
    if (!selectedHora) {
      setErrorMsg('Por favor selecciona un horario disponible.')
      return
    }
    if (numeroPersonas < 1) {
      setErrorMsg('El número de personas debe ser al menos 1.')
      return
    }

    setSubmitting(true)
    try {
      const res = await reservacionesApi.crearReservacion({
        zonaId: selectedZonaId,
        fecha,
        horaInicio: selectedHora,
        numeroPersonas,
        notas,
      })
      setSuccessData(res.data.data)
    } catch (err: any) {
      console.error('Error al crear reservacion:', err)
      if (err.response?.status === 401) {
        navigate('/tienda/login')
        return
      }
      const backendMessage =
        err.response?.data?.message ||
        'No se pudo realizar la reservación. Intenta con otro horario o zona.'
      setErrorMsg(backendMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // If not logged in
  if (!cliente || !token) {
    return (
      <div className="bg-[var(--color-primary)] min-h-screen pt-28 pb-16 px-4 font-[family-name:var(--font-mono)] flex justify-center items-center">
        <div className="bg-[var(--color-primary)] border-2 border-[var(--color-accent)] p-8 max-w-md w-full text-center shadow-lg">
          <h2 className="font-[family-name:var(--font-serif)] italic text-3xl text-[var(--color-accent)] mb-4">
            /Reservar Mesa/
          </h2>
          <p className="text-[var(--color-dark)] text-sm mb-6 uppercase tracking-wider">
            Inicia sesión para reservar una mesa en nuestro restaurante.
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

  // Success view
  if (successData) {
    const selectedZona = zonas.find((z) => z.id === successData.zonaId)
    return (
      <div className="bg-[var(--color-primary)] min-h-screen pt-28 pb-16 px-4 font-[family-name:var(--font-mono)] flex justify-center items-center">
        <div className="bg-[var(--color-primary)] border-2 border-[var(--color-accent)] p-8 max-w-lg w-full text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full mb-4">
            ✓
          </div>
          <h2 className="font-[family-name:var(--font-serif)] italic text-4xl text-[var(--color-accent)] mb-2">
            /¡Reservación Confirmada!/
          </h2>
          <p className="text-[var(--color-dark)] text-xs uppercase tracking-widest mb-6">
            Tu mesa ha sido reservada con éxito
          </p>

          <div className="border-y-2 border-dashed border-[var(--color-accent)] py-4 my-4 text-left space-y-2 text-sm text-[var(--color-dark)]">
            <p>
              <strong className="text-[var(--color-accent)] uppercase">Zona:</strong>{' '}
              {successData.zona?.nombre || selectedZona?.nombre || 'Zona'}
            </p>
            <p>
              <strong className="text-[var(--color-accent)] uppercase">Fecha:</strong>{' '}
              {successData.fecha ? successData.fecha.split('T')[0] : fecha}
            </p>
            <p>
              <strong className="text-[var(--color-accent)] uppercase">Hora:</strong>{' '}
              {successData.horaInicio}
            </p>
            <p>
              <strong className="text-[var(--color-accent)] uppercase">Personas:</strong>{' '}
              {successData.numeroPersonas}
            </p>
            {successData.notas && (
              <p>
                <strong className="text-[var(--color-accent)] uppercase">Notas:</strong>{' '}
                {successData.notas}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              to="/tienda/mis-reservaciones"
              className="flex-1 bg-[var(--color-accent)] text-[var(--color-primary)] py-3 px-4 text-xs uppercase tracking-widest font-bold text-center hover:opacity-90 transition-opacity"
            >
              Mis Reservaciones
            </Link>
            <button
              onClick={() => {
                setSuccessData(null)
                setErrorMsg(null)
              }}
              className="flex-1 border border-[var(--color-accent)] text-[var(--color-accent)] py-3 px-4 text-xs uppercase tracking-widest font-bold text-center hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
            >
              Otra Reserva
            </button>
          </div>
        </div>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-[var(--color-primary)] min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-mono)]">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-[family-name:var(--font-serif)] italic text-5xl sm:text-6xl text-[var(--color-accent)] mb-2">
            /Reservar Mesa/
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dark)]/80">
            Selecciona zona, fecha y horario de tu preferencia
          </p>
          <div className="border-b-2 border-dashed border-[var(--color-accent)] mt-6 w-full"></div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-100 border-2 border-red-500 text-red-800 p-4 mb-8 text-sm font-semibold flex items-start justify-between">
            <div>
              <strong className="block uppercase text-xs tracking-wider mb-1">
                Aviso:
              </strong>
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-800 hover:text-red-950 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {loadingZonas ? (
          <div className="text-center py-12 text-sm uppercase tracking-widest text-[var(--color-accent)]">
            Cargando información...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Zona Selection */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)] mb-3">
                1. Selección de Zona
              </label>
              {zonas.length === 0 ? (
                <p className="text-xs text-[var(--color-dark)] opacity-70">
                  No hay zonas activas disponibles actualmente.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {zonas.map((z) => {
                    const isSelected = selectedZonaId === z.id
                    return (
                      <div
                        key={z.id}
                        onClick={() => setSelectedZonaId(z.id)}
                        className={`cursor-pointer p-4 border-2 transition-all ${
                          isSelected
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)] shadow-md'
                            : 'border-[var(--color-dark)]/20 bg-transparent text-[var(--color-dark)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-sm uppercase tracking-wider">
                            {z.nombre}
                          </h3>
                          <span
                            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                              isSelected
                                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                : 'border-[var(--color-dark)]/30 text-[var(--color-dark)]/70'
                            }`}
                          >
                            Máx {z.capacidadMaxima} pers.
                          </span>
                        </div>
                        {z.descripcion && (
                          <p
                            className={`text-xs ${
                              isSelected
                                ? 'text-[var(--color-primary)]/90'
                                : 'text-[var(--color-dark)]/70'
                            }`}
                          >
                            {z.descripcion}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 2. Fecha Selection */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)] mb-2">
                2. Fecha de Reservación
              </label>
              <input
                type="date"
                min={todayStr}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-transparent border-2 border-[var(--color-dark)]/30 text-[var(--color-dark)] p-3 text-sm font-[family-name:var(--font-mono)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            {/* 3. Slot Selection */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)] mb-3">
                3. Horario Disponible
              </label>
              {isClosed ? (
                <div className="p-4 border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-center text-xs uppercase tracking-widest font-bold">
                  El restaurante está cerrado este día
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-[var(--color-dark)] opacity-70">
                  No hay horarios configurados para este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedHora === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedHora(slot)}
                        className={`py-2 px-3 text-xs uppercase tracking-wider font-bold border-2 transition-all ${
                          isSelected
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-primary)]'
                            : 'border-[var(--color-dark)]/20 text-[var(--color-dark)] hover:border-[var(--color-accent)]'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 4. Número de Personas */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)] mb-2">
                4. Número de Personas
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={numeroPersonas}
                onChange={(e) =>
                  setNumeroPersonas(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full bg-transparent border-2 border-[var(--color-dark)]/30 text-[var(--color-dark)] p-3 text-sm font-[family-name:var(--font-mono)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            {/* 5. Notas opcionales */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)] mb-2">
                5. Notas o Solicitudes Especiales (Opcional)
              </label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Silla de bebé, preferencia de mesa cerca de la ventana..."
                className="w-full bg-transparent border-2 border-[var(--color-dark)]/30 text-[var(--color-dark)] p-3 text-sm font-[family-name:var(--font-mono)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || isClosed}
                className="w-full bg-[var(--color-accent)] text-[var(--color-primary)] py-4 text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Confirmando...' : 'Confirmar Reservación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
