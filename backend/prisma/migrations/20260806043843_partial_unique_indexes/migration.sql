-- AlterEnum
ALTER TYPE "EstadoPago" ADD VALUE 'REQUIERE_AUTENTICACION';

-- DropIndex
DROP INDEX "clientes_auth_negocioId_email_key";

-- DropIndex
DROP INDEX "negocios_dominio_key";

-- DropIndex
DROP INDEX "usuarios_negocioId_email_key";

-- AlterTable
ALTER TABLE "clientes_auth" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "negocios" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeMetodoPagoId" TEXT;

-- AlterTable
ALTER TABLE "pagos_membresias" ADD COLUMN     "periodo" TEXT;

-- CreateTable
CREATE TABLE "webhook_eventos_procesados" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "procesadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_eventos_procesados_pkey" PRIMARY KEY ("id")
);

-- Create partial unique indexes (soft delete bugfix)
CREATE UNIQUE INDEX negocio_dominio_activo_unique ON "negocios" (dominio) WHERE activo = true;
CREATE UNIQUE INDEX clienteauth_negocio_email_activo_unique ON "clientes_auth" ("negocioId", email) WHERE activo = true;
CREATE UNIQUE INDEX usuario_negocio_email_activo_unique ON "usuarios" ("negocioId", email) WHERE activo = true;
