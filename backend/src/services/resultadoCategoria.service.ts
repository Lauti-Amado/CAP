//backend/src/services/resultadoCategoria.service.ts
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type { GeneracionCarreraDTO, GeneracionCategoriaDTO } from "../dtos/resultadoCategoria.dto";
import * as reglas from "./categoria.reglas";

type Tx = Prisma.TransactionClient;

const carreraSelect = {
    id: true,
    estado: true,
    fechaHoraCarrera: true,
    distanciaCarrera: { select: { idDistancia: true, distancia: { select: { kilometraje: true, tipoDistancia: true } } } },
} satisfies Prisma.CarreraSelect;

type CarreraParaGenerar = Prisma.CarreraGetPayload<{ select: typeof carreraSelect }>;
type CategoriaConCriterios = Prisma.CategoriaGetPayload<{ include: { criterios: true } }>;
type ParticipanteDistancia = reglas.Participante & { idDistancia: string };

type Calculo =
    | { ok: true; asignaciones: reglas.AsignacionCategoria[]; dto: GeneracionCategoriaDTO }
    | { ok: false; motivo: string };

// Solo los que terminaron y tienen resultado (con o sin tiempo cargado)
async function cargarParticipantes(tx: Tx, carreraId: string): Promise<ParticipanteDistancia[]> {
    const resultados = await tx.resultado.findMany({
        where: {
            clasificacion: {
                estado: "Finalizo",
                inscripcion: { distanciaCarrera: { idCarrera: carreraId } },
            },
        },
        select: {
            id: true,
            puestoGeneral: true,
            clasificacion: {
                select: {
                    inscripcion: {
                        select: {
                            idDistancia: true,
                            corredor: { select: { sexo: true, fechaNacimiento: true, discapacidad: true } },
                        },
                    },
                },
            },
        },
    });

    return resultados.map((r) => ({
        resultadoId: r.id,
        puestoGeneral: r.puestoGeneral,
        idDistancia: r.clasificacion.inscripcion.idDistancia,
        ...r.clasificacion.inscripcion.corredor,
    }));
}

// Puestos de una categoría, calculados por separado en cada distancia (y tipo) de la carrera
function calcular(
    categoria: CategoriaConCriterios,
    carrera: CarreraParaGenerar,
    participantes: ParticipanteDistancia[]
): Calculo {
    if (categoria.criterios.length === 0) return { ok: false, motivo: "La categoría no tiene criterios definidos." };

    const grupos: reglas.Grupo[] = [];
    for (const criterio of categoria.criterios) {
        const condicion = reglas.interpretarCriterio(criterio.valor);
        if (!condicion) return { ok: false, motivo: `No se puede interpretar el criterio "${criterio.valor}".` };
        grupos.push({ criterioId: criterio.id, condicion });
    }

    const asignaciones: reglas.AsignacionCategoria[] = [];
    const distancias: GeneracionCategoriaDTO["distancias"] = [];

    for (const dc of carrera.distanciaCarrera) {
        const deEstaDistancia = participantes.filter((p) => p.idDistancia === dc.idDistancia);
        const resultado = reglas.asignarPuestosPorGrupo(deEstaDistancia, grupos, carrera.fechaHoraCarrera);
        const { kilometraje, tipoDistancia } = dc.distancia;

        if (resultado.conflictos.length > 0) {
            return {
                ok: false,
                motivo: `Los criterios se superponen en ${kilometraje}K ${tipoDistancia}: ${resultado.conflictos.length} corredor(es) encajan en más de un subgrupo.`,
            };
        }

        asignaciones.push(...resultado.asignaciones);

        const porCriterio = new Map<string, number>();
        for (const a of resultado.asignaciones) porCriterio.set(a.criterioId, (porCriterio.get(a.criterioId) ?? 0) + 1);

        distancias.push({
            kilometraje,
            tipoDistancia,
            asignados: resultado.asignaciones.length,
            sinGrupo: resultado.sinGrupo.length,
            grupos: categoria.criterios.map((c) => ({ criterio: c.valor, corredores: porCriterio.get(c.id) ?? 0 })),
        });
    }

    return {
        ok: true,
        asignaciones,
        dto: { categoria: { id: categoria.id, nombre: categoria.nombre }, distancias },
    };
}

// Reemplaza lo que hubiera de esa categoría en esa carrera (es idempotente)
async function guardar(tx: Tx, carreraId: string, categoriaId: string, asignaciones: reglas.AsignacionCategoria[]) {
    await tx.resultadoCategoria.deleteMany({
        where: {
            categoriaId,
            resultado: { clasificacion: { inscripcion: { distanciaCarrera: { idCarrera: carreraId } } } },
        },
    });
    if (asignaciones.length === 0) return;

    await tx.resultadoCategoria.createMany({
        data: asignaciones.map((a) => ({ resultadoId: a.resultadoId, categoriaId, puesto: a.puesto })),
    });
}

// Con categoriaId genera solo esa categoría (y falla si está mal configurada).
// Sin categoriaId genera todas: la que esté mal configurada se omite y se informa, sin frenar a las demás.
async function generar(carreraId: string, categoriaId?: string): Promise<GeneracionCarreraDTO> {
    return prisma.$transaction(async (tx) => {
        const carrera = await tx.carrera.findUnique({ where: { id: carreraId }, select: carreraSelect });
        if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");
        if (carrera.estado !== "Finalizada") {
            throw new ErrorReglaDeNegocio("Los resultados por categoría se generan cuando la carrera está finalizada.");
        }

        const categorias = await tx.categoria.findMany({
            where: categoriaId ? { id: categoriaId } : {},
            include: { criterios: true },
            orderBy: { nombre: "asc" },
        });
        if (categoriaId && categorias.length === 0) throw new ErrorNoEncontrado("Categoría no encontrada.");

        const participantes = await cargarParticipantes(tx, carreraId);
        const generadas: GeneracionCategoriaDTO[] = [];

        for (const categoria of categorias) {
            const calculo = calcular(categoria, carrera, participantes);

            if (!calculo.ok) {
                if (categoriaId) throw new ErrorReglaDeNegocio(`Categoría ${categoria.nombre}: ${calculo.motivo}`);
                generadas.push({
                    categoria: { id: categoria.id, nombre: categoria.nombre },
                    omitida: calculo.motivo,
                    distancias: [],
                });
                continue;
            }

            await guardar(tx, carreraId, categoria.id, calculo.asignaciones);
            generadas.push(calculo.dto);
        }

        return { carreraId, categorias: generadas };
    }, { timeout: 30_000 });
}

export function generarParaCategoria(carreraId: string, categoriaId: string): Promise<GeneracionCarreraDTO> {
    return generar(carreraId, categoriaId);
}

export function generarTodas(carreraId: string): Promise<GeneracionCarreraDTO> {
    return generar(carreraId);
}

// Para cuando cambia la clasificación general: si la carrera ya terminó, se reacomodan todas las categorías
export async function regenerarSiCorresponde(carreraId: string): Promise<void> {
    const carrera = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { estado: true } });
    if (carrera?.estado !== "Finalizada") return;

    const resultado = await generar(carreraId);
    for (const categoria of resultado.categorias) {
        if (categoria.omitida) {
            console.warn(`Categoría ${categoria.categoria.nombre} omitida en la carrera ${carreraId}: ${categoria.omitida}`);
        }
    }
}