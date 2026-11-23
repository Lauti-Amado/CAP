-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "dorsalId" TEXT NOT NULL,
    CONSTRAINT "Chip_dorsalId_fkey" FOREIGN KEY ("dorsalId") REFERENCES "Dorsal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Chip" ("dorsalId", "id", "numero") SELECT "dorsalId", "id", "numero" FROM "Chip";
DROP TABLE "Chip";
ALTER TABLE "new_Chip" RENAME TO "Chip";
CREATE UNIQUE INDEX "Chip_numero_key" ON "Chip"("numero");
CREATE UNIQUE INDEX "Chip_dorsalId_key" ON "Chip"("dorsalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
