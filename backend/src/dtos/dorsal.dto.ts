//backend/src/dtos/dorsal.dto.ts
import type {
    EntregaKit,
    Prisma,
    TipoDistancia,
    EstadoInscripcion,
    Sexo,
} from "../generated/prisma/client";

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

export type CorredorEntregaKitDTO = {
    inscripcionId: string;
    corredor: {
        id: string;
        nombre: string;
        apellido: string;
        dni: string;
        fechaNacimiento: Date;
        sexo: Sexo;
    };
    distancia: {
        kilometraje: number;
        tipoDistancia: TipoDistancia;
    };
    talleRemera: string | null;
    equipo: {
        nombre: string;
        codigoEquipo: string | null;
    } | null;
    inscripcion: {
        estado: EstadoInscripcion;
        pagada: boolean;
    };
    aptoMedico: {
        aprobado: boolean;
        fechaVencimiento: Date;
    } | null;
    habilitadoParaRetirarKit: boolean;
    motivosNoHabilitado: string[];
    entregaKit: EntregaKitDTO | null;
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

type InscripcionParaBusquedaPrisma = Prisma.InscripcionGetPayload<{
    include: {
        compra: {
            include: {
                detallesProductos: {
                    include: {
                        producto: {
                            include: {
                                producto: true;
                            };
                        };
                    };
                };
            };
        };
        corredor: {
            include: {
                persona: true;
                aptosMedicos: true;
            };
        };
        distanciaCarrera: {
            include: {
                distancia: true;
                carrera: true;
            };
        };
        equipo: true;
        entregaKit: {
            include: {
                dorsal: {
                    include: {
                        chip: true;
                    };
                };
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

export function toCorredorEntregaKitDto(
    inscripcion: InscripcionParaBusquedaPrisma,
    vencimientoAptoVigente: Date | null,
    habilitadoParaRetirarKit: boolean,
    motivosNoHabilitado: string[]
): CorredorEntregaKitDTO {
    const detalleRemera = inscripcion.compra.detallesProductos.find(
        ({ producto }) =>
            /remera|camiseta/i.test(producto.producto.nombreProducto)
    );

    const persona = inscripcion.corredor.persona;

    return {
        inscripcionId: inscripcion.id,
        corredor: {
            id: inscripcion.corredor.id,
            nombre: persona.nombre,
            apellido: persona.apellido,
            dni: persona.dni,
            fechaNacimiento: inscripcion.corredor.fechaNacimiento,
            sexo: inscripcion.corredor.sexo,
        },
        distancia: {
            kilometraje: inscripcion.distanciaCarrera.distancia.kilometraje,
            tipoDistancia: inscripcion.distanciaCarrera.distancia.tipoDistancia,
        },
        talleRemera: detalleRemera?.producto.nombreVariante ?? null,
        equipo: inscripcion.equipo
            ? {
                nombre: inscripcion.equipo.nombre,
                codigoEquipo: inscripcion.equipo.codigoEquipo,
            }
            : null,
        inscripcion: {
            estado: inscripcion.estado,
            pagada: inscripcion.compra.isPagado,
        },
        aptoMedico: vencimientoAptoVigente
            ? {
                aprobado: true,
                fechaVencimiento: vencimientoAptoVigente,
            }
            : null,
        habilitadoParaRetirarKit,
        motivosNoHabilitado,
        entregaKit: inscripcion.entregaKit
            ? toEntregaKitDto(inscripcion.entregaKit)
            : null,
    };
}