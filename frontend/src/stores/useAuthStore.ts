import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthContext = 'panel' | 'tienda'

interface UsuarioBasico {
  id: string
  nombre: string
  email: string
  rolId?: string
  rol?: { id: string; nombre: string }
  permisos?: string[]
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  usuario: UsuarioBasico | null
  cliente: UsuarioBasico | null
  contexto: AuthContext | null

  setAuth: (data: {
    token: string
    refreshToken: string
    usuario?: UsuarioBasico
    cliente?: UsuarioBasico
    contexto: AuthContext
  }) => void
  logout: () => void
  hasPermission: (permiso: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      usuario: null,
      cliente: null,
      contexto: null,

      setAuth({ token, refreshToken, usuario, cliente, contexto }) {
        set({ token, refreshToken, usuario: usuario ?? null, cliente: cliente ?? null, contexto })
      },

      logout() {
        set({ token: null, refreshToken: null, usuario: null, cliente: null, contexto: null })
      },

      /**
       * Verifica si el usuario del panel tiene un permiso específico.
       * Los permisos vienen del perfil devuelto por el login (field permisos[]).
       */
      hasPermission(permiso: string): boolean {
        const permisos = get().usuario?.permisos ?? []
        return permisos.includes(permiso)
      },
    }),
    { name: 'auth-store' }
  )
)
