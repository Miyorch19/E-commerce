import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Tema {
  plantilla: string
  colorPrimario: string
  colorSecundario: string
  colorAcento?: string
  fontPrimaria: string
  fontSecundaria?: string
  borderRadius: string
  logoUrl?: string
  faviconUrl?: string
  tokens?: { clave: string, valor: string }[]
}

interface Negocio {
  id: string
  nombre: string
  dominio: string
  tipo: string
  logo?: string
  email?: string
  stripeAccountId?: string
  stripeOnboardingCompleto: boolean
  stripeCustomerId?: string
  stripeMetodoPagoId?: string
}

interface TenantState {
  negocio: Negocio | null
  tema: Tema | null
  setNegocio: (negocio: Negocio) => void
  setTema: (tema: Tema) => void
  clear: () => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      negocio: null,
      tema: null,
      setNegocio: (negocio) => set({ negocio }),
      setTema: (tema) => set({ tema }),
      clear: () => set({ negocio: null, tema: null }),
    }),
    { name: 'tenant-store' }
  )
)
