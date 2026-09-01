import { Routes, Route } from 'react-router-dom'
import Layout from '../../../../components/tienda/plantillas/restaurante-clasico/Layout'
import Home from './Home'
import Menu from './Menu'
import About from './About'

export function RestauranteClasicoRoot() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="nosotros" element={<About />} />
      </Route>
    </Routes>
  )
}
