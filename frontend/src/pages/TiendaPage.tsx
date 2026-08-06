import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore } from '../stores/useCartStore'
import { pedidosApi } from '../api/pedidos'
import axios from 'axios'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

function CheckoutForm({ pedidoId, onSuccess }: { pedidoId: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const clearCart = useCartStore((s) => s.clearCart)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setError(null)
    setProcessing(true)

    try {
      // El frontend solo envía el pedidoId — el backend recalcula el monto
      const res = await pedidosApi.createPaymentIntent(pedidoId)
      const { clientSecret } = res.data.data

      const cardElement = elements.getElement(CardElement)!
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (result.error) {
        setError(result.error.message ?? 'Error al procesar el pago')
      } else if (result.paymentIntent?.status === 'succeeded') {
        clearCart()
        onSuccess()
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Error al crear el pago')
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
        <p className="text-red-400 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
      >
        {processing ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  )
}

export function TiendaPage() {
  const { items, total, itemCount } = useCartStore()
  const [pedidoId] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-400">Mi Tienda</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>🛒</span>
            <span>{itemCount()} artículos</span>
            <span className="text-gray-600">|</span>
            <span className="font-semibold text-white">${total().toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {paid ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Pago exitoso!</h2>
            <p className="text-gray-400">Tu pedido ha sido confirmado.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg">El carrito está vacío</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-white">Tu carrito</h2>
              {items.map((item) => (
                <div
                  key={`${item.productoId}-${item.varianteId}`}
                  className="flex items-center gap-4 bg-gray-800/40 border border-white/10 rounded-xl p-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center text-2xl shrink-0">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover rounded-lg" />
                    ) : '📦'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.nombre}</p>
                    <p className="text-sm text-gray-400">Cantidad: {item.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
            <div className="space-y-4">
              <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Resumen del pedido</h3>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span>${total().toFixed(2)}</span>
                </div>
              </div>

              {pedidoId ? (
                <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">Pago con tarjeta</h3>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm pedidoId={pedidoId} onSuccess={() => setPaid(true)} />
                  </Elements>
                </div>
              ) : (
                <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition">
                  Continuar con el pago
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
