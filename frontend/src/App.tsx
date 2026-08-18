import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TiendaPage } from './pages/TiendaPage'
import { TiendaLoginPage } from './pages/tienda/TiendaLoginPage'
import { TiendaCheckoutPage } from './pages/tienda/TiendaCheckoutPage'
import { usePanelStore } from './stores/usePanelStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = usePanelStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
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

        {/* Tienda pública */}
        <Route path="/tienda" element={<TiendaPage />} />
        <Route path="/tienda/login" element={<TiendaLoginPage />} />
        <Route path="/tienda/checkout" element={<TiendaCheckoutPage />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

