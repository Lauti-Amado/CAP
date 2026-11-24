//backend/src/services/carreraEstado.service.ts
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { carreraInclude, toCarreraDto, type CarreraDTO } from "../dtos/carrera.dto";
import { notificarClasificacionActualizada } from "../events/clasificacion.events";
import * as reglas from "../rules/carrera.rules";
import { sincronizarPendientes } from "./clasificacion.service";
import { iniciarMonitoreoBackup, generarBackupExcel, detenerMonitoreoBackup } from "./backupService"; // 🟢 Importamos el servicio de backup

// Entrega_kits -> En_curso. Se guarda la hora real de largada y NO se toca la hora estimada.
export async function iniciar(carreraId: string, ahora: Date = new Date()): Promise<CarreraDTO> {
    const carrera = await prisma.$transaction(async (tx) => {
        const actual = await tx.carrera.findUnique({ where: { id: carreraId } });
        if (!actual) throw new ErrorNoEncontrado("Carrera no encontrada.");

        const otrasEnCurso = await tx.carrera.count({ where: { estado: "En_curso", NOT: { id: carreraId } } });
        const evaluacion = reglas.evaluarInicio(actual.estado, otrasEnCurso > 0);
        if (!evaluacion.permitida) throw new ErrorReglaDeNegocio(evaluacion.motivo);

        return tx.carrera.update({
            where: { id: carreraId },
            data: {
                estado: "En_curso",
                ejecucion: {
                    upsert: {
                        create: { fechaHoraInicio: ahora },
                        update: { fechaHoraInicio: ahora, fechaHoraFin: null },
                    },
                },
            },
            include: carreraInclude,
        });
    });

    // Desde acá no se entregan más kits: todos los corredores habilitados tienen su clasificación "Pendiente"
    await sincronizarPendientes(carreraId);

    // 🟢 1. INTEGRACIÓN BACKUP: Arrancar el ciclo automático cada 5 minutos al iniciar la carrera
    iniciarMonitoreoBackup(carreraId);

    return toCarreraDto(carrera);
}

// En_curso -> Finalizada. Los que no llegaron pasan a "No_finalizo".
export async function finalizar(carreraId: string, ahora: Date = new Date()): Promise<CarreraDTO> {
    const actual = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { estado: true, fechaHoraCarrera: true, ejecucion: { select: { fechaHoraInicio: true}} }, });
    if (!actual) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const evaluacion = reglas.evaluarFinalizacion(actual.estado);
    if (!evaluacion.permitida) throw new ErrorReglaDeNegocio(evaluacion.motivo);

    await sincronizarPendientes(carreraId); // idempotente: por si alguna quedó sin crear

    //Las carreras iniciadas antes de existir EjecucionCarrera tenían la hora real de largada en fechaHoraCarrera
    const inicio = actual.ejecucion?.fechaHoraInicio ?? actual.fechaHoraCarrera;

    // 🟢 2. INTEGRACIÓN BACKUP: Generar el Excel de clasificación final obligatorio justo antes de cerrar
    await generarBackupExcel(carreraId);

    // 🟢 3. INTEGRACIÓN BACKUP: Detener el temporizador de los 5 minutos en segundo plano
    detenerMonitoreoBackup();

    const carrera = await prisma.$transaction(async (tx) => {
        await tx.clasificacion.updateMany({
            where: { estado: "Pendiente", inscripcion: { idCarrera: carreraId } },
            data: { estado: "No_finalizo" },
        });

        return tx.carrera.update({
            where: { id: carreraId },
            data: {
                estado: "Finalizada",
                ejecucion: {
                    upsert: {
                        create: { fechaHoraInicio: inicio, fechaHoraFin: ahora },
                        update: { fechaHoraFin: ahora },
                    },
                },
            },
            include: carreraInclude,
        });
    });

    // Con la carrera Finalizada el listener regenera los resultados por categoría
    notificarClasificacionActualizada({ carreraId });

    return toCarreraDto(carrera);
}