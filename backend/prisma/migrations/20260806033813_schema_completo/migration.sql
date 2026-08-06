/*
  Warnings:

  - A unique constraint covering the columns `[dominio]` on the table `negocios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dominio` to the `negocios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoMembresia" AS ENUM ('TRIAL', 'ACTIVA', 'VENCIDA', 'CANCELADA', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('LOCAL', 'DELIVERY', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'STRIPE', 'MERCADO_PAGO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "EstadoResena" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoNegocio" AS ENUM ('TIENDA', 'RESTAURANTE', 'SERVICIOS', 'SALON_BELLEZA', 'CLINICA', 'OTRO');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- AlterTable
ALTER TABLE "negocios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "dominio" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "pais" TEXT NOT NULL DEFAULT 'MX',
ADD COLUMN     "sitioWeb" TEXT,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboardingCompleto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "tipo" "TipoNegocio" NOT NULL DEFAULT 'TIENDA',
ADD COLUMN     "whatsapp" TEXT;

-- CreateTable
CREATE TABLE "planes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "intervalo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_modulos" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'TRIAL',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "canceladaEl" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_membresias" (
    "id" TEXT NOT NULL,
    "membresiaId" TEXT NOT NULL,
    "estadoPrev" "EstadoMembresia" NOT NULL,
    "estadoNuevo" "EstadoMembresia" NOT NULL,
    "motivo" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_membresias" (
    "id" TEXT NOT NULL,
    "membresiaId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodo" "MetodoPago" NOT NULL,
    "stripePaymentId" TEXT,
    "stripeInvoiceId" TEXT,
    "periodoInicio" TIMESTAMP(3),
    "periodoFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temas" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "plantilla" TEXT NOT NULL DEFAULT 'default',
    "colorPrimario" TEXT NOT NULL DEFAULT '#000000',
    "colorSecundario" TEXT NOT NULL DEFAULT '#ffffff',
    "colorAcento" TEXT,
    "fontPrimaria" TEXT NOT NULL DEFAULT 'Inter',
    "fontSecundaria" TEXT,
    "borderRadius" TEXT NOT NULL DEFAULT '8px',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_diseno" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_diseno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones_sitio" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secciones_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "id" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiraEl" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "datosPrev" JSONB,
    "datosNuevo" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "parentId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "precioCompare" DECIMAL(10,2),
    "sku" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "gestionStock" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variantes_producto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imagen" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variantes_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atributos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atributos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atributos_producto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "atributoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atributos_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_atributo" (
    "id" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valores_atributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_producto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "alt" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "numero" INTEGER NOT NULL,
    "tipo" "TipoPedido" NOT NULL DEFAULT 'LOCAL',
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "impuestos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "direccionEntrega" TEXT,
    "notasEntrega" TEXT,
    "notasCliente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT,
    "varianteId" TEXT,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT,
    "membresiaId" TEXT,
    "negocioId" TEXT,
    "clienteId" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodo" "MetodoPago" NOT NULL,
    "stripePaymentId" TEXT,
    "stripeChargeId" TEXT,
    "mercadoPagoId" TEXT,
    "recibo" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_auth" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "telefono" TEXT,
    "avatar" TEXT,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago_cliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripePaymentMethod" TEXT,
    "mercadoPagoToken" TEXT,
    "tipo" TEXT NOT NULL,
    "ultimosCuatro" TEXT,
    "marca" TEXT,
    "expMes" INTEGER,
    "expAnio" INTEGER,
    "esDefault" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metodos_pago_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones_cliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "alias" TEXT,
    "calle" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'MX',
    "codigoPostal" TEXT,
    "referencias" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "esDefault" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datos_facturacion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "regimen" TEXT,
    "email" TEXT NOT NULL,
    "calle" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'MX',
    "cp" TEXT,
    "esDefault" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datos_facturacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "staffId" TEXT,
    "dia" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "staffId" TEXT,
    "servicio" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "precio" DECIMAL(10,2),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservaciones" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "staffId" TEXT,
    "confirmada" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galeria" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "titulo" TEXT,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'imagen',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galeria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resenas" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "productoId" TEXT,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "estado" "EstadoResena" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redes_sociales" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redes_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "clienteId" TEXT,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_clave_key" ON "modulos"("clave");

-- CreateIndex
CREATE INDEX "plan_modulos_planId_idx" ON "plan_modulos"("planId");

-- CreateIndex
CREATE INDEX "plan_modulos_moduloId_idx" ON "plan_modulos"("moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_modulos_planId_moduloId_key" ON "plan_modulos"("planId", "moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "membresias_negocioId_key" ON "membresias"("negocioId");

-- CreateIndex
CREATE INDEX "membresias_planId_idx" ON "membresias"("planId");

-- CreateIndex
CREATE INDEX "historial_membresias_membresiaId_idx" ON "historial_membresias"("membresiaId");

-- CreateIndex
CREATE INDEX "pagos_membresias_membresiaId_idx" ON "pagos_membresias"("membresiaId");

-- CreateIndex
CREATE UNIQUE INDEX "temas_negocioId_key" ON "temas"("negocioId");

-- CreateIndex
CREATE INDEX "tokens_diseno_negocioId_idx" ON "tokens_diseno"("negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_diseno_negocioId_clave_key" ON "tokens_diseno"("negocioId", "clave");

-- CreateIndex
CREATE INDEX "secciones_sitio_negocioId_idx" ON "secciones_sitio"("negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_clave_key" ON "permisos"("clave");

-- CreateIndex
CREATE INDEX "rol_permisos_rolId_idx" ON "rol_permisos"("rolId");

-- CreateIndex
CREATE INDEX "rol_permisos_permisoId_idx" ON "rol_permisos"("permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "rol_permisos_rolId_permisoId_key" ON "rol_permisos"("rolId", "permisoId");

-- CreateIndex
CREATE INDEX "usuarios_negocioId_idx" ON "usuarios"("negocioId");

-- CreateIndex
CREATE INDEX "usuarios_rolId_idx" ON "usuarios"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_negocioId_email_key" ON "usuarios"("negocioId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_token_key" ON "sesiones"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_refreshToken_key" ON "sesiones"("refreshToken");

-- CreateIndex
CREATE INDEX "sesiones_usuarioId_idx" ON "sesiones"("usuarioId");

-- CreateIndex
CREATE INDEX "sesiones_negocioId_idx" ON "sesiones"("negocioId");

-- CreateIndex
CREATE INDEX "auditorias_negocioId_idx" ON "auditorias"("negocioId");

-- CreateIndex
CREATE INDEX "auditorias_usuarioId_idx" ON "auditorias"("usuarioId");

-- CreateIndex
CREATE INDEX "auditorias_entidad_entidadId_idx" ON "auditorias"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "categorias_negocioId_idx" ON "categorias"("negocioId");

-- CreateIndex
CREATE INDEX "categorias_parentId_idx" ON "categorias"("parentId");

-- CreateIndex
CREATE INDEX "productos_negocioId_idx" ON "productos"("negocioId");

-- CreateIndex
CREATE INDEX "productos_categoriaId_idx" ON "productos"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "productos_negocioId_slug_key" ON "productos"("negocioId", "slug");

-- CreateIndex
CREATE INDEX "variantes_producto_productoId_idx" ON "variantes_producto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "atributos_nombre_key" ON "atributos"("nombre");

-- CreateIndex
CREATE INDEX "atributos_producto_productoId_idx" ON "atributos_producto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "atributos_producto_productoId_atributoId_key" ON "atributos_producto"("productoId", "atributoId");

-- CreateIndex
CREATE INDEX "valores_atributo_varianteId_idx" ON "valores_atributo"("varianteId");

-- CreateIndex
CREATE INDEX "imagenes_producto_productoId_idx" ON "imagenes_producto"("productoId");

-- CreateIndex
CREATE INDEX "pedidos_negocioId_idx" ON "pedidos"("negocioId");

-- CreateIndex
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_negocioId_numero_key" ON "pedidos"("negocioId", "numero");

-- CreateIndex
CREATE INDEX "pedido_items_pedidoId_idx" ON "pedido_items"("pedidoId");

-- CreateIndex
CREATE INDEX "pedido_items_productoId_idx" ON "pedido_items"("productoId");

-- CreateIndex
CREATE INDEX "pagos_pedidoId_idx" ON "pagos"("pedidoId");

-- CreateIndex
CREATE INDEX "pagos_clienteId_idx" ON "pagos"("clienteId");

-- CreateIndex
CREATE INDEX "clientes_auth_negocioId_idx" ON "clientes_auth"("negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_auth_negocioId_email_key" ON "clientes_auth"("negocioId", "email");

-- CreateIndex
CREATE INDEX "metodos_pago_cliente_clienteId_idx" ON "metodos_pago_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "direcciones_cliente_clienteId_idx" ON "direcciones_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "datos_facturacion_clienteId_idx" ON "datos_facturacion"("clienteId");

-- CreateIndex
CREATE INDEX "staff_negocioId_idx" ON "staff"("negocioId");

-- CreateIndex
CREATE INDEX "horarios_negocioId_idx" ON "horarios"("negocioId");

-- CreateIndex
CREATE INDEX "horarios_staffId_idx" ON "horarios"("staffId");

-- CreateIndex
CREATE INDEX "citas_negocioId_idx" ON "citas"("negocioId");

-- CreateIndex
CREATE INDEX "citas_clienteId_idx" ON "citas"("clienteId");

-- CreateIndex
CREATE INDEX "citas_staffId_idx" ON "citas"("staffId");

-- CreateIndex
CREATE INDEX "reservaciones_citaId_idx" ON "reservaciones"("citaId");

-- CreateIndex
CREATE INDEX "reservaciones_staffId_idx" ON "reservaciones"("staffId");

-- CreateIndex
CREATE INDEX "galeria_negocioId_idx" ON "galeria"("negocioId");

-- CreateIndex
CREATE INDEX "resenas_negocioId_idx" ON "resenas"("negocioId");

-- CreateIndex
CREATE INDEX "resenas_clienteId_idx" ON "resenas"("clienteId");

-- CreateIndex
CREATE INDEX "resenas_productoId_idx" ON "resenas"("productoId");

-- CreateIndex
CREATE INDEX "faqs_negocioId_idx" ON "faqs"("negocioId");

-- CreateIndex
CREATE INDEX "redes_sociales_negocioId_idx" ON "redes_sociales"("negocioId");

-- CreateIndex
CREATE INDEX "notificaciones_negocioId_idx" ON "notificaciones"("negocioId");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_idx" ON "notificaciones"("usuarioId");

-- CreateIndex
CREATE INDEX "notificaciones_clienteId_idx" ON "notificaciones"("clienteId");

-- CreateIndex
CREATE INDEX "configuraciones_negocioId_idx" ON "configuraciones"("negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_negocioId_modulo_clave_key" ON "configuraciones"("negocioId", "modulo", "clave");

-- CreateIndex
CREATE UNIQUE INDEX "negocios_dominio_key" ON "negocios"("dominio");

-- AddForeignKey
ALTER TABLE "plan_modulos" ADD CONSTRAINT "plan_modulos_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_modulos" ADD CONSTRAINT "plan_modulos_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "modulos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_membresias" ADD CONSTRAINT "historial_membresias_membresiaId_fkey" FOREIGN KEY ("membresiaId") REFERENCES "membresias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_membresias" ADD CONSTRAINT "pagos_membresias_membresiaId_fkey" FOREIGN KEY ("membresiaId") REFERENCES "membresias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temas" ADD CONSTRAINT "temas_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_diseno" ADD CONSTRAINT "tokens_diseno_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones_sitio" ADD CONSTRAINT "secciones_sitio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atributos_producto" ADD CONSTRAINT "atributos_producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atributos_producto" ADD CONSTRAINT "atributos_producto_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "atributos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valores_atributo" ADD CONSTRAINT "valores_atributo_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "variantes_producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_producto" ADD CONSTRAINT "imagenes_producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "variantes_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_auth" ADD CONSTRAINT "clientes_auth_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago_cliente" ADD CONSTRAINT "metodos_pago_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones_cliente" ADD CONSTRAINT "direcciones_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datos_facturacion" ADD CONSTRAINT "datos_facturacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservaciones" ADD CONSTRAINT "reservaciones_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservaciones" ADD CONSTRAINT "reservaciones_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galeria" ADD CONSTRAINT "galeria_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redes_sociales" ADD CONSTRAINT "redes_sociales_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones" ADD CONSTRAINT "configuraciones_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "negocios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
