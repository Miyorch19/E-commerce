import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  User,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { usePanelStore } from '../stores/usePanelStore'
import { useTenantStore } from '../stores/useTenantStore'
import { negociosApi } from '../api/negocios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from './ui'
import axios from 'axios'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

function SetupForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setError(null)
    setProcessing(true)

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    })

    setProcessing(false)

    if (result.error) {
      setError(result.error.message ?? 'Error al guardar la tarjeta')
    } else {
      setDone(true)
      onSuccess()
    }
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
        <p className="text-emerald-700 font-semibold text-sm">Tarjeta guardada correctamente</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '15px',
                color: '#0f172a',
                '::placeholder': { color: '#94a3b8' },
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <Button
        type="submit"
        variant="primary"
        loading={processing}
        disabled={!stripe}
        className="w-full"
      >
        Guardar tarjeta
      </Button>
    </form>
  )
}

/**
 * BillingSection — sección de facturación del panel admin.
 */
export function BillingSection() {
  const { usuario, hasPermission } = usePanelStore()
  const negocio = useTenantStore((s) => s.negocio)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [setupDone, setSetupDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAccess = hasPermission('facturacion:gestionar')

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Método de pago de facturación</h2>
        </div>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5 flex items-start gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Acceso restringido:</span> No tienes el permiso{' '}
              <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-xs font-mono">
                facturacion:gestionar
              </code>{' '}
              para acceder a esta sección. Contacta al administrador del negocio.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function handleInitSetup() {
    if (!negocio) return
    setError(null)
    setLoading(true)
    try {
      const res = await negociosApi.createBillingSetupIntent(negocio.id)
      setClientSecret(res.data.data.clientSecret)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Error al iniciar el proceso')
      } else {
        setError('Error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Método de pago de facturación</h2>
        <p className="text-slate-500 text-sm mt-1">
          Esta tarjeta se usará para el cobro mensual de tu membresía en la plataforma.
          Es independiente de tu cuenta de Stripe Connect para recibir pagos de clientes.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardContent className="space-y-5 p-6">
          {/* Info del usuario */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
              {usuario?.nombre?.[0]?.toUpperCase() ?? <User className="w-5 h-5 text-slate-500" />}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{usuario?.nombre}</p>
              <p className="text-xs text-slate-500">{usuario?.email}</p>
            </div>
          </div>

          {setupDone ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <p className="text-slate-900 font-semibold text-base">Tarjeta de facturación configurada</p>
                <p className="text-slate-500 text-xs mt-1">
                  El equipo de la plataforma la usará para tus cobros mensuales.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => { setSetupDone(false); setClientSecret(null) }}
              >
                Cambiar tarjeta
              </Button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SetupForm clientSecret={clientSecret} onSuccess={() => setSetupDone(true)} />
            </Elements>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-sky-50/80 border border-sky-200/80 p-4 text-sky-800 text-xs flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Al agregar una tarjeta, autorizas a la plataforma a cobrar tu membresía mensual automáticamente.
                </span>
              </div>
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                variant="primary"
                loading={loading}
                icon={<CreditCard className="w-4 h-4" />}
                onClick={handleInitSetup}
                className="w-full"
              >
                Agregar tarjeta de facturación
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
