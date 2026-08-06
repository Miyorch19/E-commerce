# Plataforma Multitenant B2B/B2C

Plataforma SaaS multitenant donde cada **Negocio** (tenant) contrata una membresía, personaliza su tienda/sitio público con un tema propio, gestiona su catálogo, ventas, citas/reservas y clientes finales, todo desde un panel de administración con roles y permisos.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Gestor de paquetes | pnpm |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Estilos | Tailwind CSS |
| Estado (views) | Zustand |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma |
| Imágenes | Cloudinary |
| Pagos | Stripe (Connect, para pagos a cada negocio) |
| Auth | JWT (propio) + Google OAuth (login social) |

## Modelo de Multitenancy

- **Tenant = Negocio.** Cada fila de negocio tiene un `dominio` único que resuelve qué tenant está sirviendo la request (por subdominio o dominio custom).
- **Aislamiento por fila (row-level tenancy):** todas las tablas de negocio dependen de `negocioId`. No hay DB ni schema separado por tenant — la separación se hace a nivel de query (obligatorio filtrar siempre por `negocioId`).
- **Personalización visual por tenant:** `Tema` define la identidad visual (colores, fuentes, layout, plantilla) y `TokenDiseno` permite variables CSS adicionales para tener múltiples variantes de estilo sobre una misma plantilla de código. `SeccionSitio` controla qué bloques del sitio público están activos y su orden.
- **Soft delete estricto** en tablas clave (`Negocio`, `Usuario`, `Producto`, `Categoria`, `Cita`, `Pedido`): nunca se borra físicamente, se marca `activo = false` / cambia de estado. Esto es obligatorio en toda la lógica de negocio para no romper auditorías ni historiales.

## Estructura de datos (resumen)

### 1. Núcleo de la plataforma (B2B)
`Plan`, `Modulo`, `PlanModulo`, `Membresia` (nunca se elimina, solo cambia de estado), `HistorialMembresia`, `PagoMembresia`.

### 2. Entidad central del negocio
`Negocio` (dominio único, GPS, credenciales de Stripe Connect: `stripeAccountId`, `stripeOnboardingCompleto`), `Tema`, `TokenDiseno`, `SeccionSitio`.

### 3. Acceso y seguridad
`Rol`, `Permiso`, `RolPermiso`, `Usuario` (empleados/dueños, ligados a un Negocio y un Rol), `Sesion` (JWT), `Auditoria`.

### 4. Catálogo (E-commerce)
`Categoria` (jerárquica vía `parentId`), `Producto`, `VarianteProducto` (SKU, precio y stock propios), `Atributo` / `ValorAtributo`, `ImagenProducto` (Cloudinary).

### 5. Ventas y pagos
`Pedido` (local, delivery, whatsapp), `PedidoItem`, `Pago` (pendiente/aprobado, soporta efectivo, Stripe, MercadoPago).

### 6. Clientes finales (B2C)
`ClienteAuth` — **unicidad por `[negocioId, email]`**, un mismo email puede tener cuentas independientes en distintos negocios. `MetodoPagoCliente` (migrando de MercadoPago a Stripe), `DireccionCliente`, `DatosFacturacion`.

### 7. Módulos adicionales
`Cita`, `Staff`, `Reservacion`, `Horario`, `Galeria`, `Resena` (requiere aprobación), `FAQ`, `RedSocial`, `Notificacion`, `Configuracion` (JSON flexible por módulo).

## Integraciones a implementar

### Google OAuth (login de usuarios/clientes)
- Client ID: `964427981052-s0dlf77c60o7mda3urpoo11sm3pntr9m.apps.googleusercontent.com`
- Flujo: OAuth 2.0 con Google Identity Services en frontend → backend valida el `id_token` → crea/vincula registro en `Usuario` o `ClienteAuth` (según contexto, recordando que `ClienteAuth` es único por `[negocioId, email]`).

### Stripe
- **Stripe Connect** para que cada `Negocio` reciba pagos directamente (`stripeAccountId`, `stripeOnboardingCompleto` en la tabla `Negocio`).
- **Pagos de clientes finales** vía `Pago` / `MetodoPagoCliente` (tarjetas tokenizadas).
- **Pagos de membresía** de negocio → plataforma vía `PagoMembresia`.
- Claves: se configuran por variables de entorno (ver abajo), nunca hardcodeadas.

### Cloudinary
Almacenamiento de imágenes de productos (`ImagenProducto`), galería, temas, etc.

### Supabase (Postgres)
Base de datos vía connection pooler (`DATABASE_URL`, puerto 6543 con pgbouncer) para runtime, y conexión directa (`DIRECT_URL`, puerto 5432) para `prisma migrate`.

## Variables de entorno (plantilla — completar localmente, nunca commitear)

```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# JWT
JWT_SECRET="genera-un-valor-aleatorio-largo-nuevo"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Google OAuth
GOOGLE_CLIENT_ID="964427981052-s0dlf77c60o7mda3urpoo11sm3pntr9m.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Frontend
VITE_API_URL="http://localhost:4000"
VITE_STRIPE_PUBLISHABLE_KEY=""
VITE_GOOGLE_CLIENT_ID=""
```

## Notas de seguridad (importante)

- `.env` **siempre** en `.gitignore`. Nunca en commits, nunca pegado en chats o issues.
- Las claves live de Stripe (`sk_live_...`) permiten mover dinero real — trátalas con el mismo cuidado que una contraseña bancaria.
- Rotar cualquier credencial que se haya expuesto accidentalmente (chat, commit, log).
- El middleware de resolución de tenant debe ser lo primero en el pipeline de Express, y **toda** query a tablas dependientes de negocio debe filtrar por `negocioId` — nunca confiar en el `negocioId` que venga del cliente sin validarlo contra el JWT/sesión.

## Estructura de carpetas propuesta

Monorepo gestionado con **pnpm workspaces** (no npm ni yarn):

```
pnpm-workspace.yaml
package.json          # scripts raíz (ej. pnpm -r dev)
.npmrc                # engine-strict=true, para forzar pnpm

/backend
  /src
    /config          # env, prisma client, cloudinary, stripe, google
    /middlewares      # resolveTenant, auth, errorHandler
    /modules
      /auth
      /negocios
      /membresias
      /catalogo
      /pedidos
      /citas
      /clientes
    /routes
    /prisma
      schema.prisma
  .env.example

/frontend
  /src
    /stores           # zustand stores
    /pages
    /components
    /api              # cliente http (axios/fetch) por módulo
    /lib              # google auth, stripe.js
  .env.example
```
