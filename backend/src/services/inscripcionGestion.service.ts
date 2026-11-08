//backend/src/services/inscripcionGestion.service.ts
import { prisma } from "../config/prisma";
import type { EstadoCarrera, Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { toInscripcionDetalleDto, toInscripcionListadoDto, toOpcionesInscripcionDto, type ContactoEmergenciaDTO, type InscripcionDetalleDTO, type InscripcionListadoDTO, type OpcionesInscripcionDTO,} from "../dtos/inscripcionGestion.dto";
import { toPaginaDto, type PaginaDTO } from "../dtos/pagina.dto";
import type { CrearInscripcion, ListadoInscripciones } from "../validations/inscripcionGestion.validations";

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

// Alta presencial

type Tx = Prisma.TransactionClient;

// Si la persona ya es corredor se reutiliza tal cual: inscribirla no modifica sus datos.
// Si no, se crea (reusando la Persona si ya existía, por ejemplo como contacto de otro corredor).
async function obtenerOCrearCorredor(
    tx: Tx,
    corredor: CrearInscripcion["corredor"],
    contacto: CrearInscripcion["contactoEmergencia"]
) {
    const persona = await tx.persona.findUnique({ where: { dni: corredor.dni }, include: { corredor: true } });
    if (persona?.corredor) return persona.corredor;

    const personaContacto = await tx.persona.upsert({
        where: { dni: contacto.dni },
        update: {},
        create: contacto,
    });

    const personaCorredor = persona ?? await tx.persona.create({
        data: {
            dni: corredor.dni,
            nombre: corredor.nombre,
            apellido: corredor.apellido,
            telefono: corredor.telefono,
        },
    });

    return tx.corredor.create({
        data: {
            fechaNacimiento: corredor.fechaNacimiento,
            sexo: corredor.sexo,
            discapacidad: corredor.discapacidad,
            personaId: personaCorredor.id,
            contactoEmergenciaId: personaContacto.id,
        },
    });
}

export async function crear(
    carreraId: string,
    datos: CrearInscripcion,
    registradaPor: string
): Promise<InscripcionDetalleDTO> {
    const inscripcionId = await prisma.$transaction(async (tx) => {
        const carrera = await tx.carrera.findUnique({
            where: { id: carreraId },
            include: { distanciaCarrera: { include: { distancia: true } } },
        });
        if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");
        if (!ESTADOS_INSCRIPCION.includes(carrera.estado)) {
            throw new ErrorReglaDeNegocio("La carrera no admite inscripciones en este momento.");
        }

        const distanciaCarrera = carrera.distanciaCarrera.find(
            (dc) =>
                dc.distancia.kilometraje === datos.distancia.kilometraje &&
                dc.distancia.tipoDistancia === datos.distancia.tipoDistancia
        );
        if (!distanciaCarrera) throw new ErrorReglaDeNegocio("La carrera no tiene esa distancia.");

        const ocupados = await tx.inscripcion.count({ where: ocupanCupo(carreraId) });
        if (ocupados >= carrera.participantesMax) {
            throw new ErrorReglaDeNegocio("La carrera alcanzó el cupo máximo.");
        }

        const corredor = await obtenerOCrearCorredor(tx, datos.corredor, datos.contactoEmergencia);

        const yaInscripto = await tx.inscripcion.findFirst({
            where: { ...ocupanCupo(carreraId), idCorredor: corredor.id },
        });
        if (yaInscripto) throw new ErrorReglaDeNegocio("El corredor ya está inscripto en esta carrera.");

        // Productos: se valida el stock y se descuenta
        const variantes = await tx.productoVariante.findMany({
            where: { id: { in: datos.productos.map((p) => p.varianteId) } },
            include: { producto: true },
        });
        if (variantes.length !== datos.productos.length) {
            throw new ErrorNoEncontrado("Alguno de los productos elegidos no existe.");
        }

        let montoProductos = 0;
        for (const { varianteId, cantidad } of datos.productos) {
            const variante = variantes.find((v) => v.id === varianteId)!; // existe: se verificó arriba
            if (variante.stock < cantidad) {
                throw new ErrorReglaDeNegocio(
                    `No hay stock suficiente de ${variante.producto.nombreProducto} (${variante.nombreVariante}).`
                );
            }
            montoProductos += variante.precio * cantidad;
            await tx.productoVariante.update({
                where: { id: varianteId },
                data: { stock: { decrement: cantidad } },
            });
        }

        // La compra pertenece a la cuenta del corredor si la tiene; si no, a quien la registra
        const cuenta = await tx.usuario.findUnique({
            where: { personaId: corredor.personaId },
            select: { id: true },
        });

        // Una inscripción presencial se paga en el momento
        const compra = await tx.compra.create({
            data: {
                montoTotal: distanciaCarrera.precioDistancia + montoProductos,
                isPagado: true,
                metodoPago: "Pago_presencial",
                usuarioId: cuenta?.id ?? registradaPor,
                detallesProductos: {
                    create: datos.productos.map((p) => ({ cantidad: p.cantidad, productoId: p.varianteId })),
                },
            },
        });

        const inscripcion = await tx.inscripcion.create({
            data: {
                estado: "Pagada",
                idCompra: compra.id,
                idCorredor: corredor.id,
                idDistanciaCarrera: distanciaCarrera.id,
            },
        });

        if (datos.aptoMedico) {
            await tx.aptoMedico.create({
                data: {
                    aprobado: true,
                    fechaVencimiento: datos.aptoMedico.fechaVencimiento,
                    corredorId: corredor.id,
                },
            });
        }

        return inscripcion.id;
    });

    return obtener(inscripcionId);
}

// Baja lógica

export async function anular(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const inscripcion = await tx.inscripcion.findUnique({
            where: { id },
            include: {
                entregaKit: true,
                clasificacion: true,
                compra: { include: { detallesProductos: true } },
            },
        });
        if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
        if (inscripcion.estado === "Anulada") throw new ErrorReglaDeNegocio("La inscripción ya está anulada.");
        if (inscripcion.entregaKit || inscripcion.clasificacion) {
            throw new ErrorReglaDeNegocio(
                "No se puede eliminar la inscripción porque el corredor tiene un dorsal o tiempos registrados en la carrera."
            );
        }

        // Los productos de la compra vuelven al stock
        for (const detalle of inscripcion.compra.detallesProductos) {
            await tx.productoVariante.update({
                where: { id: detalle.productoId },
                data: { stock: { increment: detalle.cantidad } },
            });
        }

        await tx.inscripcion.update({ where: { id }, data: { estado: "Anulada" } });
    });
}