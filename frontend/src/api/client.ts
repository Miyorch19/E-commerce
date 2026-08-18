import axios from 'axios'
import { usePanelStore } from '../stores/usePanelStore'
import { useTiendaStore } from '../stores/useTiendaStore'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

/**
 * Resolves the X-Tenant-Domain header value.
 * - In development (localhost) returns 'localhost' so the backend CORS
 *   and resolveTenant middleware can find the Negocio in DB.
 * - In production, uses the real hostname (e.g. "mitienda.miapp.com").
 */
function getTenantDomain(): string {
  const hostname = window.location.hostname
  return hostname === '127.0.0.1' ? 'localhost' : hostname
}

/**
 * Central HTTP client.
 *
 * - withCredentials: true  →  required because the backend uses CORS with
 *   credentials: true for dynamic tenant/domain resolution.
 * - Injects JWT (Authorization: Bearer) based on X-Auth-Context header.
 * - Injects X-Tenant-Domain on every request.
 * - On 401, attempts a silent token refresh then retries the original request
 *   once. If refresh fails, clears auth and redirects to /login or /tienda.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Request interceptor: attach JWT + tenant header -----------------------
apiClient.interceptors.request.use((config) => {
  const authContext = config.headers['X-Auth-Context']
  
  // Save context for the response interceptor before deleting it from headers
  ;(config as any)._authContext = authContext;
  
  if (authContext === 'panel') {
    const token = usePanelStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
  } else if (authContext === 'tienda') {
    const token = useTiendaStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  
  // Remove the custom header so it doesn't get sent to the backend
  delete config.headers['X-Auth-Context']

  config.headers['X-Tenant-Domain'] = getTenantDomain()
  return config
})

// --- Response interceptor: silent refresh on 401 --------------------------
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh once per request (_retry flag) and only on 401
    // Note: the original custom header X-Auth-Context was removed, but we can inspect if it had a token 
    // or we can pass the context through a custom config property.
    // To preserve it, we'll read it from originalRequest._authContext if we save it, 
    // or we can just try to refresh based on which store has a refreshToken that matches the context we want.
    // Actually, let's look at the original URL or we can inject it via originalRequest object.
    
    // Better way: interceptors.request can save the context on config:
    // We already do this: originalRequest._authContext is not defined yet. Let's rely on checking the request URL or passing it.
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Determine context from originalRequest
      // If we deleted X-Auth-Context from headers, we can't read it from headers.
      // We will check the original request URL, or we can use a custom property on config.
      // Wait! We can just define `authContext` inside request and save it on `config._authContext = authContext`.
      // Let's assume we saved it.
      const authContext = originalRequest._authContext

      if (!authContext) {
        return Promise.reject(error) // No context = no refresh attempt
      }

      if (isRefreshing) {
        // Queue the request until the ongoing refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const store = authContext === 'panel' ? usePanelStore.getState() : useTiendaStore.getState()
        const { refreshToken } = store
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(
          `${API_URL}/api/auth/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            headers: { 'X-Tenant-Domain': getTenantDomain() },
          }
        )

        const newAccessToken: string = res.data.data.accessToken
        const newRefreshToken: string = res.data.data.refreshToken ?? refreshToken

        if (authContext === 'panel') {
          usePanelStore.setState((state) => ({
            ...state,
            token: newAccessToken,
            refreshToken: newRefreshToken,
          }))
        } else {
          useTiendaStore.setState((state) => ({
            ...state,
            token: newAccessToken,
            refreshToken: newRefreshToken,
          }))
        }

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        if (authContext === 'panel') {
          usePanelStore.getState().logout()
          window.location.href = '/login'
        } else {
          useTiendaStore.getState().logout()
          window.location.href = '/tienda/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
