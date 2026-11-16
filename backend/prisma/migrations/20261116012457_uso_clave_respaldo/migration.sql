-- CreateTable
CREATE TABLE "UsoClaveRespaldo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claveId" TEXT NOT NULL,
    "fechaHoraUso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsoClaveRespaldo_claveId_fkey" FOREIGN KEY ("claveId") REFERENCES "ClaveRespaldo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UsoClaveRespaldo_claveId_idx" ON "UsoClaveRespaldo"("claveId");
