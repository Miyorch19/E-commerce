import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import { usePanelStore } from '../../stores/usePanelStore'
import { apiClient } from '../../api/client'
import { Card, CardContent, Button } from '../../components/ui'

export function ConfiguracionPagosExitoPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const usuario = usePanelStore((s) => s.usuario)

  useEffect(() => {
    async function verifyStatus() {
      if (!usuario?.negocioId) return
      try {
        const res = await apiClient.get(`/api/negocios/${usuario.negocioId}/stripe/estado`)
        const { chargesEnabled, detailsSubmitted, onboardingCompleto } = res.data.data
        if (chargesEnabled && detailsSubmitted && onboardingCompleto) {
          setSuccess(true)
        } else {
          setError('El onboarding de Stripe no se ha completado por completo. Revisa la configuración e intenta nuevamente.')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Hubo un error al verificar el estado de Stripe.')
      } finally {
        setLoading(false)
      }
    }
    verifyStatus()
  }, [usuario])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <Card className="max-w-md w-full p-6 text-center shadow-md">
        <h1 className="text-xl font-bold text-slate-900 mb-4">
          Verificación de Configuración de Pagos
        </h1>

        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="w-10 h-10 text-slate-700 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">
              Verificando estado con Stripe, por favor espera...
            </p>
          </div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <Button
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Volver al Panel
            </Button>
          </div>
        ) : success ? (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-emerald-700 font-semibold">
              ¡Configuración de pagos completada exitosamente!
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Ir al Panel
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
