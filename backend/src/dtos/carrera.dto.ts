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
        }))
    }
}


type CarreraPrisma = Prisma.CarreraGetPayload<{
    include: {
        lugar: { include: { localidad: true } },
        distanciaCarrera: { include: { distancia: true } }
    }
}>;


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