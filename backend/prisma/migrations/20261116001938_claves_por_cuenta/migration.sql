/*
  Warnings:

  - You are about to drop the column `creadaPorId` on the `ClaveRespaldo` table. All the data in the column will be lost.
  - You are about to drop the column `lote` on the `ClaveRespaldo` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `ClaveRespaldo` table. All the data in the column will be lost.
  - You are about to drop the column `usadaPorId` on the `ClaveRespaldo` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `ClaveRespaldo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClaveRespaldo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claveCifrada" TEXT NOT NULL,
    "claveHash" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "fechaHoraUso" DATETIME,
    "usuarioId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClaveRespaldo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClaveRespaldo" ("claveCifrada", "claveHash", "estado", "fechaHoraCreacion", "fechaHoraUso", "id") SELECT "claveCifrada", "claveHash", "estado", "fechaHoraCreacion", "fechaHoraUso", "id" FROM "ClaveRespaldo";
DROP TABLE "ClaveRespaldo";
ALTER TABLE "new_ClaveRespaldo" RENAME TO "ClaveRespaldo";
CREATE UNIQUE INDEX "ClaveRespaldo_claveHash_key" ON "ClaveRespaldo"("claveHash");
CREATE INDEX "ClaveRespaldo_usuarioId_estado_idx" ON "ClaveRespaldo"("usuarioId", "estado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
