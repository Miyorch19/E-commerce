import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiClient } from '../../api/client'

export function TiendaPedidoConfirmacionPage() {
  const { id } = useParams<{ id: string }>()
  const [pedido, setPedido] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPedido() {
      try {
        const res = await apiClient.get(`/api/pedidos/${id}`, {
          headers: { 'X-Auth-Context': 'tienda' }
        })
        setPedido(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPedido()
  }, [id])

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center flex-col">
        <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
        <Link to="/tienda" className="text-indigo-400 hover:underline">Volver a la tienda</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-2">¡Pago exitoso!</h1>
        <p className="text-gray-400 mb-6">Tu pedido ha sido confirmado.</p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 mb-8 text-left border border-white/5">
          <p className="text-sm text-gray-400 mb-1">Número de pedido:</p>
          <p className="font-mono text-white mb-4">{pedido.id}</p>
          
          <p className="text-sm text-gray-400 mb-1">Total pagado:</p>
          <p className="text-2xl font-bold text-white">${pedido.total}</p>
        </div>

        <Link
          to="/tienda"
          className="block w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
