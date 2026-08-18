import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { usePanelStore } from '../stores/usePanelStore'
import { useTenantStore } from '../stores/useTenantStore'
import { BillingSection } from '../components/BillingSection'
import { authApi } from '../api/auth'

function DashboardHome() {
  const negocio = useTenantStore((s) => s.negocio)
  const usuario = usePanelStore((s) => s.usuario)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Bienvenido, {usuario?.nombre ?? 'Administrador'} 👋
        </h2>
        {negocio && (
          <p className="text-gray-400 mt-1">
            Gestionando <span className="text-indigo-400 font-medium">{negocio.nombre}</span>
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pedidos hoy', value: '—', icon: '🛒' },
          { label: 'Clientes', value: '—', icon: '👥' },
          { label: 'Ingresos', value: '—', icon: '💰' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-800/50 border border-white/10 rounded-xl p-5"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { logout, hasPermission } = usePanelStore()
  const canManageBilling = hasPermission('facturacion:gestionar')

  async function handleLogout() {
    try {
      await authApi.logoutPanel()
    } catch (err) {
      console.error(err)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const navItems = [
    { to: '/dashboard', label: 'Inicio', icon: '🏠', end: true },
    { to: '/dashboard/pedidos', label: 'Pedidos', icon: '🛒', end: false },
    { to: '/dashboard/productos', label: 'Productos', icon: '📦', end: false },
    { to: '/dashboard/clientes', label: 'Clientes', icon: '👥', end: false },
    ...(canManageBilling
      ? [{ to: '/dashboard/facturacion', label: 'Facturación', icon: '💳', end: false }]
      : []),
  ]

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-gray-900 border-r border-white/10 shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
              P
            </div>
            <span className="font-semibold text-white">Panel Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="pedidos" element={<PlaceholderSection title="Pedidos" />} />
            <Route path="productos" element={<PlaceholderSection title="Productos" />} />
            <Route path="clientes" element={<PlaceholderSection title="Clientes" />} />
            {canManageBilling && (
              <Route path="facturacion" element={<BillingSection />} />
            )}
          </Routes>
        </div>
      </main>
    </div>
  )
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="bg-gray-800/40 border border-white/10 rounded-xl p-10 text-center text-gray-500">
        Sección en construcción
      </div>
    </div>
  )
}
