//backend/src/services/clasificacion.service.ts

//NO importa otros services ni sabe de dónde viene un resultado: lo carga una
// persona (manual) hoy y podrá hacerlo la captura RFID, llamando a las mismas funciones.
import { prisma } from "../config/prisma";
import { EstadoClasificacion, Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { clasificacionInclude, toClasificacionDto, type ClasificacionDTO, type ClasificacionTiempoRealDTO} from "../dtos/clasificacion.dto";
import type { FiltrosClasificacion, RegistrarResultado } from "../validations/clasificacion.validations";
import * as reglas from "./clasificacion.reglas";

const deCarrera = (carreraId: string) =>
    ({ inscripcion: { distanciaCarrera: { idCarrera: carreraId } } }) satisfies Prisma.ClasificacionWhereInput;

async function obtenerCarrera(carreraId: string) {
    const carrera = await prisma.carrera.findUnique({
        where: { id: carreraId },
        select: { id: true, estado: true, fechaHoraCarrera: true },
    });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");
    return carrera;
}

// Devuelve la carrera, asegurándose de que sus corredores tengan una clasificación "Pendiente"
// si la carrera ya largó (a partir de ahí no se entregan más kits, así que el listado es estable).
async function carreraConClasificaciones(carreraId: string) {
    const carrera = await obtenerCarrera(carreraId);
    if (reglas.carreraAdmiteClasificacion(carrera.estado)) await sincronizarPendientes(carrera.id);
    return carrera;
}

function condicionBusqueda(busqueda: string): Prisma.ClasificacionWhereInput {
    return {
        OR: [
            { inscripcion: { corredor: { persona: { dni: { contains: busqueda } } } } },
            { inscripcion: { corredor: { persona: { nombre: { contains: busqueda } } } } },
            { inscripcion: { corredor: { persona: { apellido: { contains: busqueda } } } } },
            { inscripcion: { entregaKit: { dorsal: { numero: { contains: busqueda } } } } },
        ],
    };
}

// Crea la clasificación "Pendiente" de cada inscripción confirmada (con kit entregado) que todavía no la tenga.
// Es idempotente: se puede llamar cuantas veces haga falta. Devuelve cuántas creó.
export async function sincronizarPendientes(carreraId: string): Promise<number> {
    const faltantes = await prisma.inscripcion.findMany({
        where: {
            estado: "Confirmada",
            entregaKit: { isNot: null },
            distanciaCarrera: { idCarrera: carreraId },
            clasificacion: { is: null },
        },
        select: { id: true },
    });
    if (faltantes.length === 0) return 0;

    try {
        const { count } = await prisma.clasificacion.createMany({
            data: faltantes.map((inscripcion) => ({ inscripcionId: inscripcion.id })),
        });
        return count;
    } catch (error) {
        // Otra request ya las creó en simultáneo
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return 0;
        throw error;
    }
}

// Todas las clasificaciones de una carrera (con o sin resultado), con filtros opcionales
export async function listarPorCarrera(carreraId: string, filtros: FiltrosClasificacion): Promise<ClasificacionDTO[]> {
    await carreraConClasificaciones(carreraId);

    const clasificaciones = await prisma.clasificacion.findMany({
        where: {
            ...deCarrera(carreraId),
            ...(filtros.estado ? { estado: filtros.estado } : {}),
            ...(filtros.busqueda ? condicionBusqueda(filtros.busqueda) : {}),
        },
        include: clasificacionInclude,
    });

    return clasificaciones.map(toClasificacionDto).sort(reglas.compararPorPuesto);
}

// Datos de la vista de clasificación en tiempo real: resumen + últimas llegadas
export async function obtenerTiempoReal(carreraId: string, limite: number): Promise<ClasificacionTiempoRealDTO> {
    const carrera = await carreraConClasificaciones(carreraId);

    const [grupos, llegadas] = await Promise.all([
        prisma.clasificacion.groupBy({
            by: ["estado"],
            where: deCarrera(carreraId),
            _count: { _all: true },
        }),
        prisma.clasificacion.findMany({
            where: { ...deCarrera(carreraId), resultado: { isNot: null } },
            orderBy: { resultado: { fechaHoraCreacion: "desc" } },
            take: limite,
            include: clasificacionInclude,
        }),
    ]);

    const conteos = Object.fromEntries(
        Object.values(EstadoClasificacion).map((estado) => [estado, 0])
    ) as Record<EstadoClasificacion, number>;
    for (const grupo of grupos) conteos[grupo.estado] = grupo._count._all;

    return {
        carrera: { id: carrera.id, estado: carrera.estado, fechaHoraCarrera: carrera.fechaHoraCarrera },
        resumen: reglas.resumirConteos(conteos),
        llegadas: llegadas.map(toClasificacionDto),
    };
}

export async function obtenerPorId(id: string): Promise<ClasificacionDTO> {
    const clasificacion = await prisma.clasificacion.findUnique({
        where: { id },
        include: clasificacionInclude,
    });
    if (!clasificacion) throw new ErrorNoEncontrado("Clasificación no encontrada.");
    return toClasificacionDto(clasificacion);
}

// Cambio manual de estado (por ejemplo, descalificar a un corredor)
export async function cambiarEstado(id: string, nuevoEstado: EstadoClasificacion): Promise<ClasificacionDTO> {
    return prisma.$transaction(async (tx) => {
        const clasificacion = await tx.clasificacion.findUnique({
            where: { id },
            include: {
                resultado: { select: { id: true } },
                inscripcion: { select: { distanciaCarrera: { select: { carrera: { select: { estado: true } } } } } },
            },
        });
        if (!clasificacion) throw new ErrorNoEncontrado("Clasificación no encontrada.");

        const estadoCarrera = clasificacion.inscripcion.distanciaCarrera.carrera.estado;
        if (!reglas.carreraAdmiteClasificacion(estadoCarrera)) {
            throw new ErrorReglaDeNegocio("La carrera no está en curso ni finalizada.");
        }

        if (clasificacion.estado !== nuevoEstado) {
            const cambio = reglas.evaluarCambioEstado(clasificacion.estado, nuevoEstado, clasificacion.resultado !== null);
            if (!cambio.permitido) throw new ErrorReglaDeNegocio(cambio.motivo);

            await tx.clasificacion.update({ where: { id }, data: { estado: nuevoEstado } });
        }

        const actualizada = await tx.clasificacion.findUniqueOrThrow({ where: { id }, include: clasificacionInclude });
        return toClasificacionDto(actualizada);
    });
}

// Registra (o corrige) el resultado de un corredor. Deja la clasificación en "Finalizo".
// `ahora` se recibe como parámetro para no depender del reloj dentro de la lógica.
export async function registrarResultado(
    id: string,
    datos: RegistrarResultado,
    ahora: Date = new Date()
): Promise<ClasificacionDTO> {
    return prisma.$transaction(async (tx) => {
        const clasificacion = await tx.clasificacion.findUnique({
            where: { id },
            include: {
                resultado: true,
                inscripcion: {
                    select: {
                        estado: true,
                        entregaKit: { select: { id: true } },
                        distanciaCarrera: { select: { carrera: { select: { id: true, estado: true, fechaHoraCarrera: true } } } },
                    },
                },
            },
        });
        if (!clasificacion) throw new ErrorNoEncontrado("Clasificación no encontrada.");

        const { inscripcion } = clasificacion;
        const carrera = inscripcion.distanciaCarrera.carrera;

        if (!reglas.carreraAdmiteClasificacion(carrera.estado)) {
            throw new ErrorReglaDeNegocio("La carrera no está en curso ni finalizada.");
        }
        if (!reglas.inscripcionHabilitada({ estado: inscripcion.estado, tieneEntregaKit: inscripcion.entregaKit !== null })) {
            throw new ErrorReglaDeNegocio("El corredor no está habilitado para clasificar (kit no entregado o inscripción anulada).");
        }
        if (clasificacion.estado === "Descalificado") {
            throw new ErrorReglaDeNegocio("El corredor está descalificado: no se le puede registrar un resultado.");
        }

        // Tiempo: el informado, el que ya tenía, o el que transcurrió desde la largada
        let tiempoLlegada = datos.tiempoLlegada ?? clasificacion.resultado?.tiempoLlegada;
        if (tiempoLlegada === undefined) {
            if (carrera.estado !== "En_curso") {
                throw new ErrorReglaDeNegocio("La carrera ya finalizó: informá el tiempo de llegada.");
            }
            tiempoLlegada = reglas.calcularTiempoDesdeLargada(ahora, carrera.fechaHoraCarrera);
            if (tiempoLlegada <= 0) {
                throw new ErrorReglaDeNegocio("No se pudo calcular el tiempo: la carrera todavía no largó. Informá el tiempo de llegada.");
            }
        }

        const totalParticipantes = await tx.clasificacion.count({ where: deCarrera(carrera.id) });
        if (!reglas.puestoEnRango(datos.puestoGeneral, totalParticipantes)) {
            throw new ErrorReglaDeNegocio(`El puesto debe estar entre 1 y ${totalParticipantes}.`);
        }

        // Puesto y tiempo únicos dentro de la carrera
        const otrosResultados = {
            clasificacionId: { not: id },
            clasificacion: deCarrera(carrera.id),
        } satisfies Prisma.ResultadoWhereInput;

        const puestoTomado = await tx.resultado.findFirst({
            where: { ...otrosResultados, puestoGeneral: datos.puestoGeneral },
            select: { id: true },
        });
        if (puestoTomado) throw new ErrorReglaDeNegocio(`El puesto ${datos.puestoGeneral} ya fue asignado a otro corredor.`);

        const tiempoTomado = await tx.resultado.findFirst({
            where: { ...otrosResultados, tiempoLlegada },
            select: { id: true },
        });
        if (tiempoTomado) throw new ErrorReglaDeNegocio("Ese tiempo ya fue asignado a otro corredor.");

        const estadoResultado = datos.estado ?? clasificacion.resultado?.estado ?? "Oficial";

        await tx.resultado.upsert({
            where: { clasificacionId: id },
            create: { clasificacionId: id, tiempoLlegada, puestoGeneral: datos.puestoGeneral, estado: estadoResultado },
            update: { tiempoLlegada, puestoGeneral: datos.puestoGeneral, estado: estadoResultado },
        });
        await tx.clasificacion.update({ where: { id }, data: { estado: "Finalizo" } });

        const actualizada = await tx.clasificacion.findUniqueOrThrow({ where: { id }, include: clasificacionInclude });
        return toClasificacionDto(actualizada);
    });
}
