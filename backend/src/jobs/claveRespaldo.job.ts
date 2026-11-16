//backend/src/jobs/claveRespaldo.job.ts
import { prisma } from "../config/prisma";
import { garantizarClaves } from "../services/claveRespaldo.service";

const MINIMO_DISPONIBLES = 2;
const HORAS_PREVIAS = 48;
const INTERVALO_MS = 15 * 60 * 1000;

//Hay una carrera que largará en las próximas horas (o que largó hace poco)
async function hayCarreraCercana(): Promise<boolean> {
    const ahora = Date.now();
    const cantidad = await prisma.carrera.count({
        where: {
            estado: { notIn: ["Finalizada", "Cancelada"] },
            fechaHoraCarrera: {
                gte: new Date(ahora - 24 * 60 * 60 * 1000),
                lte: new Date(ahora + HORAS_PREVIAS * 60 * 60 * 1000),
            },
        },
    });
    return cantidad > 0;
}

export async function mantenerClavesRespaldo(): Promise<void> {
    try {
        if (!(await hayCarreraCercana())) return;

        const creadas = await garantizarClaves(MINIMO_DISPONIBLES);
        if (creadas > 0) console.log(`Se generaron ${creadas} claves de respaldo.`);
    } catch (error) {
        console.error("No se pudieron verificar las claves de respaldo:", error);
    }
}

export function iniciarMantenimientoClaves(): void {
    void mantenerClavesRespaldo();
    setInterval(() => void mantenerClavesRespaldo(), INTERVALO_MS).unref();
}