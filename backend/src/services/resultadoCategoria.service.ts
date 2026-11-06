//backend/src/services/resultadoCategoria.service.ts
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type { GeneracionCategoriaDTO } from "../dtos/resultadoCategoria.dto";
import * as reglas from "./categoria.reglas";

// Genera (o regenera) los puestos de una categoría para todos los corredores de la carrera.
// Es idempotente: reemplaza lo que hubiera de esa categoría en esa carrera, así que se puede
// volver a llamar si después se corrige la clasificación general.
export async function generarParaCategoria(carreraId: string, categoriaId: string): Promise<GeneracionCategoriaDTO> {
    return prisma.$transaction(async (tx) => {
        const carrera = await tx.carrera.findUnique({
            where: { id: carreraId },
            select: { id: true, estado: true, fechaHoraCarrera: true },
        });
        if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");
        if (carrera.estado !== "Finalizada") {
            throw new ErrorReglaDeNegocio("Los resultados por categoría se generan cuando la carrera está finalizada.");
        }

        const categoria = await tx.categoria.findUnique({
            where: { id: categoriaId },
            include: { criterios: true },
        });
        if (!categoria) throw new ErrorNoEncontrado("Categoría no encontrada.");
        if (categoria.criterios.length === 0) {
            throw new ErrorReglaDeNegocio("La categoría no tiene criterios definidos.");
        }

        const grupos: reglas.Grupo[] = [];
        for (const criterio of categoria.criterios) {
            const condicion = reglas.interpretarCriterio(criterio.valor);
            if (!condicion) {
                throw new ErrorReglaDeNegocio(
                    `No se puede interpretar el criterio "${criterio.valor}" de la categoría ${categoria.nombre}.`
                );
            }
            grupos.push({ criterioId: criterio.id, condicion });
        }

        const deLaCarrera = {
            clasificacion: { inscripcion: { distanciaCarrera: { idCarrera: carreraId } } },
        };

        // Solo los que terminaron y tienen resultado (con o sin tiempo cargado)
        const resultados = await tx.resultado.findMany({
            where: { ...deLaCarrera, clasificacion: { ...deLaCarrera.clasificacion, estado: "Finalizo" } },
            select: {
                id: true,
                puestoGeneral: true,
                clasificacion: {
                    select: {
                        inscripcion: {
                            select: { corredor: { select: { sexo: true, fechaNacimiento: true, discapacidad: true } } },
                        },
                    },
                },
            },
        });

        const participantes: reglas.Participante[] = resultados.map((r) => ({
            resultadoId: r.id,
            puestoGeneral: r.puestoGeneral,
            ...r.clasificacion.inscripcion.corredor,
        }));

        const { asignaciones, sinGrupo } = reglas.asignarPuestosPorGrupo(
            participantes,
            grupos,
            carrera.fechaHoraCarrera
        );

        await tx.resultadoCategoria.deleteMany({ where: { categoriaId, resultado: deLaCarrera } });
        await tx.resultadoCategoria.createMany({
            data: asignaciones.map((a) => ({ resultadoId: a.resultadoId, categoriaId, puesto: a.puesto })),
        });

        const porCriterio = new Map<string, number>();
        for (const a of asignaciones) porCriterio.set(a.criterioId, (porCriterio.get(a.criterioId) ?? 0) + 1);

        return {
            carreraId,
            categoria: { id: categoria.id, nombre: categoria.nombre },
            asignados: asignaciones.length,
            sinGrupo: sinGrupo.length,
            grupos: categoria.criterios.map((c) => ({ criterio: c.valor, corredores: porCriterio.get(c.id) ?? 0 })),
        };
    }, { timeout: 30_000 });
}