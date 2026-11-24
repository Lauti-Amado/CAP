-- CreateTable
CREATE TABLE "GrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "fechaReferenciaEdad" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Borrador',
    "minimoCarrerasCalendario" INTEGER NOT NULL DEFAULT 0,
    "minimoParticipacionesCorredor" INTEGER NOT NULL DEFAULT 0,
    "exigeAfiliacion" BOOLEAN NOT NULL DEFAULT false,
    "admiteResultadosPrevios" BOOLEAN NOT NULL DEFAULT false,
    "necesitaRecalculo" BOOLEAN NOT NULL DEFAULT false,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CategoriaGrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grandPrixId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sexo" TEXT,
    "edadMinima" INTEGER,
    "edadMaxima" INTEGER,
    "discapacidad" TEXT,
    CONSTRAINT "CategoriaGrandPrix_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrandPrixPrueba" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grandPrixId" TEXT NOT NULL,
    "distanciaCarreraId" TEXT NOT NULL,
    "incluida" BOOLEAN NOT NULL DEFAULT true,
    "reglamentoId" TEXT,
    CONSTRAINT "GrandPrixPrueba_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GrandPrixPrueba_distanciaCarreraId_fkey" FOREIGN KEY ("distanciaCarreraId") REFERENCES "DistanciaCarrera" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GrandPrixPrueba_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "ReglamentoGrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParticipacionGrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grandPrixId" TEXT NOT NULL,
    "corredorId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Activa',
    "fechaInscripcion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "afiliacionVerificada" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ParticipacionGrandPrix_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParticipacionGrandPrix_corredorId_fkey" FOREIGN KEY ("corredorId") REFERENCES "Corredor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParticipacionGrandPrix_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaGrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReglamentoGrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grandPrixId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Borrador',
    "basePuesto" TEXT NOT NULL,
    "fechaPublicacion" DATETIME,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReglamentoGrandPrix_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReglaPuntajeGrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reglamentoId" TEXT NOT NULL,
    "pruebaId" TEXT NOT NULL,
    "puesto" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL,
    CONSTRAINT "ReglaPuntajeGrandPrix_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "ReglamentoGrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReglaPuntajeGrandPrix_pruebaId_fkey" FOREIGN KEY ("pruebaId") REFERENCES "GrandPrixPrueba" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PuntajeGrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participacionId" TEXT NOT NULL,
    "pruebaId" TEXT NOT NULL,
    "resultadoId" TEXT NOT NULL,
    "reglamentoId" TEXT NOT NULL,
    "puestoCategoria" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "fechaCalculo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PuntajeGrandPrix_participacionId_fkey" FOREIGN KEY ("participacionId") REFERENCES "ParticipacionGrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PuntajeGrandPrix_pruebaId_fkey" FOREIGN KEY ("pruebaId") REFERENCES "GrandPrixPrueba" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PuntajeGrandPrix_resultadoId_fkey" FOREIGN KEY ("resultadoId") REFERENCES "Resultado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PuntajeGrandPrix_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "ReglamentoGrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CambioGrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grandPrixId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "datosAntes" TEXT,
    "datosDespues" TEXT,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CambioGrandPrix_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CambioGrandPrix_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaGrandPrix_grandPrixId_nombre_key" ON "CategoriaGrandPrix"("grandPrixId", "nombre");

-- CreateIndex
CREATE INDEX "GrandPrixPrueba_reglamentoId_idx" ON "GrandPrixPrueba"("reglamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "GrandPrixPrueba_grandPrixId_distanciaCarreraId_key" ON "GrandPrixPrueba"("grandPrixId", "distanciaCarreraId");

-- CreateIndex
CREATE INDEX "ParticipacionGrandPrix_grandPrixId_categoriaId_estado_idx" ON "ParticipacionGrandPrix"("grandPrixId", "categoriaId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipacionGrandPrix_grandPrixId_corredorId_key" ON "ParticipacionGrandPrix"("grandPrixId", "corredorId");

-- CreateIndex
CREATE UNIQUE INDEX "ReglamentoGrandPrix_grandPrixId_version_key" ON "ReglamentoGrandPrix"("grandPrixId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ReglaPuntajeGrandPrix_reglamentoId_pruebaId_puesto_key" ON "ReglaPuntajeGrandPrix"("reglamentoId", "pruebaId", "puesto");

-- CreateIndex
CREATE INDEX "PuntajeGrandPrix_pruebaId_vigente_idx" ON "PuntajeGrandPrix"("pruebaId", "vigente");

-- CreateIndex
CREATE UNIQUE INDEX "PuntajeGrandPrix_participacionId_pruebaId_key" ON "PuntajeGrandPrix"("participacionId", "pruebaId");

-- CreateIndex
CREATE INDEX "CambioGrandPrix_grandPrixId_fechaHora_idx" ON "CambioGrandPrix"("grandPrixId", "fechaHora");
