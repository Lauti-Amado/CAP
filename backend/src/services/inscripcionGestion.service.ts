//backend/src/services/inscripcionGestion.service.ts
import { prisma } from "../config/prisma";
import type { EstadoCarrera, Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import {
    toInscripcionDetalleDto,
    toInscripcionListadoDto,
    toOpcionesInscripcionDto,
    type ContactoEmergenciaDTO,
    type InscripcionDetalleDTO,
    type InscripcionListadoDTO,
    type OpcionesInscripcionDTO,
} from "../dtos/inscripcionGestion.dto";
import { toPaginaDto, type PaginaDTO } from "../dtos/pagina.dto";
import type { ListadoInscripciones } from "../validations/inscripcionGestion.validations";

// Etapas de la carrera en las que se aceptan inscripciones presenciales
const ESTADOS_INSCRIPCION: readonly EstadoCarrera[] = ["Activa", "Entrega_kits"];

const listadoInclude = {
    corredor: { include: { persona: true } },
    distanciaCarrera: { include: { distancia: true, carrera: true } },
    compra: true,
    entregaKit: true,
} satisfies Prisma.InscripcionInclude;

const detalleInclude = {
    compra: { include: { detallesProductos: { include: { producto: { include: { producto: true } } } } } },
    corredor: {
        include: {
            persona: { include: { usuario: { select: { email: true } } } },
            contactoEmergencia: true,
            aptosMedicos: true,
        },
    },
    distanciaCarrera: { include: { distancia: true, carrera: true } },
    equipo: true,
    entregaKit: { include: { dorsal: { include: { chip: true } } } },
} satisfies Prisma.InscripcionInclude;

// Las inscripciones anuladas liberan su lugar
export const ocupanCupo = (carreraId: string) => ({
    estado: { not: "Anulada" },
    distanciaCarrera: { idCarrera: carreraId },
}) satisfies Prisma.InscripcionWhereInput;

export async function listar(f: ListadoInscripciones): Promise<PaginaDTO<InscripcionListadoDTO>> {
    const distancia: Prisma.DistanciaWhereInput = {
        ...(f.kilometraje !== undefined ? { kilometraje: f.kilometraje } : {}),
        ...(f.tipoDistancia ? { tipoDistancia: f.tipoDistancia } : {}),
    };
    const filtraDistancia = Object.keys(distancia).length > 0;

    const where: Prisma.InscripcionWhereInput = {
        // Las anuladas (baja lógica) solo se ven si se filtra por ese estado
        estado: f.estado ?? { not: "Anulada" },
        ...(f.pagado !== undefined ? { compra: { isPagado: f.pagado } } : {}),
        ...(f.dni ? { corredor: { persona: { dni: { contains: f.dni } } } } : {}),
        ...(f.anio !== undefined
            ? {
                  fechaHoraCreacion: {
                      gte: new Date(Date.UTC(f.anio, 0, 1)),
                      lt: new Date(Date.UTC(f.anio + 1, 0, 1)),
                  },
              }
            : {}),
        ...(f.carreraId || filtraDistancia
            ? {
                  distanciaCarrera: {
                      ...(f.carreraId ? { idCarrera: f.carreraId } : {}),
                      ...(filtraDistancia ? { distancia } : {}),
                  },
              }
            : {}),
    };

    const [total, inscripciones] = await prisma.$transaction([
        prisma.inscripcion.count({ where }),
        prisma.inscripcion.findMany({
            where,
            include: listadoInclude,
            orderBy: { fechaHoraCreacion: "desc" },
            skip: (f.pagina - 1) * f.limite,
            take: f.limite,
        }),
    ]);

    return toPaginaDto(inscripciones.map(toInscripcionListadoDto), total, f.pagina, f.limite);
}

export async function obtener(id: string): Promise<InscripcionDetalleDTO> {
    const inscripcion = await prisma.inscripcion.findUnique({ where: { id }, include: detalleInclude });
    if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
    return toInscripcionDetalleDto(inscripcion);
}

// Distancias con precio, productos y cupo para armar el formulario de nueva inscripción
export async function opciones(carreraId: string): Promise<OpcionesInscripcionDTO> {
    const carrera = await prisma.carrera.findUnique({
        where: { id: carreraId },
        include: { distanciaCarrera: { include: { distancia: true } } },
    });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const [ocupados, productos] = await Promise.all([
        prisma.inscripcion.count({ where: ocupanCupo(carreraId) }),
        prisma.producto.findMany({ include: { variantes: true }, orderBy: { nombreProducto: "asc" } }),
    ]);

    return toOpcionesInscripcionDto(carrera, productos, ocupados, ESTADOS_INSCRIPCION.includes(carrera.estado));
}

// Un contacto de emergencia es una persona: se busca por DNI
export async function buscarContactoEmergencia(dni: string): Promise<ContactoEmergenciaDTO> {
    const persona = await prisma.persona.findUnique({ where: { dni } });
    if (!persona) throw new ErrorNoEncontrado("No existe una persona registrada con ese DNI.");

    return { dni: persona.dni, nombre: persona.nombre, apellido: persona.apellido, telefono: persona.telefono };
}