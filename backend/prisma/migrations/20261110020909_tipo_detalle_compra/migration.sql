/*
  Warnings:

  - Added the required column `tipo` to the `DetalleCompra` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DetalleCompra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
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
INSERT INTO "new_DetalleCompra" ("cantidad", "descripcion", "fechaHoraCreacion", "fechaHoraModificacion", "id", "idCompra", "idDetalleProducto", "monto") SELECT "cantidad", "descripcion", "fechaHoraCreacion", "fechaHoraModificacion", "id", "idCompra", "idDetalleProducto", "monto" FROM "DetalleCompra";
DROP TABLE "DetalleCompra";
ALTER TABLE "new_DetalleCompra" RENAME TO "DetalleCompra";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
