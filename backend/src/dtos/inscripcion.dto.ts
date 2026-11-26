import { Prisma } from "../generated/prisma/client";
import { EstadoInscripcion, Sexo, Discapacidad, TipoDistancia, MetodoPago } from "../generated/prisma/client";

export function toInscripcionDto(inscripcion: InscripcionPrisma): InscripcionDTO {
    return {
        id: inscripcion.id,
        estado: inscripcion.estado,
        corredorInscripto: {
            id: inscripcion.corredor.id,
            nombre: inscripcion.corredor.persona.nombre,
            apellido: inscripcion.corredor.persona.apellido,
            telefono: inscripcion.corredor.persona.telefono,
            dni: inscripcion.corredor.persona.dni,
            fechaNacimiento: inscripcion.corredor.fechaNacimiento,
            sexo: inscripcion.corredor.sexo,
            discapacidad: inscripcion.corredor.discapacidad,
            aptosMedicos: inscripcion.corredor.aptosMedicos
        },
        carreraInscripta: {
            id: inscripcion.distanciaCarrera.carrera.id,
            nombre: inscripcion.distanciaCarrera.carrera.nombre,
            fechaHoraCarrera: inscripcion.distanciaCarrera.carrera.fechaHoraCarrera
        },
        distanciaInscripta: {
            kilometraje: inscripcion.distanciaCarrera.distancia.kilometraje,
            tipoDistancia: inscripcion.distanciaCarrera.distancia.tipoDistancia
        },
        equipoInscripto: inscripcion.equipo ? {
            nombre: inscripcion.equipo.nombre,
            codigoEquipo: inscripcion.equipo.codigoEquipo
        } : null,
        compra: {
            id: inscripcion.detalleCompra.compra.id,
            metodoPago: inscripcion.detalleCompra.compra.metodoPago,
            comprobante: inscripcion.detalleCompra.compra.comprobante ? {
                montoTotalPago: inscripcion.detalleCompra.compra.comprobante.montoTotalPago,
                fechaHoraPago: inscripcion.detalleCompra.compra.comprobante.fechaHoraPago,
                nombreApellidoTitularPago: inscripcion.detalleCompra.compra.comprobante.nombreApellidoTitularPago,
                documentoTitularPago: inscripcion.detalleCompra.compra.comprobante.documentoTitularPago,
                codigoComprobante: inscripcion.detalleCompra.compra.comprobante.codigoComprobante ?? null,
                entidadEmisora: inscripcion.detalleCompra.compra.comprobante.entidadEmisora ? inscripcion.detalleCompra.compra.comprobante.entidadEmisora.nombre : null
            } : null,
            productosComprados: inscripcion.detalleCompra.compra.detallesCompra.filter(d => d.detalleProducto).length > 0
                ? inscripcion.detalleCompra.compra.detallesCompra
                    .filter(d => d.detalleProducto)
                    .map(d => ({
                        nombre: d.detalleProducto!.producto.nombreProducto,
                        variante: d.detalleProducto!.nombreVariante,
                        cantidadComprada: d.cantidad
                    }))
                : null
        }
    };
}


export type InscripcionPrisma = Prisma.InscripcionGetPayload<{
    include: {
        corredor: { include: { persona: true, aptosMedicos: true } },
        distanciaCarrera: { include: { distancia: true, carrera: true } },
        equipo: true,
        detalleCompra: { include: { compra: { include: { 
            comprobante: { include: { entidadEmisora: true } }, 
            detallesCompra: { include: { detalleProducto: { include: { producto: true } } } }
            }
        }}}
    }
}>;


export type InscripcionDTO = {
    id: string;
    estado: EstadoInscripcion;
    corredorInscripto: CorredorInscriptoDTO;
    carreraInscripta: CarreraInscriptaDTO;
    distanciaInscripta: DistanciaInscriptaDTO;
    equipoInscripto?: EquipoDTO | null;
    compra: CompraDTO;
}

export type CorredorInscriptoDTO = {
    id: string
    nombre: string;
    apellido: string;
    telefono: string;
    dni: string;
    fechaNacimiento: Date;
    sexo: Sexo;
    discapacidad?: Discapacidad | null;
    aptosMedicos?: AptoMedicoDTO[] | null;
}

export type AptoMedicoDTO = {
    aprobado: boolean;
    fechaVencimiento: Date;
}

export type AfiliacionDTO = {
    numeroSocio: number;
}

export type CarreraInscriptaDTO = {
    id: string;
    nombre: string;
    fechaHoraCarrera: Date;
}

export type DistanciaInscriptaDTO = {
    kilometraje: number;
    tipoDistancia: TipoDistancia;
}

export type EquipoDTO = {
    nombre: string;
    codigoEquipo?: string | null;
}

export type CompraDTO = {
    id: string;
    metodoPago: MetodoPago;
    comprobante?: ComprobantePagoDTO | null;
    productosComprados?: ProductoDTO[] | null;
}

export type ComprobantePagoDTO = {
    montoTotalPago: number;
    fechaHoraPago: Date;
    nombreApellidoTitularPago: string;
    documentoTitularPago: string;

    //La entidad emisora puede ser null por si el pago es presencial
    codigoComprobante?: string | null;
    entidadEmisora?: string | null;
}

export type ProductoDTO = {
    nombre: string;
    variante: string;
    cantidadComprada: number;
}
