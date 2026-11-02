-- CreateTable
CREATE TABLE "EntidadEmisora" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comprobante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montoTotalPago" REAL NOT NULL,
    "fechaHoraPago" DATETIME NOT NULL,
    "documentoTitularPago" TEXT NOT NULL,
    "nombreApellidoTitularPago" TEXT NOT NULL,
    "codigoComprobante" TEXT,
    "entidadEmisoraId" TEXT,
    "compraId" TEXT NOT NULL,
    CONSTRAINT "Comprobante_entidadEmisoraId_fkey" FOREIGN KEY ("entidadEmisoraId") REFERENCES "EntidadEmisora" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comprobante_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comprobante" ("compraId", "documentoTitularPago", "fechaHoraPago", "id", "montoTotalPago", "nombreApellidoTitularPago") SELECT "compraId", "documentoTitularPago", "fechaHoraPago", "id", "montoTotalPago", "nombreApellidoTitularPago" FROM "Comprobante";
DROP TABLE "Comprobante";
ALTER TABLE "new_Comprobante" RENAME TO "Comprobante";
CREATE UNIQUE INDEX "Comprobante_compraId_key" ON "Comprobante"("compraId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
