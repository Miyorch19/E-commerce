import { apiClient } from './client'

export interface CategoriaProducto {
  id: string
  nombre: string
}

export interface ImagenProducto {
  id: string
  url: string
  orden: number
}

export interface ProductoTienda {
  id: string
  nombre: string
  descripcion: string | null
  precio: string | number
  precioCompare: string | number | null
  stock: number
  categoria?: CategoriaProducto
  imagenes?: ImagenProducto[]
}

export const productosApi = {
  /**
   * Obtiene la lista de productos activos para la tienda.
   * Public endpoint (solo requiere X-Tenant-Domain).
   */
  getProductos: (page = 1, limit = 20) =>
    apiClient.get<{ data: ProductoTienda[], meta: { total: number, page: number, totalPages: number } }>(
      `/api/productos`,
      { params: { page, limit } }
    ),

  /**
   * Obtiene un producto por ID.
   */
  getProductoById: (id: string) =>
    apiClient.get<{ data: ProductoTienda }>(`/api/productos/${id}`)
}
