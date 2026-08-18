import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClienteBasico {
  id: string
  nombre: string
  email: string
}

interface TiendaAuthState {
  token: string | null
  refreshToken: string | null
  cliente: ClienteBasico | null

  setAuth: (data: {
    token: string
    refreshToken: string
    cliente: ClienteBasico
  }) => void
  logout: () => void
}

export const useTiendaStore = create<TiendaAuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      cliente: null,

      setAuth({ token, refreshToken, cliente }) {
        set({ token, refreshToken, cliente })
      },

      logout() {
        set({ token: null, refreshToken: null, cliente: null })
      },
    }),
    { name: 'tienda-auth-store' }
  )
)
