import { apiClient } from './client'

export const negociosApi = {
  getActual: () =>
    apiClient.get<{ data: any }>('/api/negocios/actual', { headers: { 'X-Auth-Context': 'panel' } }),

  /**
   * Inicia el onboarding de Stripe Connect para el negocio.
   * Retorna la URL del Account Link de Stripe.
   */
  stripeOnboarding: (negocioId: string) =>
    apiClient.post<{ data: { url: string } }>(`/api/negocios/${negocioId}/stripe/onboarding`, undefined, { headers: { 'X-Auth-Context': 'panel' } }),

  /**
   * Crea un SetupIntent en la cuenta PRINCIPAL de la plataforma
   * (NO en la cuenta Connect) para registrar la tarjeta con la que se
   * le cobrará la membresía mensual al negocio.
   * Requiere permiso: facturacion:gestionar
   */
  createBillingSetupIntent: (negocioId: string) =>
    apiClient.post<{ data: { clientSecret: string } }>(
      `/api/negocios/${negocioId}/stripe/metodo-pago/setup-intent`,
      undefined,
      { headers: { 'X-Auth-Context': 'panel' } }
    ),
}
