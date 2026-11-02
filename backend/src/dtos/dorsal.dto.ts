//backend/src/dtos/dorsal.dto.ts
import type { EntregaKit, Prisma, TipoDistancia } from "../generated/prisma/client";

// Un dorsal es un número físico que puede (o no) tener un chip RFID integrado
export type ChipDTO = {
    id: string;
    numero: number;
};

export type DorsalDTO = {
    id: string;
    numero: string;
    chip: ChipDTO | null;
};

export type EntregaDTO = {
    id: string;
    inscripcionId: string;
    fechaHoraEntrega: Date;
};

export type DorsalEnCarreraDTO = DorsalDTO & {
    entrega: EntregaDTO | null;
};

// La entrega de un kit con el dorsal (y su chip) que se entregó
export type EntregaKitDTO = EntregaDTO & {
    dorsal: DorsalDTO;
};

// Feed de entregas recientes
export type EntregaRecienteDTO = EntregaKitDTO & {
    corredor: { nombre: string; apellido: string };
    distancia: { kilometraje: number; tipoDistancia: TipoDistancia };
};


type DorsalPrisma = Prisma.DorsalGetPayload<{ include: { chip: true } }>;

type DorsalConEntregasPrisma = Prisma.DorsalGetPayload<{ include: { chip: true; entregas: true } }>;

type EntregaConDorsalPrisma = Prisma.EntregaKitGetPayload<{
    include: { dorsal: { include: { chip: true } } };
}>;

type EntregaRecientePrisma = Prisma.EntregaKitGetPayload<{
    include: {
        dorsal: { include: { chip: true } };
        inscripcion: {
            include: {
                corredor: { include: { persona: true } };
                distanciaCarrera: { include: { distancia: true } };
            };
        };
    };
}>;

export function toDorsalDto(dorsal: DorsalPrisma): DorsalDTO {
    return {
        id: dorsal.id,
        numero: dorsal.numero,
        chip: dorsal.chip ? { id: dorsal.chip.id, numero: dorsal.chip.numero } : null,
    };
}

export function toEntregaDto(entrega: EntregaKit): EntregaDTO {
    return {
        id: entrega.id,
        inscripcionId: entrega.inscripcionId,
        fechaHoraEntrega: entrega.fechaHoraEntrega,
    };
}

// `entregas` viene filtrada por carrera, así que hay a lo sumo una
export function toDorsalEnCarreraDto(dorsal: DorsalConEntregasPrisma): DorsalEnCarreraDTO {
    const [entrega] = dorsal.entregas;
    return { ...toDorsalDto(dorsal), entrega: entrega ? toEntregaDto(entrega) : null };
}

export function toEntregaKitDto(entrega: EntregaConDorsalPrisma): EntregaKitDTO {
    return { ...toEntregaDto(entrega), dorsal: toDorsalDto(entrega.dorsal) };
}

export function toEntregaRecienteDto(entrega: EntregaRecientePrisma): EntregaRecienteDTO {
    const { persona } = entrega.inscripcion.corredor;
    const { distancia } = entrega.inscripcion.distanciaCarrera;

    return {
        ...toEntregaKitDto(entrega),
        corredor: { nombre: persona.nombre, apellido: persona.apellido },
        distancia: { kilometraje: distancia.kilometraje, tipoDistancia: distancia.tipoDistancia },
    };
}