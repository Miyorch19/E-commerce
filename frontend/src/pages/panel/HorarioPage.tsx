import { useState, useEffect } from 'react'
import { Save, CheckCircle2, AlertTriangle } from 'lucide-react'
import { reservacionesApi, HorarioDia } from '../../api/reservaciones'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui'

const DIAS_ORDEN = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
]

const DIA_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
}

export function HorarioPage() {
  const [horarios, setHorarios] = useState<HorarioDia[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchHorarios = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await reservacionesApi.getHorariosPanel()
      const list = res.data.data

      // Ensure all 7 days exist in local state
      const fullList: HorarioDia[] = DIAS_ORDEN.map((dia) => {
        const found = list.find((h) => h.dia === dia)
        if (found) return { ...found }
        return {
          id: '',
          dia,
          horaInicio: '12:00',
          horaFin: '23:00',
          activo: false,
          slots: [],
        }
      })

      setHorarios(fullList)
    } catch (err: any) {
      console.error('Error fetching horarios:', err)
      setErrorMsg(err.response?.data?.message || 'Error al obtener los horarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHorarios()
  }, [])

  const handleToggleDia = (dia: string) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, activo: !h.activo } : h))
    )
  }

  const handleChangeTime = (dia: string, field: 'horaInicio' | 'horaFin', value: string) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, [field]: value } : h))
    )
  }

  const handleSaveAll = async () => {
    setSubmitting(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      await Promise.all(
        horarios.map((h) =>
          reservacionesApi.updateHorarioDiaPanel(h.dia, {
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            activo: h.activo,
          })
        )
      )
      setSuccessMsg('Horario semanal guardado exitosamente.')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      console.error('Error updating horarios:', err)
      setErrorMsg(err.response?.data?.message || 'Error al guardar el horario')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Horarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configura los días de apertura y rangos de atención del restaurante
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={submitting || loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Guardando…' : 'Guardar Cambios'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main List */}
      <Card className="animate-card-entry overflow-hidden">
        <CardHeader>
          <CardTitle>Horario Semanal</CardTitle>
          <CardDescription>
            Activa o desactiva días y ajusta la hora de inicio y fin. Los cambios se aplican al guardar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="skeleton h-6 w-11 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-4 w-20" />
                      <div className="skeleton h-3 w-12" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-8 w-24 rounded-lg" />
                    <div className="skeleton h-4 w-4 rounded" />
                    <div className="skeleton h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {horarios.map((h) => (
                <div
                  key={h.dia}
                  className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !h.activo ? 'bg-slate-50/60' : 'bg-white'
                  }`}
                >
                  {/* Day toggle */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleToggleDia(h.dia)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        h.activo ? 'bg-slate-900' : 'bg-slate-300'
                      }`}
                      aria-label={`${h.activo ? 'Cerrar' : 'Abrir'} ${DIA_LABELS[h.dia]}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          h.activo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        {DIA_LABELS[h.dia]}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          h.activo ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {h.activo ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>

                  {/* Hours Range */}
                  <div className={`flex items-center gap-3 transition-opacity ${!h.activo ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                        Apertura
                      </label>
                      <input
                        type="time"
                        disabled={!h.activo}
                        value={h.horaInicio}
                        onChange={(e) => handleChangeTime(h.dia, 'horaInicio', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 transition"
                      />
                    </div>

                    <span className="text-slate-400 font-medium mt-4">→</span>

                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                        Cierre
                      </label>
                      <input
                        type="time"
                        disabled={!h.activo}
                        value={h.horaFin}
                        onChange={(e) => handleChangeTime(h.dia, 'horaFin', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 transition"
                      />
                    </div>

                    {h.activo && h.horaInicio && h.horaFin && (
                      <div className="pt-4">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {Math.floor(
                            (parseInt(h.horaFin.split(':')[0]) * 60 + parseInt(h.horaFin.split(':')[1]) -
                              (parseInt(h.horaInicio.split(':')[0]) * 60 + parseInt(h.horaInicio.split(':')[1]))) / 60
                          )}h{' '}
                          {(parseInt(h.horaFin.split(':')[0]) * 60 + parseInt(h.horaFin.split(':')[1]) -
                            (parseInt(h.horaInicio.split(':')[0]) * 60 + parseInt(h.horaInicio.split(':')[1]))) % 60 > 0
                            ? `${(parseInt(h.horaFin.split(':')[0]) * 60 + parseInt(h.horaFin.split(':')[1]) -
                                (parseInt(h.horaInicio.split(':')[0]) * 60 + parseInt(h.horaInicio.split(':')[1]))) % 60}min`
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
