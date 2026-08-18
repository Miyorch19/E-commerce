import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useTiendaStore } from '../../stores/useTiendaStore'
import { authApi } from '../../api/auth'
import axios from 'axios'

type TabMode = 'login' | 'registro'

export function TiendaLoginPage() {
  const navigate = useNavigate()
  const setAuth = useTiendaStore((s) => s.setAuth)

  const [tab, setTab] = useState<TabMode>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (tab === 'login') {
        const res = await authApi.loginCliente({ email, password })
        const { accessToken, refreshToken, data: clienteData } = res.data.data
        setAuth({ token: accessToken, refreshToken, cliente: clienteData })
      } else {
        console.log('--- PAYLOAD REGISTRO ---', { nombre, email, password, telefono });
        const res = await authApi.registerCliente({
          nombre,
          email,
          password,
          telefono: telefono || undefined,
        })
        const { accessToken, refreshToken, data: clienteData } = res.data.data
        setAuth({ token: accessToken, refreshToken, cliente: clienteData })
      }
      navigate('/tienda')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Error al iniciar sesión')
      } else {
        setError('Error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.loginGoogle({
        idToken: credentialResponse.credential,
        contexto: 'tienda',
      })
      const { accessToken, refreshToken, data: clienteData } = res.data.data
      setAuth({ token: accessToken, refreshToken, cliente: clienteData })
      navigate('/tienda')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const msg = err.response?.data?.message ?? ''
        if (status === 403) {
          setError('Tu cuenta de Google no tiene el email verificado. Usa otro método de acceso.')
        } else {
          setError(msg || 'Error al iniciar sesión con Google')
        }
      } else {
        setError('Error inesperado con Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tab === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              para continuar con tu compra
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            {(['login', 'registro'] as TabMode[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null) }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  tab === t
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'registro' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    id="tienda-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="tienda-telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="tienda-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <input
                id="tienda-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              id="tienda-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? tab === 'login' ? 'Ingresando...' : 'Registrando...'
                : tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">o continúa con</span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Error al conectar con Google')}
              theme="outline"
              shape="rectangular"
              text={tab === 'login' ? 'signin_with' : 'signup_with'}
            />
          </div>

          {/* Back to store */}
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/tienda" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
