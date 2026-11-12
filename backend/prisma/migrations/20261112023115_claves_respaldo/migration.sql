-- CreateTable
CREATE TABLE "ClaveRespaldo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lote" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "claveCifrada" TEXT NOT NULL,
    "claveHash" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "creadaPorId" TEXT NOT NULL,
    "usadaPorId" TEXT,
    "fechaHoraUso" DATETIME,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClaveRespaldo_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClaveRespaldo_usadaPorId_fkey" FOREIGN KEY ("usadaPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaveRespaldo_claveHash_key" ON "ClaveRespaldo"("claveHash");

-- CreateIndex
CREATE UNIQUE INDEX "ClaveRespaldo_lote_numero_key" ON "ClaveRespaldo"("lote", "numero");
