import { Routes, Route } from 'react-router-dom'
import Layout from '../../../../components/tienda/plantillas/restaurante-clasico/Layout'
import Home from './Home'
import Menu from './Menu'
import About from './About'
import ReservarPage from './ReservarPage'
import MisReservacionesPage from './MisReservacionesPage'

export function RestauranteClasicoRoot() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="nosotros" element={<About />} />
        <Route path="reservar" element={<ReservarPage />} />
        <Route path="mis-reservaciones" element={<MisReservacionesPage />} />
      </Route>
    </Routes>
  )
}
