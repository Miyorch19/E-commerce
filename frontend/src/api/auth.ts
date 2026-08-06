import { apiClient } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface GoogleLoginPayload {
  idToken: string
  contexto: 'panel' | 'tienda'
}

export const authApi = {
  loginUsuario: (data: LoginPayload) =>
    apiClient.post('/api/auth/login', data),

  loginGoogle: (data: GoogleLoginPayload) =>
    apiClient.post('/api/auth/google', data),

  registerCliente: (data: { nombre: string; email: string; password: string; telefono?: string }) =>
    apiClient.post('/api/auth/register', data),

  logout: () =>
    apiClient.post('/api/auth/logout'),

  refresh: () =>
    apiClient.post('/api/auth/refresh'),
}
