-- CreateTable
CREATE TABLE "RegistroModificacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,
    "carreraId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaHora" DATETIME NOT NULL,
    CONSTRAINT "RegistroModificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RegistroModificacion_carreraId_fechaHora_idx" ON "RegistroModificacion"("carreraId", "fechaHora");

-- CreateIndex
CREATE INDEX "RegistroModificacion_entidad_entidadId_idx" ON "RegistroModificacion"("entidad", "entidadId");
