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
  const getHeader = (name: string) => {
    if (config.headers?.get) return config.headers.get(name) as string
    return (config.headers?.[name] || config.headers?.[name.toLowerCase()]) as string
  }

  const headerContext = getHeader('X-Auth-Context')
  const authContext =
    (config as any)._authContext ||
    headerContext ||
    (config.url?.includes('/panel') ? 'panel' : undefined)

  ;(config as any)._authContext = authContext

  if (authContext === 'panel') {
    const token = usePanelStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
  } else if (authContext === 'tienda') {
    const token = useTiendaStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }

  if (config.headers?.delete) {
    config.headers.delete('X-Auth-Context')
  } else {
    delete config.headers['X-Auth-Context']
    delete config.headers['x-auth-context']
  }

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      const authContext =
        originalRequest._authContext ||
        (originalRequest.url?.includes('/panel') ? 'panel' : undefined)

      if (!authContext) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
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
        const store =
          authContext === 'panel' ? usePanelStore.getState() : useTiendaStore.getState()
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
