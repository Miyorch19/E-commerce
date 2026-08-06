import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useAuthStore } from '../stores/useAuthStore'
import { useTenantStore } from '../stores/useTenantStore'
import { negociosApi } from '../api/negocios'
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
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-400 font-medium">Tarjeta guardada correctamente</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#e5e7eb',
                '::placeholder': { color: '#6b7280' },
              },
            },
          }}
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
      >
        {processing ? 'Guardando...' : 'Guardar tarjeta'}
      </button>
    </form>
  )
}

/**
 * BillingSection — sección de facturación del panel admin.
 *
 * Solo se renderiza si el usuario tiene el permiso "facturacion:gestionar".
 * Esta lógica de guardado es para la tarjeta de la cuenta PRINCIPAL de la
 * plataforma (cobro de membresía mensual), NO para la cuenta Connect de Stripe.
 */
export function BillingSection() {
  const { usuario, hasPermission } = useAuthStore()
  const negocio = useTenantStore((s) => s.negocio)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [setupDone, setSetupDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAccess = hasPermission('facturacion:gestionar')

  // Si no tiene el permiso, muestra el componente deshabilitado con explicación
  if (!canAccess) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Método de pago de facturación</h2>
        <div className="bg-gray-800/40 border border-yellow-500/30 rounded-xl p-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ No tienes el permiso <code className="bg-gray-700 px-1 rounded">facturacion:gestionar</code> para acceder a esta sección. Contacta al administrador del negocio.
          </p>
        </div>
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
        <h2 className="text-2xl font-bold text-white">Método de pago de facturación</h2>
        <p className="text-gray-400 text-sm mt-1">
          Esta tarjeta se usará para el cobro mensual de tu membresía en la plataforma.
          Es independiente de tu cuenta de Stripe Connect para recibir pagos de clientes.
        </p>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-lg space-y-5">
        {/* Info del usuario */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
            {usuario?.nombre?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <p className="font-medium text-white">{usuario?.nombre}</p>
            <p className="text-sm text-gray-400">{usuario?.email}</p>
          </div>
        </div>

        {setupDone ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-green-400 font-medium">Tarjeta de facturación configurada</p>
            <p className="text-gray-500 text-sm mt-1">
              El equipo de la plataforma la usará para tus cobros mensuales.
            </p>
            <button
              onClick={() => { setSetupDone(false); setClientSecret(null) }}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              Cambiar tarjeta
            </button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SetupForm clientSecret={clientSecret} onSuccess={() => setSetupDone(true)} />
          </Elements>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-950/40 border border-blue-500/30 p-4 text-blue-300 text-sm">
              💡 Al agregar una tarjeta, autorizas a la plataforma a cobrar tu membresía mensual automáticamente.
            </div>
            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleInitSetup}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Preparando...' : 'Agregar tarjeta de facturación'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
