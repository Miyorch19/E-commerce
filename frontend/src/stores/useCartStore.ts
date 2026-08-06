import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productoId: string
  varianteId?: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
}

interface CartState {
  items: CartItem[]
  negocioId: string | null

  addItem: (item: CartItem) => void
  removeItem: (productoId: string, varianteId?: string) => void
  updateQuantity: (productoId: string, varianteId: string | undefined, cantidad: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      negocioId: null,

      addItem(newItem) {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productoId === newItem.productoId && i.varianteId === newItem.varianteId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productoId === newItem.productoId && i.varianteId === newItem.varianteId
                  ? { ...i, cantidad: i.cantidad + newItem.cantidad }
                  : i
              ),
            }
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem(productoId, varianteId) {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productoId === productoId && i.varianteId === varianteId)
          ),
        }))
      },

      updateQuantity(productoId, varianteId, cantidad) {
        if (cantidad <= 0) {
          get().removeItem(productoId, varianteId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productoId === productoId && i.varianteId === varianteId
              ? { ...i, cantidad }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    { name: 'cart-store' }
  )
)
