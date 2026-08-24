import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCartStore } from './useCartStore'

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
    (set, get) => ({
      token: null,
      refreshToken: null,
      cliente: null,

      setAuth({ token, refreshToken, cliente }) {
        const currentClienteId = get().cliente?.id

        // Si el cliente que inicia sesión es DISTINTO al que tenía el carrito,
        // vaciamos el carrito para evitar mezcla de sesiones.
        if (currentClienteId !== undefined && currentClienteId !== cliente.id) {
          useCartStore.getState().clearCart()
        }

        set({ token, refreshToken, cliente })
      },

      logout() {
        // Al cerrar sesión siempre vaciamos el carrito
        useCartStore.getState().clearCart()
        set({ token: null, refreshToken: null, cliente: null })
      },
    }),
    { name: 'tienda-auth-store' }
  )
)
