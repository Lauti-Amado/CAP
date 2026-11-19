-- CreateTable
CREATE TABLE "EjecucionCarrera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carreraId" TEXT NOT NULL,
    "fechaHoraInicio" DATETIME NOT NULL,
    "fechaHoraFin" DATETIME,
    CONSTRAINT "EjecucionCarrera_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EjecucionCarrera_carreraId_key" ON "EjecucionCarrera"("carreraId");
