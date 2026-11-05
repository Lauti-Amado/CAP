/*
  Warnings:

  - A unique constraint covering the columns `[idCarrera,idDistancia]` on the table `DistanciaCarrera` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DistanciaCarrera_idCarrera_idDistancia_key" ON "DistanciaCarrera"("idCarrera", "idDistancia");
