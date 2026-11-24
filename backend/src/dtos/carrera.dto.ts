//backend/src/dtos/carrera.dto.ts
import { EstadoCarrera, TipoDistancia } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";

export function toCarreraDto(carrera: CarreraPrisma): CarreraDTO {
    return {
        id: carrera.id,
        estado: carrera.estado,
        nombre: carrera.nombre,
        fechaHoraCarrera: carrera.fechaHoraCarrera,
        fechaHoraEntregaKits: carrera.fechaHoraEntregaKits,
        imagenUrl: carrera.imagenUrl,
        descripcion: carrera.descripcion,
        participantesMax: carrera.participantesMax,
        lugar: {
            nombre: carrera.lugar.nombre,
            localidad: carrera.lugar.localidad.nombre
        },
        distancias: carrera.distanciaCarrera.map(dc => ({
            kilometraje: dc.distancia.kilometraje,
            tipoDistancia: dc.distancia.tipoDistancia,
            precio: dc.precioDistancia
        })),
        fechaHoraModificacion: carrera.fechaHoraModificacion,
        fechaHoraInicio: carrera.ejecucion?.fechaHoraInicio ?? null,
        fechaHoraFin: carrera.ejecucion?.fechaHoraFin ?? null,
    }
}


export const carreraInclude = {
    lugar: { include: { localidad: true } },
    distanciaCarrera: { include: { distancia: true } },
    ejecucion: true,
} satisfies Prisma.CarreraInclude;

type CarreraPrisma = Prisma.CarreraGetPayload<{ include: typeof carreraInclude }>;


export type CarreraDTO = {
    id: string;
    estado: EstadoCarrera;
    nombre: string;
    fechaHoraCarrera: Date;
    fechaHoraEntregaKits: Date;
    imagenUrl: string;
    descripcion: string;
    participantesMax: number;
    lugar: LugarDTO;

    distancias: DistanciaDTO[]
    fechaHoraModificacion: Date; // Auditoría: no usar como hora de fin
    fechaHoraInicio: Date | null; // Hora real de largada (null si todavía no largó)
    fechaHoraFin: Date | null;    // Hora real en que se finalizó
}

export type DistanciaDTO = {
    kilometraje: number;
    tipoDistancia: TipoDistancia;
    precio: number;
}

export type LugarDTO = {
    nombre: string;
    localidad: string;
}