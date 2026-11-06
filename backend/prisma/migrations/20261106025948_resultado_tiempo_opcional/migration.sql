-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Resultado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tiempoLlegada" INTEGER,
    "puestoGeneral" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "clasificacionId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Resultado_clasificacionId_fkey" FOREIGN KEY ("clasificacionId") REFERENCES "Clasificacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Resultado" ("clasificacionId", "estado", "fechaHoraCreacion", "fechaHoraModificacion", "id", "puestoGeneral", "tiempoLlegada") SELECT "clasificacionId", "estado", "fechaHoraCreacion", "fechaHoraModificacion", "id", "puestoGeneral", "tiempoLlegada" FROM "Resultado";
DROP TABLE "Resultado";
ALTER TABLE "new_Resultado" RENAME TO "Resultado";
CREATE UNIQUE INDEX "Resultado_clasificacionId_key" ON "Resultado"("clasificacionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
