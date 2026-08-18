-- CreateIndex
CREATE INDEX "categorias_negocioId_activo_idx" ON "categorias"("negocioId", "activo");

-- CreateIndex
CREATE INDEX "pagos_membresias_membresiaId_periodo_idx" ON "pagos_membresias"("membresiaId", "periodo");

-- CreateIndex
CREATE INDEX "pedidos_negocioId_activo_idx" ON "pedidos"("negocioId", "activo");

-- CreateIndex
CREATE INDEX "productos_negocioId_activo_idx" ON "productos"("negocioId", "activo");

-- CreateIndex
CREATE INDEX "sesiones_usuarioId_negocioId_revokedAt_idx" ON "sesiones"("usuarioId", "negocioId", "revokedAt");

-- CreateIndex
CREATE INDEX "sesiones_refreshToken_idx" ON "sesiones"("refreshToken");
