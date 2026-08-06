import { apiClient } from './client'

export const pedidosApi = {
  /**
   * Crea un PaymentIntent para el pago del pedido.
   * IMPORTANTE: El frontend solo envía el pedidoId — el backend recalcula
   * el monto desde la base de datos para prevenir manipulación de precios.
   */
  createPaymentIntent: (pedidoId: string) =>
    apiClient.post<{ data: { clientSecret: string } }>(
      `/api/pedidos/${pedidoId}/pago/stripe`
    ),
}
