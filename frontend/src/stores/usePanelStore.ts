import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UsuarioBasico {
  id: string
  nombre: string
  email: string
  rolId?: string
  rol?: { id: string; nombre: string }
  permisos?: string[]
}

interface PanelAuthState {
  token: string | null
  refreshToken: string | null
  usuario: UsuarioBasico | null

  setAuth: (data: {
    token: string
    refreshToken: string
    usuario: UsuarioBasico
  }) => void
  logout: () => void
  hasPermission: (permiso: string) => boolean
}

export const usePanelStore = create<PanelAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      usuario: null,

      setAuth({ token, refreshToken, usuario }) {
        set({ token, refreshToken, usuario })
      },

      logout() {
        set({ token: null, refreshToken: null, usuario: null })
      },

      /**
       * Verifica si el usuario del panel tiene un permiso específico.
       */
      hasPermission(permiso: string): boolean {
        const permisos = get().usuario?.permisos ?? []
        return permisos.includes(permiso)
      },
    }),
    { name: 'panel-auth-store' }
  )
)
