import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { useTenantStore } from '../stores/useTenantStore'

export interface MenuItem {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagenes: string[]
  imagenMenu?: string
}

export function useProductos() {
  const [productos, setProductos] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const negocio = useTenantStore((s) => s.negocio)

  useEffect(() => {
    // Para simplificar, usaremos GET /api/productos
    // Esto funciona porque apiClient usa resolveTenant (a traves del header X-Tenant-Domain o Host)
    const fetchProductos = async () => {
      try {
        const res = await apiClient.get('/api/productos?limit=100')
        // Mapear los datos que vienen del backend a la interfaz MenuItem del demo
        const mapped: MenuItem[] = res.data.data.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          precio: p.precio,
          // Si tuviéramos categoría real poblada, la usaríamos, 
          // pero el backend devuelve categoriaId. Si el include de categoria está, usamos el nombre.
          categoria: p.categoria?.nombre || 'General', 
          imagenes: p.imagenes?.map((img: any) => img.url) || [],
          imagenMenu: p.imagenes?.[0]?.url
        }))
        setProductos(mapped)
      } catch (err: any) {
        setError(err.message || 'Error loading products')
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [negocio])

  return { productos, loading, error }
}
