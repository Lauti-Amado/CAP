//backend/src/services/carreraEstado.service.ts
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { toCarreraDto, type CarreraDTO } from "../dtos/carrera.dto";
import { notificarClasificacionActualizada } from "../events/clasificacion.events";
import * as reglas from "../rules/carrera.rules";
import { sincronizarPendientes } from "./clasificacion.service";

const incluirCarrera = {
    lugar: { include: { localidad: true } },
    distanciaCarrera: { include: { distancia: true } },
} satisfies Prisma.CarreraInclude;

// Entrega_kits -> En_curso. La hora de largada pasa a ser el momento real de inicio.
// `ahora` se recibe como parámetro para no depender del reloj dentro de la lógica.
export async function iniciar(carreraId: string, ahora: Date = new Date()): Promise<CarreraDTO> {
    const carrera = await prisma.$transaction(async (tx) => {
        const actual = await tx.carrera.findUnique({ where: { id: carreraId } });
        if (!actual) throw new ErrorNoEncontrado("Carrera no encontrada.");

        const otrasEnCurso = await tx.carrera.count({ where: { estado: "En_curso", NOT: { id: carreraId } } });
        const evaluacion = reglas.evaluarInicio(actual.estado, otrasEnCurso > 0);
        if (!evaluacion.permitida) throw new ErrorReglaDeNegocio(evaluacion.motivo);

        return tx.carrera.update({
            where: { id: carreraId },
            data: { estado: "En_curso", fechaHoraCarrera: ahora },
            include: incluirCarrera,
        });
    });

    // Desde acá no se entregan más kits: todos los corredores habilitados tienen su clasificación "Pendiente"
    await sincronizarPendientes(carreraId);

    return toCarreraDto(carrera);
}

// En_curso -> Finalizada. Los que no llegaron pasan a "No_finalizo".
export async function finalizar(carreraId: string): Promise<CarreraDTO> {
    const actual = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { estado: true } });
    if (!actual) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const evaluacion = reglas.evaluarFinalizacion(actual.estado);
    if (!evaluacion.permitida) throw new ErrorReglaDeNegocio(evaluacion.motivo);

    await sincronizarPendientes(carreraId); // idempotente: por si alguna quedó sin crear

    const carrera = await prisma.$transaction(async (tx) => {
        await tx.clasificacion.updateMany({
            where: { estado: "Pendiente", inscripcion: { idCarrera: carreraId } },
            data: { estado: "No_finalizo" },
        });

        return tx.carrera.update({
            where: { id: carreraId },
            data: { estado: "Finalizada" },
            include: incluirCarrera,
        });
    });

    // Con la carrera Finalizada el listener regenera los resultados por categoría
    notificarClasificacionActualizada({ carreraId });

    return toCarreraDto(carrera);
}