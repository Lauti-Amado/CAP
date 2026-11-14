//backend/src/services/carreraDetalle.service.ts
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { toCarreraDto } from "../dtos/carrera.dto";
import type { CarreraDetalleDTO } from "../dtos/carreraDetalle.dto";

export async function obtenerDetalle(carreraId: string): Promise<CarreraDetalleDTO> {
    const carrera = await prisma.carrera.findUnique({
        where: { id: carreraId },
        include: {
            lugar: { include: { localidad: true } },
            distanciaCarrera: { include: { distancia: true } },
        },
    });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const [cantidadInscriptos, cantidadInscriptosConfirmados, cantidadKitsEntregados, cantidadClasificados] = await Promise.all([
        // Las anuladas liberan su lugar
        prisma.inscripcion.count({ where: { idCarrera: carreraId, estado: { not: "Anulada" } } }),
        // Solo las pagas o con kit retirado
        prisma.inscripcion.count({ where: { idCarrera: carreraId, estado: { in: ["Pagada", "Confirmada"] } } }),
        prisma.entregaKit.count({ where: { inscripcion: { idCarrera: carreraId } } }),
        // Clasificados: los que ya tienen resultado cargado
        prisma.resultado.count({ where: { clasificacion: { inscripcion: { idCarrera: carreraId } } } }),
    ]);

    return {
        ...toCarreraDto(carrera),
        cantidadInscriptos,
        cantidadInscriptosConfirmados,
        cantidadKitsEntregados,
        cantidadClasificados,
    };
}