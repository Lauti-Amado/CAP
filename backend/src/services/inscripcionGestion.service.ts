//backend/src/services/inscripcionGestion.service.ts
import { prisma } from "../config/prisma";
import type { EstadoCarrera, Prisma } from "../generated/prisma/client";
import { estaPagada } from "../rules/compra.rules";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { toInscripcionDetalleDto, toInscripcionListadoDto, toOpcionesInscripcionDto, type ContactoEmergenciaDTO, type InscripcionDetalleDTO, type InscripcionListadoDTO, type OpcionesInscripcionDTO,} from "../dtos/inscripcionGestion.dto";
import { toPaginaDto, type PaginaDTO } from "../dtos/pagina.dto";
import type { CrearInscripcion, ListadoInscripciones, ModificarInscripcion } from "../validations/inscripcionGestion.validations";

// Etapas de la carrera en las que se aceptan inscripciones presenciales
const ESTADOS_INSCRIPCION: readonly EstadoCarrera[] = ["Activa", "Entrega_kits"];

const listadoInclude = {
    corredor: { include: { persona: true } },
    distanciaCarrera: { include: { distancia: true, carrera: true } },
    detalleCompra: { include: { compra: true } },
    entregaKit: true,
} satisfies Prisma.InscripcionInclude;

const detalleInclude = {
    detalleCompra: {
        include: {
            compra: {
                include: {
                    detallesCompra: { include: { detalleProducto: { include: { producto: true } } } },
                },
            },
        },
    },
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
        ...(f.pagado !== undefined
            ? { detalleCompra: { compra: { estado: f.pagado ? { equals: "Pagada" } : { not: "Pagada" } } } }
            : {}),
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

async function obtenerOCrearEquipo(tx: Tx, equipo: { nombre: string; codigoEquipo?: string }) {
    const codigoEquipo = equipo.codigoEquipo ?? null;
    const existente = await tx.equipo.findFirst({ where: { nombre: equipo.nombre, codigoEquipo } });
    return existente ?? tx.equipo.create({ data: { nombre: equipo.nombre, codigoEquipo } });
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

        // NUna inscripción anulada se reactiva (la unique corredor+carrera no deja crear otra)
        const previa = await tx.inscripcion.findUnique({
            where: { idCorredor_idCarrera: { idCorredor: corredor.id, idCarrera: carreraId } },
        });
        if (previa && previa.estado !== "Anulada") {
            throw new ErrorReglaDeNegocio("El corredor ya está inscripto en esta carrera.");
        }

        // Productos: se valida el stock y se descuenta
        const variantes = await tx.productoVariante.findMany({
            where: { id: { in: datos.productos.map((p) => p.varianteId) } },
            include: { producto: true },
        });
        if (variantes.length !== datos.productos.length) {
            throw new ErrorNoEncontrado("Alguno de los productos elegidos no existe.");
        }

        const lineas = datos.productos.map(({ varianteId, cantidad }) => ({
            variante: variantes.find((v) => v.id === varianteId)!, // existe: se verificó arriba
            cantidad,
        }));

        let montoProductos = 0;
        for (const { variante, cantidad } of lineas) {
            if (variante.stock < cantidad) {
                throw new ErrorReglaDeNegocio(
                    `No hay stock suficiente de ${variante.producto.nombreProducto} (${variante.nombreVariante}).`
                );
            }
            montoProductos += variante.precio * cantidad;
            await tx.productoVariante.update({
                where: { id: variante.id },
                data: { stock: { decrement: cantidad } },
            });
        }

        // La compra pertenece a la cuenta del corredor si la tiene; si no, a quien la registra
        const cuenta = await tx.usuario.findUnique({
            where: { personaId: corredor.personaId },
            select: { id: true },
        });

        const montoTotal = distanciaCarrera.precioDistancia + montoProductos;

        // Una inscripción presencial se paga en el momento: la compra nace Pagada con su comprobante
        const compra = await tx.compra.create({
            data: {
                montoTotal,
                estado: "Pagada",
                metodoPago: "Pago_presencial",
                usuarioId: cuenta?.id ?? registradaPor,
                comprobante: {
                    create: {
                        montoTotalPago: montoTotal,
                        fechaHoraPago: new Date(),
                        documentoTitularPago: datos.corredor.dni,
                        nombreApellidoTitularPago: `${datos.corredor.nombre} ${datos.corredor.apellido}`,
                    },
                },
            },
        });

        // Un DetalleCompra por la inscripción y uno por cada producto
        const { kilometraje, tipoDistancia } = distanciaCarrera.distancia;
        const detalleInscripcion = await tx.detalleCompra.create({
            data: {
                tipo: "Inscripcion",
                descripcion: `Inscripción ${carrera.nombre} ${kilometraje}K ${tipoDistancia}`,
                monto: distanciaCarrera.precioDistancia,
                cantidad: 1,
                idCompra: compra.id,
            },
        });
        for (const { variante, cantidad } of lineas) {
            await tx.detalleCompra.create({
                data: {
                    tipo: "Producto",
                    descripcion: `${variante.producto.nombreProducto} (${variante.nombreVariante})`,
                    monto: variante.precio, // unitario
                    cantidad,
                    idCompra: compra.id,
                    idDetalleProducto: variante.id,
                },
            });
        }

        const equipo = datos.equipo ? await obtenerOCrearEquipo(tx, datos.equipo) : null;

        const datosInscripcion = {
            estado: "Pagada",
            idDetalleCompra: detalleInscripcion.id,
            idDistancia: distanciaCarrera.idDistancia,
            equipoId: equipo?.id ?? null,
        } satisfies Prisma.InscripcionUncheckedUpdateInput;

        const inscripcion = previa
            ? await tx.inscripcion.update({ where: { id: previa.id }, data: datosInscripcion })
            : await tx.inscripcion.create({
                  data: { ...datosInscripcion, idCorredor: corredor.id, idCarrera: carreraId },
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
                detalleCompra: { include: { compra: { include: { detallesCompra: true } } } },
            },
        });
        if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
        if (inscripcion.estado === "Anulada") throw new ErrorReglaDeNegocio("La inscripción ya está anulada.");
        if (inscripcion.entregaKit || inscripcion.clasificacion) {
            throw new ErrorReglaDeNegocio(
                "No se puede eliminar la inscripción porque el corredor tiene un dorsal o tiempos registrados en la carrera."
            );
        }

        // Solo las compras presenciales se manejan acá: stock y reembolso de las web los gestiona el sistema web
        const { compra } = inscripcion.detalleCompra;
        if (compra.metodoPago === "Pago_presencial") {
            for (const detalle of compra.detallesCompra) {
                if (!detalle.idDetalleProducto) continue;
                await tx.productoVariante.update({
                    where: { id: detalle.idDetalleProducto },
                    data: { stock: { increment: detalle.cantidad } },
                });
            }
            await tx.compra.update({ where: { id: compra.id }, data: { estado: "Anulada" } });
        }

        await tx.inscripcion.update({ where: { id }, data: { estado: "Anulada" } });
    });
}

// Modificación: el DNI queda bloqueado. Distancia y equipo solo se cambian antes de entregar el kit.
export async function modificar(id: string, datos: ModificarInscripcion): Promise<InscripcionDetalleDTO> {
    await prisma.$transaction(async (tx) => {
        const inscripcion = await tx.inscripcion.findUnique({
            where: { id },
            include: {
                detalleCompra: { include: { compra: true } },
                equipo: true,
                entregaKit: true,
                corredor: { include: { persona: true } },
                distanciaCarrera: { include: { distancia: true, carrera: true } },
            },
        });
        if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
            const { compra } = inscripcion.detalleCompra;
        if (inscripcion.estado === "Anulada") throw new ErrorReglaDeNegocio("La inscripción está anulada.");

        const { carrera, distancia } = inscripcion.distanciaCarrera;
        if (!ESTADOS_INSCRIPCION.includes(carrera.estado)) {
            throw new ErrorReglaDeNegocio("La carrera no admite modificaciones en este momento.");
        }
        if (datos.contactoEmergencia.dni === inscripcion.corredor.persona.dni) {
            throw new ErrorReglaDeNegocio("El contacto de emergencia no puede ser el mismo corredor.");
        }

        const cambiaDistancia =
            datos.distancia.kilometraje !== distancia.kilometraje ||
            datos.distancia.tipoDistancia !== distancia.tipoDistancia;
        const cambiaEquipo =
            (datos.equipo?.nombre ?? null) !== (inscripcion.equipo?.nombre ?? null) ||
            (datos.equipo?.codigoEquipo ?? null) !== (inscripcion.equipo?.codigoEquipo ?? null);

        if ((cambiaDistancia || cambiaEquipo) && inscripcion.entregaKit) {
            throw new ErrorReglaDeNegocio("No se puede cambiar la distancia ni el equipo: el kit ya fue entregado.");
        }

        let nuevaDistancia: { idDistancia: string; precioDistancia: number } | null = null;   // CAMBIO

        if (cambiaDistancia) {
            // El pago virtual lo gestiona el sistema web: acá no se puede alterar el monto cobrado
            if (compra.metodoPago === "Pago_virtual") {
                throw new ErrorReglaDeNegocio("No se puede cambiar la distancia de una inscripción pagada por la web.");
            }
            const nueva = await tx.distanciaCarrera.findFirst({
                where: {
                    idCarrera: carrera.id,
                    distancia: { kilometraje: datos.distancia.kilometraje, tipoDistancia: datos.distancia.tipoDistancia },
                },
            });
            if (!nueva) throw new ErrorReglaDeNegocio("La carrera no tiene esa distancia.");
            nuevaDistancia = { idDistancia: nueva.idDistancia, precioDistancia: nueva.precioDistancia };
        }

        const equipo = datos.equipo ? await obtenerOCrearEquipo(tx, datos.equipo) : null;

        // Datos personales
        await tx.persona.update({
            where: { id: inscripcion.corredor.personaId },
            data: {
                nombre: datos.corredor.nombre,
                apellido: datos.corredor.apellido,
                telefono: datos.corredor.telefono,
            },
        });

        const contacto = await tx.persona.upsert({
            where: { dni: datos.contactoEmergencia.dni },
            update: {},
            create: datos.contactoEmergencia,
        });

        await tx.corredor.update({
            where: { id: inscripcion.idCorredor },
            data: {
                fechaNacimiento: datos.corredor.fechaNacimiento,
                sexo: datos.corredor.sexo,
                discapacidad: datos.corredor.discapacidad,
                contactoEmergenciaId: contacto.id,
            },
        });

        if (datos.aptoMedico) {
            await tx.aptoMedico.create({
                data: { aprobado: true, fechaVencimiento: datos.aptoMedico.fechaVencimiento, corredorId: inscripcion.idCorredor },
            });
        }

        await tx.inscripcion.update({
            where: { id },
            data: {
                ...(nuevaDistancia ? { idDistancia: nuevaDistancia.idDistancia } : {}),   // CAMBIO
                equipoId: equipo?.id ?? null,
            },
        });

        if (nuevaDistancia) {   // CAMBIO: se ajusta el detalle, la compra y el comprobante
            const montoTotal =
                compra.montoTotal - inscripcion.distanciaCarrera.precioDistancia + nuevaDistancia.precioDistancia;

            await tx.detalleCompra.update({
                where: { id: inscripcion.idDetalleCompra },
                data: { monto: nuevaDistancia.precioDistancia },
            });
            await tx.compra.update({ where: { id: compra.id }, data: { montoTotal } });
            await tx.comprobante.updateMany({ where: { compraId: compra.id }, data: { montoTotalPago: montoTotal } });
        }
    });

    return obtener(id);
}