import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

/**
 * Cliente HTTP centralizado.
 *
 * - Inyecta el JWT desde useAuthStore en cada request (Authorization: Bearer <token>)
 * - withCredentials: true es obligatorio porque el backend usa CORS con credentials: true
 *   para la resolución dinámica de tenant/dominio. Sin esto, el navegador rechaza las
 *   respuestas incluso cuando el backend las permite.
 * - La base URL se resuelve desde VITE_API_URL (ver .env.example)
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: inyecta token en cada request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: maneja 401 global (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
