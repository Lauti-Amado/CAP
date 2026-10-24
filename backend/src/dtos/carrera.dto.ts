import { EstadoCarrera, TipoDistancia } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";

export type CarreraPayload = {
    carrera: {
        id: string;
        estado: EstadoCarrera;
        nombre: string;
        fechaHoraCarrera: Date;
        fechaHoraEntregaKits: Date;
        imagenUrl: string;
        descripcion: string;
        participantesMax: number;
        lugar: Lugar;

        distancias: Distancia[]
    }
}

export type Distancia = {
    kilometraje: number;
    tipoDistancia: TipoDistancia;
    precio: number;
}

export type Lugar = {
    nombre: string;
    localidad: string;
}


type CarreraPrisma = Prisma.CarreraGetPayload<{
  include: {
    lugar: { include: { localidad: true } },
    distanciaCarrera: { include: { distancia: true } }
  }
}>;

export function CarreraDTOMap(carrera: CarreraPrisma): CarreraPayload {
  return {
    carrera: {
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
}