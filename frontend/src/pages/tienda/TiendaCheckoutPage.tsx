import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useCartStore } from '../../stores/useCartStore'
import { pedidosApi } from '../../api/pedidos'
import axios from 'axios'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

// ---------------------------------------------------------------------------
// Inner form — only mounted after Elements is loaded with clientSecret
// ---------------------------------------------------------------------------
function StripePayForm({
  pedidoId,
  clientSecret,
  onSuccess,
}: {
  pedidoId: string
  clientSecret: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setError(null)
    setProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)!
      const result = await stripe.confirmCardPayment(clientSecret, { 
        payment_method: { card: cardElement } 
      })

      if (result.error) {
        setError(result.error.message ?? 'Error al procesar el pago')
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess()
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Error al procesar el pago')
      } else {
        setError('Error inesperado')
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
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
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
      >
        {processing ? 'Procesando...' : 'Confirmar pago'}
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Checkout page
// ---------------------------------------------------------------------------
export function TiendaCheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()

  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // Redirect if cart is empty, unless we just completed the order
  useEffect(() => {
    if (!isCompleted && items.length === 0) {
      navigate('/tienda', { replace: true })
    }
  }, [items.length, isCompleted, navigate])

  async function handlePlaceOrder() {
    setOrderError(null)
    setCreatingOrder(true)
    try {
      /**
       * 1. Create the Pedido in the backend – the backend derives the total
       *    from the cart items stored in DB, never from the frontend.
       */
      const orderRes = await pedidosApi.crearPedido(
        items.map((i) => ({
          productoId: i.productoId,
          varianteId: i.varianteId,
          cantidad: i.cantidad,
        }))
      )
      const newPedidoId: string = orderRes.data.data.id

      /**
       * 2. Ask the backend to create a PaymentIntent for this Pedido.
       *    We only send the pedidoId – amount is computed server-side.
       */
      const piRes = await pedidosApi.createPaymentIntent(newPedidoId)
      const secret: string = piRes.data.data.clientSecret

      setPedidoId(newPedidoId)
      setClientSecret(secret)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOrderError(err.response?.data?.message ?? 'Error al procesar la solicitud (¿El negocio configuró sus pagos?)')
      } else {
        setOrderError('Error inesperado')
      }
    } finally {
      setCreatingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/tienda" className="text-gray-400 hover:text-white transition text-sm">
            ← Volver
          </Link>
          <h1 className="font-semibold text-white">Checkout</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order summary */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-lg font-semibold text-white">Resumen del pedido</h2>
            {items.map((item) => (
              <div
                key={`${item.productoId}-${item.varianteId}`}
                className="flex items-center gap-4 bg-gray-800/40 border border-white/10 rounded-xl p-4"
              >
                <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {item.imagen
                    ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    : '📦'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{item.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Cantidad: {item.cantidad}</p>
                </div>
                <p className="font-bold text-white text-sm">${(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}

            {/* Total */}
            <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Subtotal</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white text-base">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * El monto final es calculado y verificado por el servidor.
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white">Pago</h2>

            {orderError && (
              <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-red-300 text-sm">
                {orderError}
              </div>
            )}

            {clientSecret && pedidoId ? (
              <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePayForm
                    pedidoId={pedidoId}
                    clientSecret={clientSecret}
                    onSuccess={() => {
                      setIsCompleted(true)
                      navigate(`/tienda/pedido/${pedidoId}/confirmacion`, { replace: true })
                      clearCart()
                    }}
                  />
                </Elements>
              </div>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={creatingOrder || items.length === 0}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
              >
                {creatingOrder ? 'Preparando pago...' : 'Proceder al pago ➔'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
