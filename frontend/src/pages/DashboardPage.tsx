import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  LogOut,
  DollarSign,
  Building2,
  ShieldCheck,
  Store,
  ChevronLeft,
  Layers,
  Clock,
  CalendarDays,
} from 'lucide-react'
import { usePanelStore } from '../stores/usePanelStore'
import { useTenantStore } from '../stores/useTenantStore'
import { BillingSection } from '../components/BillingSection'
import { ZonasPage } from './panel/ZonasPage'
import { HorarioPage } from './panel/HorarioPage'
import { ReservacionesPage } from './panel/ReservacionesPage'
import { authApi } from '../api/auth'
import { negociosApi } from '../api/negocios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '../components/ui'

function DashboardHome() {
  const negocio = useTenantStore((s) => s.negocio)
  const usuario = usePanelStore((s) => s.usuario)

  return (
    <div className="space-y-8 animate-in fade-in duration-450">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bienvenido, {usuario?.nombre ?? 'Administrador'}
          </h1>
          {negocio && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <Store className="w-4 h-4 text-slate-400" />
              Gestionando <span className="font-semibold text-slate-800">{negocio.nombre}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-mono font-medium text-slate-600 shadow-2xs">
            Dominio: {negocio?.dominio ?? 'localhost'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Activo
          </span>
        </div>
      </div>

      {/* Stats Grid - Solid Black Hero Card & Neutral Monochromatic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Pedidos hoy"
          value="0"
          icon={ShoppingCart}
          description="Pedidos registrados durante el día"
          trend={{ value: '+0.0%', type: 'neutral' }}
          className="animate-card-entry"
          style={{ animationDelay: '0ms' }}
        />
        <StatCard
          title="Clientes"
          value="0"
          icon={Users}
          description="Clientes totales registrados"
          trend={{ value: '+0.0%', type: 'neutral' }}
          className="animate-card-entry"
          style={{ animationDelay: '90ms' }}
        />
        <StatCard
          title="Ingresos"
          value="$0.00"
          icon={DollarSign}
          isHero
          description="Total generado por ventas acumuladas"
          trend={{ value: '+$0.00', type: 'neutral' }}
          className="animate-card-entry"
          style={{ animationDelay: '180ms' }}
        />
      </div>

      {/* Overview Cards with Monochromatic Neutral Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverable className="animate-card-entry" style={{ animationDelay: '270ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estado del Negocio</CardTitle>
              <div className="p-2 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/80">
                <Building2 className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <CardDescription>Resumen de configuración e información del tenant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Nombre comercial</span>
              <span className="font-semibold text-slate-900">{negocio?.nombre || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Tipo de negocio</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
                {negocio?.tipo || 'RESTAURANTE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-slate-500 font-medium">Email de contacto</span>
              <span className="font-medium text-slate-700">{negocio?.email || '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card hoverable className="animate-card-entry" style={{ animationDelay: '360ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Acceso de Usuario</CardTitle>
              <div className="p-2 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <CardDescription>Credenciales e identidad dentro del panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Usuario activo</span>
              <span className="font-semibold text-slate-900">{usuario?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Rol asignado</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
                {usuario?.rol?.nombre || 'admin'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-slate-500 font-medium">Permisos activos</span>
              <span className="text-xs font-semibold text-slate-700">
                {usuario?.permisos?.length ?? 0} permisos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { logout, hasPermission } = usePanelStore()

  const canManageBilling = hasPermission('facturacion:gestionar')
  const canManageZonas = hasPermission('zonas:gestionar')
  const canManageReservaciones = hasPermission('reservaciones:gestionar')

  const negocio = useTenantStore((s) => s.negocio)
  const setNegocio = useTenantStore((s) => s.setNegocio)
  const tema = useTenantStore((s) => s.tema)
  const logoUrl = tema?.logoUrl || negocio?.logo

  // Collapsible sidebar state stored in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin-sidebar-collapsed') === 'true'
  })

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('admin-sidebar-collapsed', String(next))
      return next
    })
  }

  useEffect(() => {
    if (!negocio) {
      negociosApi
        .getActual()
        .then((res) => setNegocio(res.data.data))
        .catch((err) => console.error('Error fetching tenant', err))
    }
  }, [negocio, setNegocio])

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
    { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, end: true },
    { to: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart, end: false },
    { to: '/dashboard/productos', label: 'Productos', icon: Package, end: false },
    { to: '/dashboard/clientes', label: 'Clientes', icon: Users, end: false },
    ...(canManageZonas
      ? [
          { to: '/dashboard/zonas', label: 'Zonas', icon: Layers, end: false },
          { to: '/dashboard/horario', label: 'Horario', icon: Clock, end: false },
        ]
      : []),
    ...(canManageReservaciones
      ? [{ to: '/dashboard/reservaciones', label: 'Reservaciones', icon: CalendarDays, end: false }]
      : []),
    ...(canManageBilling
      ? [{ to: '/dashboard/facturacion', label: 'Facturación', icon: CreditCard, end: false }]
      : []),
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-slate-100/70 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Container */}
      <aside
        className={`relative ${
          isCollapsed ? 'w-20' : 'w-64'
        } flex flex-col bg-white border-r border-slate-200/80 shrink-0 shadow-xs transition-all duration-300 ease-in-out z-20`}
      >
        {/* Floating Edge Toggle Chip Button (Vertically centered at middle height of sidebar, 32x32px minimum click area) */}
        <button
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-30 w-8 h-8 bg-white border border-slate-200/90 shadow-md rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 cursor-pointer active:scale-95 group"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Sidebar Header: Logo row unblocked in both states */}
        {!isCollapsed ? (
          <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={negocio?.nombre || 'Logo'}
                className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs">
                {negocio?.nombre ? negocio.nombre.charAt(0).toUpperCase() : 'P'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-slate-900 text-sm truncate">
                  {negocio?.nombre || 'Panel Admin'}
                </span>
                {tema?.colorAcento && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tema.colorAcento }}
                    title="Color de marca del negocio"
                  />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium leading-tight">
                Panel Admin
              </span>
            </div>
          </div>
        ) : (
          <div className="py-5 border-b border-slate-100 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={negocio?.nombre || 'Logo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-900 font-bold text-base">
                  {negocio?.nombre ? negocio.nombre.charAt(0).toUpperCase() : 'P'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nav list with Solid Black Active Item */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
                  } rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Cerrar sesión' : undefined}
            className={`w-full flex items-center gap-3 ${
              isCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
            } rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-500" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route
              path="pedidos"
              element={
                <PlaceholderSection
                  title="Pedidos"
                  icon={ShoppingCart}
                  description="Gestión y seguimiento de pedidos de tienda y restaurante"
                />
              }
            />
            <Route
              path="productos"
              element={
                <PlaceholderSection
                  title="Productos"
                  icon={Package}
                  description="Catálogo de productos, categorías y stock de inventario"
                />
              }
            />
            <Route
              path="clientes"
              element={
                <PlaceholderSection
                  title="Clientes"
                  icon={Users}
                  description="Directorio de clientes registrados e historial de interacción"
                />
              }
            />
            {canManageZonas && (
              <>
                <Route path="zonas" element={<ZonasPage />} />
                <Route path="horario" element={<HorarioPage />} />
              </>
            )}
            {canManageReservaciones && (
              <Route path="reservaciones" element={<ReservacionesPage />} />
            )}
            {canManageBilling && (
              <Route path="facturacion" element={<BillingSection />} />
            )}
          </Routes>
        </div>
      </main>
    </div>
  )
}

function PlaceholderSection({
  title,
  icon: Icon,
  description,
}: {
  title: string
  icon: any
  description: string
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Icon className="w-5 h-5 text-slate-700" />
          {title}
        </h2>
        <p className="text-slate-500 text-sm mt-1">{description}</p>
      </div>

      <Card className="p-12 text-center animate-card-entry">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 mx-auto flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Sección en construcción</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          La funcionalidad para administrar {title.toLowerCase()} estará disponible en la siguiente etapa del desarrollo.
        </p>
      </Card>
    </div>
  )
}
