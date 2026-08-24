import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/useCartStore'
import { useTiendaStore } from '../stores/useTiendaStore'
import { authApi } from '../api/auth'
import { productosApi, ProductoTienda } from '../api/productos'

export function TiendaPage() {
  const navigate = useNavigate()
  const { items, total, itemCount, addItem } = useCartStore()
  const cliente = useTiendaStore((s) => s.cliente)
  const tiendaLogout = useTiendaStore((s) => s.logout)

  const [productos, setProductos] = useState<ProductoTienda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProductos() {
      try {
        const res = await productosApi.getProductos()
        setProductos(res.data.data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }
    loadProductos()
  }, [])

  async function handleLogout() {
    try {
      await authApi.logoutTienda()
    } catch {
      // Ignorar errores de red
    } finally {
      tiendaLogout()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-400">Mi Tienda</h1>
          <div className="flex items-center gap-4">
            {/* Cart Header */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>🛒</span>
              <span>{itemCount()} artículos</span>
              <span className="text-gray-600">|</span>
              <span className="font-semibold text-white">${total().toFixed(2)}</span>
            </div>
            
            {items.length > 0 && (
              <button
                onClick={() => navigate('/tienda/checkout')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition"
              >
                Pagar
              </button>
            )}

            {/* Auth */}
            {cliente ? (
              <div className="flex items-center gap-3 text-sm border-l border-white/10 pl-4">
                <span className="text-gray-300">
                  Hola, <span className="font-medium text-white">{cliente.nombre.split(' ')[0]}</span>
                </span>
                <button
                  id="tienda-logout"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition text-xs underline underline-offset-2"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                to="/tienda/login"
                id="tienda-login-link"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition border-l border-white/10 pl-4"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Catálogo de Productos</h2>
        
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando productos...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No hay productos disponibles por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div key={producto.id} className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden flex flex-col transition hover:border-white/20">
                <div className="h-48 bg-gray-800 flex items-center justify-center relative">
                  {producto.imagenes && producto.imagenes.length > 0 ? (
                    <img src={producto.imagenes[0].url} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                  {producto.categoria && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                      {producto.categoria.nombre}
                    </span>
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-white text-lg leading-tight mb-1">{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{producto.descripcion}</p>
                  )}
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-white">${Number(producto.precio).toFixed(2)}</p>
                      {producto.precioCompare && (
                        <p className="text-xs text-gray-500 line-through">${Number(producto.precioCompare).toFixed(2)}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addItem({
                        productoId: producto.id,
                        nombre: producto.nombre,
                        precio: Number(producto.precio),
                        cantidad: 1,
                        imagen: producto.imagenes?.[0]?.url
                      })}
                      className="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition"
                      aria-label="Agregar al carrito"
                    >
                      <span className="text-white">➕</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
