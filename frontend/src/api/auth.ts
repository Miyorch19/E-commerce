import { apiClient } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterClientePayload {
  nombre: string
  email: string
  password: string
  telefono?: string
}

export interface GoogleLoginPayload {
  idToken: string
  contexto: 'panel' | 'tienda'
}

export const authApi = {
  /** Login para usuarios del panel (rol admin/staff) */
  loginUsuario: (data: LoginPayload) =>
    apiClient.post('/api/auth/login', data, { headers: { 'X-Auth-Context': 'panel' } }),

  /** Login para clientes de la tienda pública — endpoint dedicado, nunca toca /auth/login del panel */
  loginCliente: (data: LoginPayload) =>
    apiClient.post('/api/auth/login-cliente', data, { headers: { 'X-Auth-Context': 'tienda' } }),

  /** Registro de clientes en la tienda pública */
  registerCliente: (data: RegisterClientePayload) =>
    apiClient.post('/api/auth/register', data, { headers: { 'X-Auth-Context': 'tienda' } }),

  /** OAuth con Google – contexto determina si es panel o tienda */
  loginGoogle: (data: GoogleLoginPayload) =>
    apiClient.post('/api/auth/google', data, { headers: { 'X-Auth-Context': data.contexto } }),

  /** Obtiene el perfil del usuario/cliente autenticado */
  mePanel: () =>
    apiClient.get('/api/auth/me', { headers: { 'X-Auth-Context': 'panel' } }),

  meTienda: () =>
    apiClient.get('/api/auth/me', { headers: { 'X-Auth-Context': 'tienda' } }),

  /** Cierra la sesión actual */
  logoutPanel: () =>
    apiClient.post('/api/auth/logout', undefined, { headers: { 'X-Auth-Context': 'panel' } }),

  logoutTienda: () =>
    apiClient.post('/api/auth/logout', undefined, { headers: { 'X-Auth-Context': 'tienda' } }),
}
