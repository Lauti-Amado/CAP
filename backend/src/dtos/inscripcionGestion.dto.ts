//backend/src/dtos/inscripcionGestion.dto.ts
import type {
    Discapacidad,
    EstadoCarrera,
    EstadoInscripcion,
    MetodoPago,
    Prisma,
    Sexo,
    TipoDistancia,
} from "../generated/prisma/client";
import { requiereAptoMedico, vencimientoVigente } from "../rules/aptoMedico.rules";
import { toEntregaKitDto, type EntregaKitDTO } from "./dorsal.dto";

// ---------- DTOs ----------

export type PersonaDTO = {
    dni: string;
    nombre: string;
    apellido: string;
    telefono: string;
};

// Un contacto de emergencia es una persona: no tiene tabla propia
export type ContactoEmergenciaDTO = PersonaDTO;

export type AptoMedicoDTO = {
    requerido: boolean;
    vigente: boolean;
    fechaVencimiento: Date | null;
};

// Fila del listado
export type InscripcionListadoDTO = {
    id: string;
    estado: EstadoInscripcion;
    fechaHoraCreacion: Date;
    corredor: { nombre: string; apellido: string; dni: string };
    carrera: { id: string; nombre: string };
    distancia: { kilometraje: number; tipoDistancia: TipoDistancia };
    pago: { pagado: boolean; metodo: MetodoPago };
    kitEntregado: boolean;
};

export type InscripcionDetalleDTO = {
    id: string;
    estado: EstadoInscripcion;
    fechaHoraCreacion: Date;
    carrera: { id: string; nombre: string; estado: EstadoCarrera; fechaHoraCarrera: Date };
    distancia: { kilometraje: number; tipoDistancia: TipoDistancia; precio: number };
    corredor: PersonaDTO & {
        sexo: Sexo;
        fechaNacimiento: Date;
        discapacidad: Discapacidad | null;
        equipo: string | null;
        email: string | null; // solo si la persona tiene cuenta en el sistema web
        contactoEmergencia: ContactoEmergenciaDTO;
    };
    pago: {
        pagado: boolean;
        metodo: MetodoPago;
        total: number;
        productos: { nombre: string; variante: string; cantidad: number }[];
    };
    aptoMedico: AptoMedicoDTO;
    entrega: EntregaKitDTO | null; // el dorsal (con su chip), si el kit ya se entregó
};

// Datos para armar el formulario de nueva inscripción
export type OpcionesInscripcionDTO = {
    carrera: {
        id: string;
        nombre: string;
        estado: EstadoCarrera;
        fechaHoraCarrera: Date;
        admiteInscripciones: boolean;
    };
    cupo: { maximo: number; ocupados: number };
    distancias: { kilometraje: number; tipoDistancia: TipoDistancia; precio: number }[];
    productos: {
        id: string;
        nombre: string;
        variantes: { id: string; nombre: string; precio: number; stock: number }[];
    }[];
};

// ---------- Mappers ----------

type InscripcionListadoPrisma = Prisma.InscripcionGetPayload<{
    include: {
        corredor: { include: { persona: true } };
        distanciaCarrera: { include: { distancia: true; carrera: true } };
        compra: true;
        entregaKit: true;
    };
}>;

type InscripcionDetallePrisma = Prisma.InscripcionGetPayload<{
    include: {
        compra: { include: { detallesProductos: { include: { producto: { include: { producto: true } } } } } };
        corredor: {
            include: {
                persona: { include: { usuario: { select: { email: true } } } };
                contactoEmergencia: true;
                aptosMedicos: true;
            };
        };
        distanciaCarrera: { include: { distancia: true; carrera: true } };
        equipo: true;
        entregaKit: { include: { dorsal: { include: { chip: true } } } };
    };
}>;

type CarreraOpcionesPrisma = Prisma.CarreraGetPayload<{
    include: { distanciaCarrera: { include: { distancia: true } } };
}>;

type ProductoOpcionesPrisma = Prisma.ProductoGetPayload<{ include: { variantes: true } }>;

export function toInscripcionListadoDto(i: InscripcionListadoPrisma): InscripcionListadoDTO {
    const { persona } = i.corredor;
    const { carrera, distancia } = i.distanciaCarrera;

    return {
        id: i.id,
        estado: i.estado,
        fechaHoraCreacion: i.fechaHoraCreacion,
        corredor: { nombre: persona.nombre, apellido: persona.apellido, dni: persona.dni },
        carrera: { id: carrera.id, nombre: carrera.nombre },
        distancia: { kilometraje: distancia.kilometraje, tipoDistancia: distancia.tipoDistancia },
        pago: { pagado: i.compra.isPagado, metodo: i.compra.metodoPago },
        kitEntregado: i.entregaKit !== null,
    };
}

export function toInscripcionDetalleDto(i: InscripcionDetallePrisma): InscripcionDetalleDTO {
    const { corredor } = i;
    const { persona, contactoEmergencia } = corredor;
    const { carrera, distancia } = i.distanciaCarrera;

    const vencimiento = vencimientoVigente(corredor.aptosMedicos, carrera.fechaHoraCarrera);

    return {
        id: i.id,
        estado: i.estado,
        fechaHoraCreacion: i.fechaHoraCreacion,
        carrera: {
            id: carrera.id,
            nombre: carrera.nombre,
            estado: carrera.estado,
            fechaHoraCarrera: carrera.fechaHoraCarrera,
        },
        distancia: {
            kilometraje: distancia.kilometraje,
            tipoDistancia: distancia.tipoDistancia,
            precio: i.distanciaCarrera.precioDistancia,
        },
        corredor: {
            dni: persona.dni,
            nombre: persona.nombre,
            apellido: persona.apellido,
            telefono: persona.telefono,
            sexo: corredor.sexo,
            fechaNacimiento: corredor.fechaNacimiento,
            discapacidad: corredor.discapacidad,
            equipo: i.equipo?.nombre ?? null,
            email: persona.usuario?.email ?? null,
            contactoEmergencia: {
                dni: contactoEmergencia.dni,
                nombre: contactoEmergencia.nombre,
                apellido: contactoEmergencia.apellido,
                telefono: contactoEmergencia.telefono,
            },
        },
        pago: {
            pagado: i.compra.isPagado,
            metodo: i.compra.metodoPago,
            total: i.compra.montoTotal,
            productos: i.compra.detallesProductos.map((d) => ({
                nombre: d.producto.producto.nombreProducto,
                variante: d.producto.nombreVariante,
                cantidad: d.cantidad,
            })),
        },
        aptoMedico: {
            requerido: requiereAptoMedico(distancia.kilometraje, distancia.tipoDistancia),
            vigente: vencimiento !== null,
            fechaVencimiento: vencimiento,
        },
        entrega: i.entregaKit ? toEntregaKitDto(i.entregaKit) : null,
    };
}

export function toOpcionesInscripcionDto(
    carrera: CarreraOpcionesPrisma,
    productos: ProductoOpcionesPrisma[],
    ocupados: number,
    admiteInscripciones: boolean
): OpcionesInscripcionDTO {
    return {
        carrera: {
            id: carrera.id,
            nombre: carrera.nombre,
            estado: carrera.estado,
            fechaHoraCarrera: carrera.fechaHoraCarrera,
            admiteInscripciones,
        },
        cupo: { maximo: carrera.participantesMax, ocupados },
        distancias: carrera.distanciaCarrera
            .map((dc) => ({
                kilometraje: dc.distancia.kilometraje,
                tipoDistancia: dc.distancia.tipoDistancia,
                precio: dc.precioDistancia,
            }))
            .sort((a, b) => a.kilometraje - b.kilometraje || a.tipoDistancia.localeCompare(b.tipoDistancia)),
        productos: productos.map((p) => ({
            id: p.id,
            nombre: p.nombreProducto,
            variantes: p.variantes.map((v) => ({
                id: v.id,
                nombre: v.nombreVariante,
                precio: v.precio,
                stock: v.stock,
            })),
        })),
    };
}