import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TiendaPage } from './pages/TiendaPage'
import { TiendaLoginPage } from './pages/tienda/TiendaLoginPage'
import { TiendaCheckoutPage } from './pages/tienda/TiendaCheckoutPage'
import { TiendaPedidoConfirmacionPage } from './pages/tienda/TiendaPedidoConfirmacionPage'
import { TiendaRoot } from './pages/tienda/PlantillaSelector'
import { ThemeProvider } from './components/ThemeProvider'
import { usePanelStore } from './stores/usePanelStore'

import { ConfiguracionPagosExitoPage } from './pages/panel/ConfiguracionPagosExitoPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = usePanelStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <Routes>
        {/* Panel admin */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracion/pagos/exito"
          element={
            <PrivateRoute>
              <ConfiguracionPagosExitoPage />
            </PrivateRoute>
          }
        />

        {/* Tienda pública */}
        <Route path="/tienda/login" element={<TiendaLoginPage />} />
        <Route path="/tienda/checkout" element={<TiendaCheckoutPage />} />
        <Route path="/tienda/pedido/:id/confirmacion" element={<TiendaPedidoConfirmacionPage />} />
        <Route path="/tienda/*" element={<TiendaRoot />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}
