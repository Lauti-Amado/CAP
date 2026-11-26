-- CreateTable
CREATE TABLE "PlantillaCertificado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "colorPrimario" TEXT NOT NULL,
    "colorSecundario" TEXT NOT NULL,
    "colorFondo" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "esquinasRedondeadas" BOOLEAN NOT NULL DEFAULT true,
    "sombras" BOOLEAN NOT NULL DEFAULT true,
    "marcaDeAgua" BOOLEAN NOT NULL DEFAULT false,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL
);
