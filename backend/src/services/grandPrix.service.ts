import { prisma } from "../config/prisma";
import type {
    Prisma,
    EstadoGrandPrix,
    EstadoParticipacionGrandPrix,
    BasePuestoGrandPrix,
} from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type {
    DatosGrandPrix,
    DatosCategoriaGP,
    DatosReglasGP,
    AplicacionReglamento,
    FiltrosTablaGP,
} from "../validations/grandPrix.validations";
import {
    asignarPosiciones,
    calcularAportes,
    categoriasSeSuperponen,
    cumpleCategoria,
    type AporteGP,
} from "./grandPrix.reglas";
import {
    grandPrixInclude as includeGP,
    resumenGrandPrixInclude,
    cambioGrandPrixSelect,
    detalleCambioGrandPrixSelect,
    catalogoPruebaGrandPrixInclude,
    corredorGrandPrixInclude,
    toConfiguracionGrandPrixDTO,
    toResumenGrandPrixDTO,
    toGrandPrixDTO,
    toDetalleCambioGrandPrixDTO,
    toCatalogoPruebaGrandPrixDTO,
    toCorredorGrandPrixDTO,
    toPrevisualizacionGrandPrixDTO,
    toDetallePuntajeGrandPrixDTO,
    toFilaTablaGrandPrixDTO,
    toTablaGrandPrixDTO,
    type GrandPrixPrisma as GP,
    type ResumenGrandPrixDTO,
    type GrandPrixDTO,
    type DetalleCambioGrandPrixDTO,
    type CatalogoPruebaGrandPrixDTO,
    type CorredorGrandPrixDTO,
    type RecursoGrandPrixDTO,
    type RecalculoGrandPrixDTO,
    type PrevisualizacionGrandPrixDTO,
    type TablaGrandPrixDTO,
} from "../dtos/grandPrix.dto";

type Tx = Prisma.TransactionClient;
type Actor = string | null;

async function obtenerGP(tx: Tx, id: string): Promise<GP> {
    const gp = await tx.grandPrix.findUnique({
        where: { id },
        include: includeGP,
    });
    if (!gp) throw new ErrorNoEncontrado("Grand Prix no encontrado.");
    return gp;
}
function editable(gp: GP) {
    if (gp.estado === "Cerrado" || gp.estado === "Cancelado") {
        throw new ErrorReglaDeNegocio(
            "Reabrí el Grand Prix antes de modificarlo.",
        );
    }
}
function dentroPeriodo(fecha: Date, gp: { fechaInicio: Date; fechaFin: Date }) {
    return (
        fecha >= gp.fechaInicio &&
        fecha.getTime() < gp.fechaFin.getTime() + 86400000
    );
}
async function auditar(
    tx: Tx,
    gpId: string,
    actor: Actor,
    accion: string,
    motivo: string,
    antes: unknown,
    despues: unknown,
) {
    await tx.cambioGrandPrix.create({
        data: {
            grandPrixId: gpId,
            usuarioId: actor,
            accion,
            motivo,
            datosAntes: antes === null ? null : JSON.stringify(antes),
            datosDespues: despues === null ? null : JSON.stringify(despues),
        },
    });
}

async function calcular(tx: Tx, gp: GP): Promise<AporteGP[]> {
    const ids = gp.pruebas
        .filter(
            (p) =>
                p.incluida &&
                p.distanciaCarrera.carrera.estado === "Finalizada",
        )
        .map((p) => p.distanciaCarreraId);
    const resultados = ids.length
        ? await tx.resultado.findMany({
              where: {
                  estado: "Oficial",
                  clasificacion: {
                      estado: "Finalizo",
                      inscripcion: {
                          estado: "Confirmada",
                          entregaKit: { isNot: null },
                          idDistanciaCarrera: { in: ids },
                      },
                  },
              },
              include: {
                  clasificacion: {
                      include: { inscripcion: { include: { corredor: true } } },
                  },
              },
          })
        : [];
    return calcularAportes({
        fechaReferenciaEdad: gp.fechaReferenciaEdad,
        exigeAfiliacion: gp.exigeAfiliacion,
        admiteResultadosPrevios: gp.admiteResultadosPrevios,
        categorias: gp.categorias,
        participantes: gp.participaciones,
        pruebas: gp.pruebas
            .filter((p) => p.reglamentoId !== null)
            .map((p) => ({
                id: p.id,
                carreraId: p.distanciaCarrera.idCarrera,
                fechaCarrera: p.distanciaCarrera.carrera.fechaHoraCarrera,
                estadoCarrera: p.distanciaCarrera.carrera.estado,
                incluida: p.incluida,
                reglamentoId: p.reglamentoId,
                basePuesto: p.reglamento?.basePuesto ?? "TodosCarrera",
                reglas:
                    p.reglamento?.reglas.filter((r) => r.pruebaId === p.id) ??
                    [],
                resultados: resultados
                    .filter(
                        (r) =>
                            r.clasificacion.inscripcion.idDistanciaCarrera ===
                            p.distanciaCarreraId,
                    )
                    .map((r) => ({
                        id: r.id,
                        puestoGeneral: r.puestoGeneral,
                        corredor: r.clasificacion.inscripcion.corredor,
                    })),
            })),
    });
}

async function recalcularTx(
    tx: Tx,
    gp: GP,
    actor: Actor,
    motivo: string,
): Promise<RecalculoGrandPrixDTO> {
    const aportes = await calcular(tx, gp);
    const anteriores = await tx.puntajeGrandPrix.findMany({
        where: { participacion: { grandPrixId: gp.id }, vigente: true },
        select: {
            participacionId: true,
            pruebaId: true,
            resultadoId: true,
            reglamentoId: true,
            puestoCategoria: true,
            puntos: true,
        },
    });
    await tx.puntajeGrandPrix.updateMany({
        where: { participacion: { grandPrixId: gp.id } },
        data: { vigente: false },
    });
    for (const aporte of aportes) {
        await tx.puntajeGrandPrix.upsert({
            where: {
                participacionId_pruebaId: {
                    participacionId: aporte.participacionId,
                    pruebaId: aporte.pruebaId,
                },
            },
            create: aporte,
            update: { ...aporte, vigente: true, fechaCalculo: new Date() },
        });
    }
    const faltanReglamentos = gp.pruebas.some(
        (p) => p.incluida && p.reglamentoId === null,
    );
    await tx.grandPrix.update({
        where: { id: gp.id },
        data: { necesitaRecalculo: faltanReglamentos },
    });
    const ordenar = (items: AporteGP[]) =>
        [...items].sort((a, b) =>
            `${a.participacionId}:${a.pruebaId}`.localeCompare(
                `${b.participacionId}:${b.pruebaId}`,
            ),
        );
    if (
        JSON.stringify(ordenar(anteriores)) !== JSON.stringify(ordenar(aportes))
    ) {
        await auditar(
            tx,
            gp.id,
            actor,
            "Recalculo",
            motivo,
            anteriores,
            aportes,
        );
    }
    return { aportes: aportes.length };
}

const transaccion = <T>(fn: (tx: Tx) => Promise<T>) =>
    prisma.$transaction(fn, { timeout: 30000 });

export async function listar(): Promise<ResumenGrandPrixDTO[]> {
    const ediciones = await prisma.grandPrix.findMany({
        orderBy: { fechaInicio: "desc" },
        include: resumenGrandPrixInclude,
    });
    return ediciones.map(toResumenGrandPrixDTO);
}

export async function obtener(id: string): Promise<GrandPrixDTO> {
    const gp = await transaccion((tx) => obtenerGP(tx, id));
    const cambios = await prisma.cambioGrandPrix.findMany({
        where: { grandPrixId: id },
        orderBy: { fechaHora: "desc" },
        take: 30,
        select: cambioGrandPrixSelect,
    });
    return toGrandPrixDTO(gp, cambios);
}

export async function obtenerCambio(
    id: string,
    cambioId: string,
): Promise<DetalleCambioGrandPrixDTO> {
    const cambio = await prisma.cambioGrandPrix.findFirst({
        where: { id: cambioId, grandPrixId: id },
        select: detalleCambioGrandPrixSelect,
    });
    if (!cambio)
        throw new ErrorNoEncontrado("Cambio no encontrado en esta edición.");
    return toDetalleCambioGrandPrixDTO(cambio);
}

export async function listarCatalogoPruebas(): Promise<
    CatalogoPruebaGrandPrixDTO[]
> {
    const pruebas = await prisma.distanciaCarrera.findMany({
        where: {
            distancia: { tipoDistancia: "Competitiva" },
            carrera: { estado: { not: "Cancelada" } },
        },
        include: catalogoPruebaGrandPrixInclude,
        orderBy: { carrera: { fechaHoraCarrera: "asc" } },
    });
    return pruebas.map(toCatalogoPruebaGrandPrixDTO);
}

export async function crear(
    datos: DatosGrandPrix,
    actor: Actor,
): Promise<RecursoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await tx.grandPrix.create({ data: datos });
        await auditar(
            tx,
            gp.id,
            actor,
            "Creacion",
            "Nueva edición de Grand Prix",
            null,
            datos,
        );
        return { id: gp.id };
    });
}

export async function actualizar(
    id: string,
    datos: DatosGrandPrix,
    motivo: string,
    actor: Actor,
): Promise<void> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        if (
            gp.participaciones.length &&
            gp.fechaReferenciaEdad.getTime() !==
                datos.fechaReferenciaEdad.getTime()
        ) {
            throw new ErrorReglaDeNegocio(
                "La fecha de referencia de edad queda fija desde la primera inscripción.",
            );
        }
        if (
            gp.pruebas.some(
                (p) =>
                    p.incluida &&
                    !dentroPeriodo(
                        p.distanciaCarrera.carrera.fechaHoraCarrera,
                        datos,
                    ),
            )
        ) {
            throw new ErrorReglaDeNegocio(
                "El período debe contener todas las pruebas incluidas. Excluí primero las que queden fuera.",
            );
        }
        await tx.grandPrix.update({
            where: { id },
            data: { ...datos, necesitaRecalculo: true },
        });
        await auditar(
            tx,
            id,
            actor,
            "Configuracion",
            motivo,
            toConfiguracionGrandPrixDTO(gp),
            datos,
        );
        if (gp.estado === "Activo")
            await recalcularTx(tx, await obtenerGP(tx, id), actor, motivo);
    });
}

export async function cambiarEstado(
    id: string,
    estado: EstadoGrandPrix,
    motivo: string,
    actor: Actor,
): Promise<void> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        if (gp.estado === estado) return;
        if (
            (gp.estado === "Cerrado" || gp.estado === "Cancelado") &&
            estado !== "Activo"
        ) {
            throw new ErrorReglaDeNegocio(
                "Para reabrir una edición seleccioná Activo.",
            );
        }
        if (estado === "Borrador" && gp.estado !== "Borrador")
            throw new ErrorReglaDeNegocio(
                "Una edición iniciada no vuelve a borrador.",
            );
        if (estado === "Activo" || estado === "Cerrado") {
            const incluidas = gp.pruebas.filter((p) => p.incluida);
            if (!gp.categorias.length || !incluidas.length)
                throw new ErrorReglaDeNegocio(
                    "Agregá categorías y pruebas antes de activar.",
                );
            if (
                incluidas.some(
                    (p) =>
                        p.reglamento?.estado !== "Publicado" ||
                        !p.reglamento.reglas.some((r) => r.pruebaId === p.id),
                )
            ) {
                throw new ErrorReglaDeNegocio(
                    "Todas las pruebas incluidas necesitan un reglamento publicado con su escala de puntos.",
                );
            }
            const eventos = new Set(
                incluidas
                    .filter(
                        (p) =>
                            estado !== "Cerrado" ||
                            p.distanciaCarrera.carrera.estado === "Finalizada",
                    )
                    .map((p) => p.distanciaCarrera.idCarrera),
            ).size;
            if (eventos < gp.minimoCarrerasCalendario)
                throw new ErrorReglaDeNegocio(
                    `Se requieren ${gp.minimoCarrerasCalendario} carreras distintas${estado === "Cerrado" ? " finalizadas" : " en el calendario"}.`,
                );
            if (
                estado === "Cerrado" &&
                incluidas.some(
                    (p) => p.distanciaCarrera.carrera.estado !== "Finalizada",
                )
            ) {
                throw new ErrorReglaDeNegocio(
                    "Finalizá o excluí las pruebas pendientes antes de cerrar la edición.",
                );
            }
            await recalcularTx(tx, gp, actor, motivo);
        }
        await tx.grandPrix.update({ where: { id }, data: { estado } });
        await auditar(tx, id, actor, "Estado", motivo, gp.estado, estado);
    });
}

export async function guardarCategoria(
    id: string,
    categoriaId: string | null,
    datos: DatosCategoriaGP,
    actor: Actor,
): Promise<RecursoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        if (
            gp.estado !== "Borrador" ||
            gp.participaciones.length ||
            (await tx.puntajeGrandPrix.count({
                where: { participacion: { grandPrixId: id } },
            }))
        ) {
            throw new ErrorReglaDeNegocio(
                "Las categorías quedan fijas al inscribir participantes o activar el GP. Definilas previamente.",
            );
        }
        const anterior = categoriaId
            ? gp.categorias.find((c) => c.id === categoriaId)
            : null;
        if (categoriaId && !anterior)
            throw new ErrorNoEncontrado(
                "Categoría no encontrada en esta edición.",
            );
        if (
            gp.categorias.some(
                (c) =>
                    c.id !== categoriaId &&
                    (c.nombre.toLowerCase() === datos.nombre.toLowerCase() ||
                        categoriasSeSuperponen(c, {
                            ...datos,
                            id: categoriaId ?? "nueva",
                        })),
            )
        ) {
            throw new ErrorReglaDeNegocio(
                "La categoría repite un nombre o se superpone con otro grupo de la edición.",
            );
        }
        const categoria = categoriaId
            ? await tx.categoriaGrandPrix.update({
                  where: { id: categoriaId },
                  data: datos,
              })
            : await tx.categoriaGrandPrix.create({
                  data: { ...datos, grandPrixId: id },
              });
        await auditar(
            tx,
            id,
            actor,
            "Categoria",
            "Configuración de categorías de la edición",
            anterior,
            categoria,
        );
        return { id: categoria.id };
    });
}

export async function eliminarCategoria(
    id: string,
    categoriaId: string,
    actor: Actor,
): Promise<void> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const categoria = gp.categorias.find((c) => c.id === categoriaId);
        if (!categoria) throw new ErrorNoEncontrado("Categoría no encontrada.");
        if (gp.estado !== "Borrador" || gp.participaciones.length)
            throw new ErrorReglaDeNegocio("Las categorías ya están en uso.");
        await tx.categoriaGrandPrix.delete({ where: { id: categoriaId } });
        await auditar(
            tx,
            id,
            actor,
            "CategoriaEliminada",
            "Se quitó una categoría del borrador",
            categoria,
            null,
        );
    });
}

export async function agregarPrueba(
    id: string,
    distanciaCarreraId: string,
    actor: Actor,
): Promise<RecursoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const dc = await tx.distanciaCarrera.findUnique({
            where: { id: distanciaCarreraId },
            include: { carrera: true, distancia: true },
        });
        if (!dc)
            throw new ErrorNoEncontrado("Distancia de carrera no encontrada.");
        if (!dentroPeriodo(dc.carrera.fechaHoraCarrera, gp))
            throw new ErrorReglaDeNegocio(
                "La carrera está fuera del período del Grand Prix.",
            );
        if (
            dc.distancia.tipoDistancia !== "Competitiva" ||
            dc.carrera.estado === "Cancelada"
        ) {
            throw new ErrorReglaDeNegocio(
                "Solo se incluyen distancias competitivas de carreras no canceladas.",
            );
        }
        if (gp.pruebas.some((p) => p.distanciaCarreraId === distanciaCarreraId))
            throw new ErrorReglaDeNegocio(
                "La prueba ya pertenece a esta edición.",
            );
        const prueba = await tx.grandPrixPrueba.create({
            data: { grandPrixId: id, distanciaCarreraId },
        });
        await tx.grandPrix.update({
            where: { id },
            data: { necesitaRecalculo: true },
        });
        await auditar(
            tx,
            id,
            actor,
            "PruebaAgregada",
            "Se agregó una modalidad al calendario",
            null,
            prueba,
        );
        return { id: prueba.id };
    });
}

export async function incluirPrueba(
    id: string,
    pruebaId: string,
    incluida: boolean,
    motivo: string,
    actor: Actor,
): Promise<void> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const prueba = gp.pruebas.find((p) => p.id === pruebaId);
        if (!prueba)
            throw new ErrorNoEncontrado(
                "Prueba no encontrada en esta edición.",
            );
        if (
            incluida &&
            !dentroPeriodo(prueba.distanciaCarrera.carrera.fechaHoraCarrera, gp)
        )
            throw new ErrorReglaDeNegocio("La prueba está fuera del período.");
        await tx.grandPrixPrueba.update({
            where: { id: pruebaId },
            data: { incluida },
        });
        await tx.grandPrix.update({
            where: { id },
            data: { necesitaRecalculo: true },
        });
        // Excluir nunca deja puntos visibles de una prueba retirada, aunque otra prueba esté pendiente de configurar.
        if (!incluida)
            await tx.puntajeGrandPrix.updateMany({
                where: { pruebaId },
                data: { vigente: false },
            });
        await auditar(
            tx,
            id,
            actor,
            "InclusionPrueba",
            motivo,
            { pruebaId, incluida: prueba.incluida },
            { pruebaId, incluida },
        );
    });
}

export async function buscarCorredores(
    busqueda: string,
): Promise<CorredorGrandPrixDTO[]> {
    if (busqueda.trim().length < 2) return [];
    const corredores = await prisma.corredor.findMany({
        where: {
            persona: {
                OR: [
                    { dni: { contains: busqueda } },
                    { nombre: { contains: busqueda } },
                    { apellido: { contains: busqueda } },
                ],
            },
        },
        include: corredorGrandPrixInclude,
        take: 30,
        orderBy: { persona: { apellido: "asc" } },
    });
    return corredores.map(toCorredorGrandPrixDTO);
}

export async function inscribir(
    id: string,
    corredorId: string,
    categoriaId: string,
    actor: Actor,
): Promise<RecursoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const corredor = await tx.corredor.findUnique({
            where: { id: corredorId },
            include: { afiliacion: true },
        });
        const categoria = gp.categorias.find((c) => c.id === categoriaId);
        if (!corredor || !categoria)
            throw new ErrorNoEncontrado(
                "Corredor o categoría no encontrados en esta edición.",
            );
        if (!cumpleCategoria(categoria, corredor, gp.fechaReferenciaEdad))
            throw new ErrorReglaDeNegocio(
                "El corredor no cumple las condiciones de la categoría seleccionada.",
            );
        if (gp.exigeAfiliacion && !corredor.afiliacion)
            throw new ErrorReglaDeNegocio("Esta edición requiere afiliación.");
        if (gp.participaciones.some((p) => p.corredorId === corredorId))
            throw new ErrorReglaDeNegocio(
                "El corredor ya está inscripto en esta edición.",
            );
        const participacion = await tx.participacionGrandPrix.create({
            data: {
                grandPrixId: id,
                corredorId,
                categoriaId,
                afiliacionVerificada: corredor.afiliacion !== null,
            },
        });
        await tx.grandPrix.update({
            where: { id },
            data: { necesitaRecalculo: true },
        });
        await auditar(
            tx,
            id,
            actor,
            "Inscripcion",
            "Inscripción de corredor al Grand Prix",
            null,
            participacion,
        );
        return { id: participacion.id };
    });
}

export async function cambiarParticipacion(
    id: string,
    participacionId: string,
    estado: EstadoParticipacionGrandPrix,
    motivo: string,
    actor: Actor,
): Promise<void> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const anterior = gp.participaciones.find(
            (p) => p.id === participacionId,
        );
        if (!anterior)
            throw new ErrorNoEncontrado("Participación no encontrada.");
        const verificada =
            anterior.afiliacionVerificada ||
            anterior.corredor.afiliacion !== null;
        if (estado === "Activa" && gp.exigeAfiliacion && !verificada)
            throw new ErrorReglaDeNegocio(
                "El corredor debe afiliarse antes de activar su participación.",
            );
        await tx.participacionGrandPrix.update({
            where: { id: participacionId },
            data: { estado, afiliacionVerificada: verificada },
        });
        await tx.grandPrix.update({
            where: { id },
            data: { necesitaRecalculo: true },
        });
        if (estado !== "Activa")
            await tx.puntajeGrandPrix.updateMany({
                where: { participacionId },
                data: { vigente: false },
            });
        await auditar(
            tx,
            id,
            actor,
            "EstadoParticipacion",
            motivo,
            { participacionId, estado: anterior.estado },
            { participacionId, estado },
        );
        if (gp.estado === "Activo")
            await recalcularTx(tx, await obtenerGP(tx, id), actor, motivo);
    });
}

export async function crearReglamento(
    id: string,
    basePuesto: BasePuestoGrandPrix,
    copiarDeId: string | undefined,
    actor: Actor,
): Promise<RecursoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const origen = copiarDeId
            ? gp.reglamentos.find((r) => r.id === copiarDeId)
            : null;
        if (copiarDeId && !origen)
            throw new ErrorNoEncontrado("Reglamento de origen no encontrado.");
        const version =
            Math.max(0, ...gp.reglamentos.map((r) => r.version)) + 1;
        const reglamento = await tx.reglamentoGrandPrix.create({
            data: {
                grandPrixId: id,
                version,
                basePuesto,
                reglas: {
                    create:
                        origen?.reglas.map((r) => ({
                            pruebaId: r.pruebaId,
                            puesto: r.puesto,
                            puntos: r.puntos,
                        })) ?? [],
                },
            },
        });
        await auditar(
            tx,
            id,
            actor,
            "ReglamentoCreado",
            `Borrador de reglamento v${version}`,
            null,
            { id: reglamento.id, copiarDeId },
        );
        return { id: reglamento.id };
    });
}

export async function guardarReglas(
    id: string,
    reglamentoId: string,
    datos: DatosReglasGP,
    actor: Actor,
): Promise<void> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const reglamento = gp.reglamentos.find((r) => r.id === reglamentoId);
        if (!reglamento)
            throw new ErrorNoEncontrado("Reglamento no encontrado.");
        if (reglamento.estado !== "Borrador")
            throw new ErrorReglaDeNegocio(
                "Las reglas publicadas son inmutables. Creá una nueva versión.",
            );
        if (
            datos.reglas.some(
                (r) => !gp.pruebas.some((p) => p.id === r.pruebaId),
            )
        )
            throw new ErrorReglaDeNegocio(
                "Las reglas deben referir a pruebas de esta edición.",
            );
        await tx.reglaPuntajeGrandPrix.deleteMany({ where: { reglamentoId } });
        await tx.reglamentoGrandPrix.update({
            where: { id: reglamentoId },
            data: { basePuesto: datos.basePuesto },
        });
        if (datos.reglas.length)
            await tx.reglaPuntajeGrandPrix.createMany({
                data: datos.reglas.map((r) => ({ ...r, reglamentoId })),
            });
        await auditar(
            tx,
            id,
            actor,
            "ReglasEditadas",
            `Configuración del borrador v${reglamento.version}`,
            { basePuesto: reglamento.basePuesto, reglas: reglamento.reglas },
            datos,
        );
    });
}

function prepararAplicacion(
    gp: GP,
    reglamentoId: string,
    datos: AplicacionReglamento,
) {
    const reglamento = gp.reglamentos.find((r) => r.id === reglamentoId);
    if (!reglamento)
        throw new ErrorNoEncontrado(
            "Reglamento no encontrado en esta edición.",
        );
    for (const pruebaId of datos.pruebaIds) {
        const prueba = gp.pruebas.find((p) => p.id === pruebaId);
        if (!prueba || !prueba.incluida)
            throw new ErrorReglaDeNegocio(
                "Seleccioná pruebas incluidas de esta edición.",
            );
        if (!reglamento.reglas.some((r) => r.pruebaId === pruebaId))
            throw new ErrorReglaDeNegocio(
                "Falta la escala de puntos de una prueba seleccionada.",
            );
        if (
            !datos.retroactivo &&
            (prueba.distanciaCarrera.carrera.estado === "Finalizada" ||
                prueba.distanciaCarrera.carrera.estado === "En_curso")
        ) {
            throw new ErrorReglaDeNegocio(
                "Para modificar una prueba iniciada o finalizada, habilitá la aplicación retroactiva.",
            );
        }
        prueba.reglamentoId = reglamentoId;
        prueba.reglamento = reglamento;
    }
    return reglamento;
}

export async function previsualizar(
    id: string,
    reglamentoId: string,
    datos: AplicacionReglamento,
): Promise<PrevisualizacionGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        prepararAplicacion(gp, reglamentoId, datos);
        const nuevos = await calcular(tx, gp);
        const anteriores = await tx.puntajeGrandPrix.findMany({
            where: { participacion: { grandPrixId: id }, vigente: true },
        });
        const totales = (
            items: { participacionId: string; puntos: number }[],
        ) => {
            const mapa = new Map<string, number>();
            for (const item of items)
                mapa.set(
                    item.participacionId,
                    (mapa.get(item.participacionId) ?? 0) + item.puntos,
                );
            return mapa;
        };
        const antes = totales(anteriores),
            despues = totales(nuevos);
        const cambios = gp.participaciones
            .map((p) => ({
                participacion: p,
                antes: antes.get(p.id) ?? 0,
                despues: despues.get(p.id) ?? 0,
            }))
            .filter((c) => c.antes !== c.despues);
        return toPrevisualizacionGrandPrixDTO(cambios, nuevos.length);
    });
}

export async function aplicarReglamento(
    id: string,
    reglamentoId: string,
    datos: AplicacionReglamento,
    actor: Actor,
): Promise<RecalculoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        const antes = gp.pruebas
            .filter((p) => datos.pruebaIds.includes(p.id))
            .map((p) => ({ pruebaId: p.id, reglamentoId: p.reglamentoId }));
        const reglamento = prepararAplicacion(gp, reglamentoId, datos);
        await tx.reglamentoGrandPrix.update({
            where: { id: reglamentoId },
            data: {
                estado: "Publicado",
                fechaPublicacion: reglamento.fechaPublicacion ?? new Date(),
            },
        });
        await tx.grandPrixPrueba.updateMany({
            where: { id: { in: datos.pruebaIds }, grandPrixId: id },
            data: { reglamentoId },
        });
        await auditar(
            tx,
            id,
            actor,
            "ReglamentoAplicado",
            datos.motivo,
            antes,
            {
                reglamentoId,
                pruebaIds: datos.pruebaIds,
                retroactivo: datos.retroactivo,
            },
        );
        // Todas las pruebas disputadas se reemplazan juntas: no quedan totales parcialmente actualizados.
        return recalcularTx(tx, await obtenerGP(tx, id), actor, datos.motivo);
    });
}

export async function recalcular(
    id: string,
    motivo: string,
    actor: Actor,
): Promise<RecalculoGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        editable(gp);
        return recalcularTx(tx, gp, actor, motivo);
    });
}

export async function tabla(
    id: string,
    filtros: FiltrosTablaGP,
): Promise<TablaGrandPrixDTO> {
    return transaccion(async (tx) => {
        const gp = await obtenerGP(tx, id);
        const aportes = await tx.puntajeGrandPrix.findMany({
            where: {
                vigente: true,
                participacion: { grandPrixId: id, estado: "Activa" },
                prueba: { incluida: true },
            },
        });
        const pruebas = new Map(gp.pruebas.map((p) => [p.id, p]));
        const porParticipacion = new Map<string, typeof aportes>();
        for (const aporte of aportes) {
            const grupo = porParticipacion.get(aporte.participacionId) ?? [];
            grupo.push(aporte);
            porParticipacion.set(aporte.participacionId, grupo);
        }
        const nombresCategorias = new Map(
            gp.categorias.map((c) => [c.id, c.nombre]),
        );
        const eventos = new Set(
            gp.pruebas
                .filter((p) => p.incluida)
                .map((p) => p.distanciaCarrera.idCarrera),
        ).size;
        const finalizados = new Set(
            gp.pruebas
                .filter(
                    (p) =>
                        p.incluida &&
                        p.distanciaCarrera.carrera.estado === "Finalizada",
                )
                .map((p) => p.distanciaCarrera.idCarrera),
        ).size;
        const filas = gp.participaciones
            .filter((p) => p.estado === "Activa")
            .map((p) => {
                const propios = porParticipacion.get(p.id) ?? [];
                const visibles = propios.filter(
                    (a) =>
                        filtros.kilometraje === undefined ||
                        pruebas.get(a.pruebaId)?.distanciaCarrera.distancia
                            .kilometraje === filtros.kilometraje,
                );
                const carrerasCompletadas = new Set(
                    propios.map(
                        (a) =>
                            pruebas.get(a.pruebaId)?.distanciaCarrera.idCarrera,
                    ),
                ).size;
                return toFilaTablaGrandPrixDTO(p, {
                    categoria: nombresCategorias.get(p.categoriaId) ?? "",
                    puntos: visibles.reduce((total, a) => total + a.puntos, 0),
                    carrerasCompletadas,
                    elegible:
                        carrerasCompletadas >=
                            gp.minimoParticipacionesCorredor &&
                        (!gp.exigeAfiliacion || p.afiliacionVerificada),
                    detalles: visibles.map((a) =>
                        toDetallePuntajeGrandPrixDTO(
                            a,
                            pruebas.get(a.pruebaId)!,
                        ),
                    ),
                });
            });
        const calificables =
            gp.estado === "Cerrado" ? filas.filter((f) => f.elegible) : filas;
        const posiciones = new Map<string, number>();
        for (const categoria of gp.categorias) {
            for (const fila of asignarPosiciones(
                calificables.filter((f) => f.categoriaId === categoria.id),
            ))
                posiciones.set(fila.id, fila.puesto);
        }
        const clasificadas = asignarPosiciones(calificables);
        const clasificadasIds = new Set(clasificadas.map((f) => f.id));
        const ordenadas = [
            ...clasificadas,
            ...filas
                .filter((f) => !clasificadasIds.has(f.id))
                .map((f) => ({ ...f, puesto: null })),
        ];
        const busqueda = filtros.busqueda?.toLocaleLowerCase("es") ?? "";
        return toTablaGrandPrixDTO(gp, {
            carreras: eventos,
            carrerasFinalizadas: finalizados,
            calendarioCumplido: finalizados >= gp.minimoCarrerasCalendario,
            provisional: gp.estado !== "Cerrado" || gp.necesitaRecalculo,
            filas: ordenadas
                .map((f) => ({
                    ...f,
                    puestoCategoria: posiciones.get(f.id) ?? null,
                }))
                .filter(
                    (f) =>
                        (!filtros.categoriaId ||
                            f.categoriaId === filtros.categoriaId) &&
                        (!filtros.sexo || f.sexo === filtros.sexo) &&
                        (!busqueda ||
                            `${f.nombre} ${f.dni}`
                                .toLocaleLowerCase("es")
                                .includes(busqueda)),
                ),
        });
    });
}

// Un cambio posterior al cierre no reescribe una tabla oficial silenciosamente.
export async function actualizarPorCarrera(carreraId: string): Promise<void> {
    const ediciones = await prisma.grandPrix.findMany({
        where: {
            pruebas: {
                some: {
                    incluida: true,
                    distanciaCarrera: { idCarrera: carreraId },
                },
            },
            estado: { not: "Cancelado" },
        },
        select: { id: true, estado: true },
    });
    for (const gp of ediciones) {
        await prisma.grandPrix.update({
            where: { id: gp.id },
            data: { necesitaRecalculo: true },
        });
        if (gp.estado !== "Cerrado") {
            try {
                await recalcular(
                    gp.id,
                    "Actualización de resultados de carrera",
                    null,
                );
            } catch (error) {
                console.error(
                    `Grand Prix ${gp.id} pendiente de recálculo:`,
                    error,
                );
            }
        }
    }
}
