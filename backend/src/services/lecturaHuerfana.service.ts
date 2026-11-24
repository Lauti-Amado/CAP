//backend/src/services/lecturaHuerfana.service.ts
import { prisma } from "../config/prisma";

export type LecturaHuerfanaEntrada = {
    codigoEpc: string;
    fechaHoraLectura: Date;
    intensidad: number;
    lectorRFIDId: string;
};

// Guarda una lectura cuyo EPC no pertenece a ningún chip asociado a un dorsal.
// No se usa para clasificar: queda registrada solo para monitoreo y auditoría.
export async function registrarLecturaHuerfana(datos: LecturaHuerfanaEntrada): Promise<void> {
    await prisma.lecturaHuerfana.create({
        data: {
            // Mismo formato que Chip.numero, para poder compararlos
            codigoEpc: datos.codigoEpc.trim().toUpperCase(),
            fechaHoraLectura: datos.fechaHoraLectura,
            intensidad: datos.intensidad,
            lectorRFIDId: datos.lectorRFIDId,
        },
    });
}
