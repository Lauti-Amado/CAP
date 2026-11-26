/*
  Warnings:

  - You are about to drop the `DetalleProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `isPagado` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `idCompra` on the `Inscripcion` table. All the data in the column will be lost.
  - You are about to drop the column `idDistanciaCarrera` on the `Inscripcion` table. All the data in the column will be lost.
  - Added the required column `idCarrera` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idDetalleCompra` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idDistancia` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DetalleProducto";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DetalleCompra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descripcion" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "idCompra" TEXT NOT NULL,
    "idDetalleProducto" TEXT,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "DetalleCompra_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleCompra_idDetalleProducto_fkey" FOREIGN KEY ("idDetalleProducto") REFERENCES "ProductoVariante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Compra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montoTotal" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'En_proceso',
    "metodoPago" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Compra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Compra" ("fechaHoraCreacion", "fechaHoraModificacion", "id", "metodoPago", "montoTotal", "usuarioId") SELECT "fechaHoraCreacion", "fechaHoraModificacion", "id", "metodoPago", "montoTotal", "usuarioId" FROM "Compra";
DROP TABLE "Compra";
ALTER TABLE "new_Compra" RENAME TO "Compra";
CREATE TABLE "new_Inscripcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'En_proceso',
    "idDetalleCompra" TEXT NOT NULL,
    "idCorredor" TEXT NOT NULL,
    "idCarrera" TEXT NOT NULL,
    "idDistancia" TEXT NOT NULL,
    "equipoId" TEXT,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Inscripcion_idDetalleCompra_fkey" FOREIGN KEY ("idDetalleCompra") REFERENCES "DetalleCompra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_idCorredor_fkey" FOREIGN KEY ("idCorredor") REFERENCES "Corredor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_idCarrera_idDistancia_fkey" FOREIGN KEY ("idCarrera", "idDistancia") REFERENCES "DistanciaCarrera" ("idCarrera", "idDistancia") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inscripcion" ("equipoId", "estado", "fechaHoraCreacion", "fechaHoraModificacion", "id", "idCorredor") SELECT "equipoId", "estado", "fechaHoraCreacion", "fechaHoraModificacion", "id", "idCorredor" FROM "Inscripcion";
DROP TABLE "Inscripcion";
ALTER TABLE "new_Inscripcion" RENAME TO "Inscripcion";
CREATE UNIQUE INDEX "Inscripcion_idDetalleCompra_key" ON "Inscripcion"("idDetalleCompra");
CREATE UNIQUE INDEX "Inscripcion_idCorredor_idCarrera_key" ON "Inscripcion"("idCorredor", "idCarrera");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
