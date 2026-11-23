-- CreateTable
CREATE TABLE "LecturaHuerfana" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigoEpc" TEXT NOT NULL,
    "fechaHoraLectura" DATETIME NOT NULL,
    "intensidad" INTEGER NOT NULL,
    "lectorRFIDId" TEXT NOT NULL,
    CONSTRAINT "LecturaHuerfana_lectorRFIDId_fkey" FOREIGN KEY ("lectorRFIDId") REFERENCES "LectorRFID" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
