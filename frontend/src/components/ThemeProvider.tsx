import { useEffect } from 'react'
import { useTenantStore } from '../stores/useTenantStore'
import { negociosApi } from '../api/negocios'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTema = useTenantStore((s) => s.setTema)
  const tema = useTenantStore((s) => s.tema)

  useEffect(() => {
    // Solo cargamos si no está o si queremos forzar (por simplicidad, al montar)
    if (!tema) {
      negociosApi.getTema()
        .then((res) => {
          setTema(res.data.data)
        })
        .catch((err) => {
          console.error('Error fetching theme:', err)
        })
    }
  }, [tema, setTema])

  useEffect(() => {
    if (tema) {
      const root = document.documentElement
      root.style.setProperty('--color-primary', tema.colorPrimario)
      root.style.setProperty('--color-dark', tema.colorSecundario)
      if (tema.colorAcento) {
        root.style.setProperty('--color-accent', tema.colorAcento)
      }
      root.style.setProperty('--font-serif', `"${tema.fontPrimaria}", serif`)
      if (tema.fontSecundaria) {
        root.style.setProperty('--font-mono', `"${tema.fontSecundaria}", monospace`)
      }
      root.style.setProperty('--border-radius', tema.borderRadius)
      
      // Aplicar tokens extra
      if (tema.tokens) {
        tema.tokens.forEach(t => {
          root.style.setProperty(t.clave, t.valor)
        })
      }
    }
  }, [tema])

  return <>{children}</>
}
