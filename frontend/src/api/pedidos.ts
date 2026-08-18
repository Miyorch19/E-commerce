import { apiClient } from './client'

export interface PedidoItemPayload {
  productoId: string
  varianteId?: string
  cantidad: number
}

export const pedidosApi = {
  /**
   * Crea un Pedido a partir de los items del carrito.
   * El backend calcula el total — el frontend solo manda los productos.
   */
  crearPedido: (items: PedidoItemPayload[]) =>
    apiClient.post<{ data: { id: string } }>('/api/pedidos', { items }, { headers: { 'X-Auth-Context': 'tienda' } }),

  /**
   * Crea un PaymentIntent para el pago del pedido.
   * IMPORTANTE: El frontend solo envía el pedidoId — el backend recalcula
   * el monto desde la base de datos para prevenir manipulación de precios.
   */
  createPaymentIntent: (pedidoId: string) =>
    apiClient.post<{ data: { clientSecret: string } }>(
      `/api/pedidos/${pedidoId}/pago/stripe`,
      undefined,
      { headers: { 'X-Auth-Context': 'tienda' } }
    ),

  /**
   * Alias de createPaymentIntent — obtiene el clientSecret para
   * un PaymentIntent ya creado o lo crea si no existe.
   */
  getClientSecret: (pedidoId: string) =>
    apiClient.post<{ data: { clientSecret: string } }>(
      `/api/pedidos/${pedidoId}/pago/stripe`,
      undefined,
      { headers: { 'X-Auth-Context': 'tienda' } }
    ),
}

