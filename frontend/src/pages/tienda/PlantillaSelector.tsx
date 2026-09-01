import { useTenantStore } from '../../stores/useTenantStore'
import { RestauranteClasicoRoot } from './plantillas/restaurante-clasico'

const PLANTILLAS: Record<string, React.ComponentType> = {
  'restaurante-clasico': RestauranteClasicoRoot,
}

export function TiendaRoot() {
  const tema = useTenantStore((s) => s.tema)
  const plantillaName = tema?.plantilla ?? 'restaurante-clasico'
  
  const Plantilla = PLANTILLAS[plantillaName]
  
  if (!Plantilla) {
    return <div className="p-8 text-center">Plantilla no encontrada: {plantillaName}</div>
  }

  return <Plantilla />
}
