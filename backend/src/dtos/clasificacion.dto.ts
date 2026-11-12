//backend/src/dtos/clasificacion.dto.ts
import { Prisma } from "../generated/prisma/client";
import type { Discapacidad, EstadoCarrera, EstadoClasificacion, EstadoResultado, Sexo, TipoDistancia} from "../generated/prisma/client";

export const clasificacionInclude = {
    inscripcion: {
        include: {
            corredor: { include: { persona: true } },
            distanciaCarrera: { include: { distancia: true } },
            equipo: true,
            entregaKit: { include: { dorsal: true } },
        },
    },
    resultado: { include: { resultadosCategoria: { include: { categoria: true } } } },
} satisfies Prisma.ClasificacionInclude;

type ClasificacionPrisma = Prisma.ClasificacionGetPayload<{ include: typeof clasificacionInclude }>;

export function toClasificacionDto(c: ClasificacionPrisma): ClasificacionDTO {
    const { inscripcion, resultado } = c;
    const { corredor, distanciaCarrera, equipo, entregaKit } = inscripcion;

    return {
        id: c.id,
        estado: c.estado,
        inscripcionId: c.inscripcionId,
        corredor: {
            dni: corredor.persona.dni,
            nombre: corredor.persona.nombre,
            apellido: corredor.persona.apellido,
            sexo: corredor.sexo,
            discapacidad: corredor.discapacidad,
        },
        dorsal: entregaKit?.dorsal.numero ?? null,
        equipo: equipo?.nombre ?? null,
        distancia: {
            kilometraje: distanciaCarrera.distancia.kilometraje,
            tipoDistancia: distanciaCarrera.distancia.tipoDistancia,
        },
        resultado: resultado
            ? {
                id: resultado.id,
                tiempoLlegada: resultado.tiempoLlegada,
                puestoGeneral: resultado.puestoGeneral,
                estado: resultado.estado,
                categorias: resultado.resultadosCategoria.map((rc) => ({
                    categoriaId: rc.categoriaId,
                    nombre: rc.categoria.nombre,
                    puesto: rc.puesto,
                })),
                fechaHoraCreacion: resultado.fechaHoraCreacion,
                fechaHoraModificacion: resultado.fechaHoraModificacion,
            }
            : null,
    };
}


export type ClasificacionDTO = {
    id: string;
    estado: EstadoClasificacion;
    inscripcionId: string;
    corredor: CorredorClasificacionDTO;
    dorsal: string | null;
    equipo: string | null;
    distancia: DistanciaClasificacionDTO;
    resultado: ResultadoDTO | null; //null mientras el corredor no tenga resultado cargado
}

export type CorredorClasificacionDTO = {
    dni: string;
    nombre: string;
    apellido: string;
    sexo: Sexo;
    discapacidad: Discapacidad | null;
}

export type DistanciaClasificacionDTO = {
    kilometraje: number;
    tipoDistancia: TipoDistancia;
}

export type ResultadoDTO = {
    id: string;
    tiempoLlegada: number | null; //milisegundos, null si todavía no se cargó
    puestoGeneral: number;
    estado: EstadoResultado;
    categorias: ResultadoCategoriaDTO[];
    fechaHoraCreacion: Date;
    fechaHoraModificacion: Date;
}

export type ResultadoCategoriaDTO = {
    categoriaId: string;
    nombre: string;
    puesto: number;
}

export type ResumenClasificacionDTO = {
    participantes: number;
    llegados: number;
    pendientes: number;
    noFinalizaron: number;
    noLargaron: number;
    descalificados: number;
    progreso: number; //porcentaje de llegados sobre los que largaron (0-100)
}

export type ClasificacionTiempoRealDTO = {
    carrera: {
        id: string;
        estado: EstadoCarrera;
        fechaHoraCarrera: Date;
    };
    resumen: ResumenClasificacionDTO;
    llegadas: ClasificacionDTO[]; //las más recientes primero
}
