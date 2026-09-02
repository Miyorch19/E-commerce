import { useState, useEffect } from 'react'
import { Plus, Pencil, Power, Layers, Users, X } from 'lucide-react'
import { reservacionesApi, ZonaRestaurante } from '../../api/reservaciones'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../../components/ui'

export function ZonasPage() {
  const [zonas, setZonas] = useState<ZonaRestaurante[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Modal / Form state
  const [showModal, setShowModal] = useState(false)
  const [editingZona, setEditingZona] = useState<ZonaRestaurante | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidadMaxima: 4,
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchZonas = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await reservacionesApi.getZonasPanel()
      setZonas(res.data.data)
    } catch (err: any) {
      console.error('Error fetching zonas:', err)
      setErrorMsg(err.response?.data?.message || 'Error al obtener las zonas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZonas()
  }, [])

  const handleOpenCreate = () => {
    setEditingZona(null)
    setFormData({ nombre: '', descripcion: '', capacidadMaxima: 4 })
    setShowModal(true)
  }

  const handleOpenEdit = (zona: ZonaRestaurante) => {
    setEditingZona(zona)
    setFormData({
      nombre: zona.nombre,
      descripcion: zona.descripcion || '',
      capacidadMaxima: zona.capacidadMaxima,
    })
    setShowModal(true)
  }

  const handleToggle = async (id: string) => {
    try {
      await reservacionesApi.toggleZonaPanel(id)
      setZonas((prev) =>
        prev.map((z) => (z.id === id ? { ...z, activo: !z.activo } : z))
      )
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar zona')
    }
  }

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return
    setSubmitting(true)
    try {
      if (editingZona) {
        const res = await reservacionesApi.updateZonaPanel(editingZona.id, formData)
        setZonas((prev) =>
          prev.map((z) => (z.id === editingZona.id ? res.data.data : z))
        )
      } else {
        const res = await reservacionesApi.createZonaPanel(formData)
        setZonas((prev) => [...prev, res.data.data])
      }
      setShowModal(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar zona')
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
            Gestión de Zonas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra las zonas físicas del restaurante y su capacidad
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Nueva Zona
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Zones Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
              <div className="flex gap-2 pt-2">
                <div className="skeleton h-8 flex-1 rounded-lg" />
                <div className="skeleton h-8 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : zonas.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 mx-auto flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Sin zonas configuradas</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Crea la primera zona del restaurante para empezar a gestionar reservaciones.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800 transition-all duration-150 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Zona
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonas.map((zona) => (
            <Card
              key={zona.id}
              className={`relative transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                !zona.activo ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{zona.nombre}</CardTitle>
                    {zona.descripcion && (
                      <CardDescription className="mt-0.5 text-xs line-clamp-2">
                        {zona.descripcion}
                      </CardDescription>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                      zona.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {zona.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-sm text-slate-700 mb-4">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{zona.capacidadMaxima}</span>
                  <span className="text-slate-500 text-xs">personas máx.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(zona)}
                    title="Editar zona"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggle(zona.id)}
                    title={zona.activo ? 'Desactivar zona' : 'Activar zona'}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                      zona.activo
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {zona.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {editingZona ? 'Editar Zona' : 'Nueva Zona'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Nombre de la zona *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej. Terraza, Salón Principal"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Descripción breve de la zona (opcional)"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Capacidad máxima (personas)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={formData.capacidadMaxima}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, capacidadMaxima: parseInt(e.target.value) || 1 }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.nombre.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {submitting ? 'Guardando…' : editingZona ? 'Guardar cambios' : 'Crear zona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
