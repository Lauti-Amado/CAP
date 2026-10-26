//backend/src/services/dorsal.service.ts
import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type { InscripcionEntregaKit, CarreraEntregaKits, ConsultaDorsal, EntregaReciente } from "../dtos/dorsal.dto";
import type { EstadoCarrera, Sexo } from "../generated/prisma/client";
import type { AsignarDorsal, ItemInventario } from "../validations/dorsal.validations";

// Estados de la carrera en los que se puede entregar (o deshacer) un kit
const ESTADOS_ENTREGA_KITS: readonly EstadoCarrera[] = ["Entrega_kits"];

const inscripcionInclude = {
    compra: {
        include: {
            detallesProductos: { include: { producto: { include: { producto: true } } } },
        },
    },
    corredor: { include: { persona: true, aptosMedicos: true } },
    distanciaCarrera: { include: { distancia: true, carrera: true } },
    equipo: true,
    entregaKit: { include: { dorsal: { include: { chip: true } } } },
} satisfies Prisma.InscripcionInclude;

type InscripcionCompleta = Prisma.InscripcionGetPayload<{ include: typeof inscripcionInclude }>;

// ---------- Reglas de negocio ----------

function requiereAptoMedico(kilometraje: number, tipo: string): boolean {
    return kilometraje > 10 && tipo === "Competitiva";
}

function calcularCategoria(nacimiento: Date, sexo: Sexo, fechaCarrera: Date): string {
    let edad = fechaCarrera.getUTCFullYear() - nacimiento.getUTCFullYear();
    const meses = fechaCarrera.getUTCMonth() - nacimiento.getUTCMonth();
    if (meses < 0 || (meses === 0 && fechaCarrera.getUTCDate() < nacimiento.getUTCDate())) edad--;
    const desde = Math.floor(edad / 5) * 5;
    return `${sexo === "Masculino" ? "M" : "F"} ${desde}-${desde + 4}`;
}

function vencimientoAptoVigente(i: InscripcionCompleta): Date | null {
    const fechaCarrera = i.distanciaCarrera.carrera.fechaHoraCarrera;
    const vigentes = i.corredor.aptosMedicos
        .filter((a) => a.aprobado && a.fechaVencimiento >= fechaCarrera)
        .map((a) => a.fechaVencimiento);
    if (vigentes.length === 0) return null;
    return new Date(Math.max(...vigentes.map((f) => f.getTime())));
}

function motivosNoHabilitado(i: InscripcionCompleta): string[] {
    const motivos: string[] = [];
    const { carrera, distancia } = i.distanciaCarrera;

    if (!ESTADOS_ENTREGA_KITS.includes(carrera.estado)) {
        motivos.push("La carrera no está en etapa de entrega de kits.");
    }
    if (i.estado === "Anulada") motivos.push("La inscripción está anulada.");
    if (!i.compra.isPagado) motivos.push("La inscripción no está paga.");
    if (requiereAptoMedico(distancia.kilometraje, distancia.tipoDistancia) && !vencimientoAptoVigente(i)) {
        motivos.push("Falta un apto médico vigente para esta carrera.");
    }
    return motivos;
}

// ---------- Mapeo a DTO ----------

function aDto(i: InscripcionCompleta): InscripcionEntregaKit {
    const { carrera, distancia } = i.distanciaCarrera;
    const { persona } = i.corredor;
    const motivos = motivosNoHabilitado(i);
    const dorsal = i.entregaKit?.dorsal ?? null;

    return {
        inscripcionId: i.id,
        estadoInscripcion: i.estado,
        corredor: {
            nombre: persona.nombre,
            apellido: persona.apellido,
            dni: persona.dni,
            sexo: i.corredor.sexo,
            fechaNacimiento: i.corredor.fechaNacimiento,
        },
        carrera: { id: carrera.id, nombre: carrera.nombre, estado: carrera.estado },
        distancia: { kilometraje: distancia.kilometraje, tipoDistancia: distancia.tipoDistancia },
                clubTeam: i.equipo?.nombre ?? null,
        categoria: calcularCategoria(i.corredor.fechaNacimiento, i.corredor.sexo, carrera.fechaHoraCarrera),
        talleRemera: (() => {
            const remera = i.compra.detallesProductos.find((d) =>
                /remera/i.test(d.producto.producto.nombreProducto));
            return remera ? remera.producto.nombreVariante.replace(/^talle\s*/i, "") : null;
        })(),
        pagado: i.compra.isPagado,
        metodoPago: i.compra.metodoPago,
        aptoMedico: {
            requerido: requiereAptoMedico(distancia.kilometraje, distancia.tipoDistancia),
            vigente: vencimientoAptoVigente(i) !== null,
            fechaVencimiento: vencimientoAptoVigente(i),
        },
        productos: i.compra.detallesProductos.map((d) => ({
            nombre: d.producto.producto.nombreProducto,
            variante: d.producto.nombreVariante,
            cantidad: d.cantidad,
        })),
        dorsal: dorsal
            ? { id: dorsal.id, numero: dorsal.numero, chipNumero: dorsal.chip?.numero ?? null }
            : null,
        fechaHoraEntrega: i.entregaKit?.fechaHoraEntrega ?? null,
        habilitado: motivos.length === 0 && dorsal === null,
        motivos,
    };
}

// ---------- Chip ----------

async function asociarChip(
    tx: Prisma.TransactionClient,
    dorsalId: string,
    chipActual: { id: string; numero: number } | null,
    numero: number
) {
    if (chipActual?.numero === numero) return;

    const enUso = await tx.chip.findFirst({ where: { numero, NOT: { dorsalId } } });
    if (enUso) throw new ErrorReglaDeNegocio(`El chip ${numero} ya está asociado a otro dorsal.`);

    if (chipActual) {
        await tx.chip.update({ where: { id: chipActual.id }, data: { numero } });
    } else {
        await tx.chip.create({ data: { numero, dorsalId } });
    }
}

// ---------- Casos de uso ----------

export async function buscarInscripcionParaEntrega(carreraId: string, dni: string) {
    const inscripcion = await prisma.inscripcion.findFirst({
        where: {
            estado: { not: "Anulada" },
            distanciaCarrera: { idCarrera: carreraId },
            corredor: { persona: { dni } },
        },
        include: inscripcionInclude,
    });
    if (!inscripcion) {
        throw new ErrorNoEncontrado("No existe una inscripción con ese DNI en esta carrera.");
    }
    return aDto(inscripcion);
}

export async function asignarDorsal(inscripcionId: string, datos: AsignarDorsal) {
    return prisma.$transaction(async (tx) => {
        const inscripcion = await tx.inscripcion.findUnique({
            where: { id: inscripcionId },
            include: inscripcionInclude,
        });
        if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
        if (inscripcion.entregaKit) {
            throw new ErrorReglaDeNegocio("Esta inscripción ya tiene un dorsal asignado.");
        }

        const motivos = motivosNoHabilitado(inscripcion);
        if (motivos.length > 0) throw new ErrorReglaDeNegocio(motivos.join(" "));

        const carreraId = inscripcion.distanciaCarrera.idCarrera;

        // El dorsal físico se reutiliza entre carreras; en una misma carrera no puede repetirse
        let dorsal = await tx.dorsal.findFirst({ where: { numero: datos.numero }, include: { chip: true } });
        if (dorsal) {
            const enUso = await tx.entregaKit.findFirst({
                where: { dorsalId: dorsal.id, inscripcion: { distanciaCarrera: { idCarrera: carreraId } } },
            });
            if (enUso) {
                throw new ErrorReglaDeNegocio(`El dorsal ${datos.numero} ya fue entregado en esta carrera.`);
            }
        } else {
            dorsal = await tx.dorsal.create({ data: { numero: datos.numero }, include: { chip: true } });
        }

        if (datos.chipNumero !== undefined) {
            await asociarChip(tx, dorsal.id, dorsal.chip, datos.chipNumero);
        }

        await tx.entregaKit.create({ data: { inscripcionId, dorsalId: dorsal.id } });
        await tx.inscripcion.update({ where: { id: inscripcionId }, data: { estado: "Confirmada" } });

        const actualizada = await tx.inscripcion.findUniqueOrThrow({
            where: { id: inscripcionId },
            include: inscripcionInclude,
        });
        return aDto(actualizada);
    });
}

export async function desasignarDorsal(inscripcionId: string) {
    const inscripcion = await prisma.inscripcion.findUnique({
        where: { id: inscripcionId },
        include: {
            entregaKit: true,
            clasificacion: true,
            distanciaCarrera: { include: { carrera: true } },
        },
    });
    if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
    if (!inscripcion.entregaKit) throw new ErrorNoEncontrado("La inscripción no tiene dorsal asignado.");
    if (!ESTADOS_ENTREGA_KITS.includes(inscripcion.distanciaCarrera.carrera.estado)) {
        throw new ErrorReglaDeNegocio("Solo se puede deshacer la entrega durante la etapa de entrega de kits.");
    }
    if (inscripcion.clasificacion) {
        throw new ErrorReglaDeNegocio("No se puede deshacer: el corredor ya tiene una clasificación registrada.");
    }

    // El Dorsal y su Chip se conservan: son piezas físicas reutilizables
    await prisma.$transaction([
        prisma.entregaKit.delete({ where: { inscripcionId } }),
        prisma.inscripcion.update({ where: { id: inscripcionId }, data: { estado: "Pagada" } }),
    ]);
}

export async function vincularChip(dorsalId: string, chipNumero: number) {
    return prisma.$transaction(async (tx) => {
        const dorsal = await tx.dorsal.findUnique({ where: { id: dorsalId }, include: { chip: true } });
        if (!dorsal) throw new ErrorNoEncontrado("Dorsal no encontrado.");

        await asociarChip(tx, dorsal.id, dorsal.chip, chipNumero);

        const actualizado = await tx.dorsal.findUniqueOrThrow({ where: { id: dorsalId }, include: { chip: true } });
        return { id: actualizado.id, numero: actualizado.numero, chipNumero: actualizado.chip?.numero ?? null };
    });
}

export async function listarDorsalesDeCarrera(carreraId: string, busqueda?: string) {
    const carrera = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { id: true } });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const inscripciones = await prisma.inscripcion.findMany({
        where: {
            entregaKit: { isNot: null },
            distanciaCarrera: { idCarrera: carreraId },
            ...(busqueda
                ? {
                      OR: [
                          { corredor: { persona: { dni: { contains: busqueda } } } },
                          { corredor: { persona: { nombre: { contains: busqueda } } } },
                          { corredor: { persona: { apellido: { contains: busqueda } } } },
                          { entregaKit: { dorsal: { numero: { contains: busqueda } } } },
                      ],
                  }
                : {}),
        },
        include: inscripcionInclude,
    });

    return inscripciones
        .map(aDto)
        .sort((a, b) => Number(a.dorsal?.numero ?? 0) - Number(b.dorsal?.numero ?? 0));
}

export async function carreraParaEntrega(): Promise<CarreraEntregaKits> {
    const carrera = await prisma.carrera.findFirst({
        where: { estado: { in: [...ESTADOS_ENTREGA_KITS] } },
        orderBy: { fechaHoraCarrera: "asc" },
        include: { distanciaCarrera: { include: { distancia: true } } },
    });
    if (!carrera) throw new ErrorNoEncontrado("No hay una carrera en etapa de entrega de kits.");

    const kilometrajes = [...new Set(carrera.distanciaCarrera.map((d) => d.distancia.kilometraje))]
        .sort((a, b) => a - b);

    return {
        id: carrera.id,
        nombre: carrera.nombre,
        edicion: carrera.fechaHoraCarrera.getUTCFullYear(),
        estado: carrera.estado,
        distancias: kilometrajes.map((k) => `${k}K`),
    };
}

export async function entregasRecientes(carreraId: string, limite: number): Promise<EntregaReciente[]> {
    const entregas = await prisma.entregaKit.findMany({
        where: { inscripcion: { distanciaCarrera: { idCarrera: carreraId } } },
        orderBy: { fechaHoraEntrega: "desc" },
        take: limite,
        include: {
            dorsal: true,
            inscripcion: {
                include: {
                    corredor: { include: { persona: true } },
                    distanciaCarrera: { include: { distancia: true } },
                },
            },
        },
    });

    const ahora = Date.now();
    return entregas.map((e) => {
        const { persona } = e.inscripcion.corredor;
        return {
            id: e.id,
            nombreCorredor: `${persona.nombre} ${persona.apellido}`,
            numeroKit: Number(e.dorsal.numero),
            distancia: `${e.inscripcion.distanciaCarrera.distancia.kilometraje}K`,
            minutosDesdeEntrega: Math.max(0, Math.floor((ahora - e.fechaHoraEntrega.getTime()) / 60000)),
        };
    });
}

// Para mostrar el chip y avisar si el dorsal ya se entregó, mientras el clasificador escribe
export async function consultarDorsal(carreraId: string, numero: string): Promise<ConsultaDorsal> {
    const dorsal = await prisma.dorsal.findFirst({ where: { numero }, include: { chip: true } });
    const entregado = dorsal
        ? await prisma.entregaKit.findFirst({
              where: { dorsalId: dorsal.id, inscripcion: { distanciaCarrera: { idCarrera: carreraId } } },
          })
        : null;

    return {
        numero,
        enInventario: dorsal !== null,
        chipNumero: dorsal?.chip?.numero ?? null,
        disponible: entregado === null,
    };
}

export async function cargarInventario(items: ItemInventario[]) {
    return prisma.$transaction(async (tx) => {
        let creados = 0;
        let existentes = 0;

        for (const item of items) {
            let dorsal = await tx.dorsal.findFirst({ where: { numero: item.numero }, include: { chip: true } });
            if (dorsal) {
                existentes++;
            } else {
                dorsal = await tx.dorsal.create({ data: { numero: item.numero }, include: { chip: true } });
                creados++;
            }
            if (item.chipNumero !== undefined) {
                await asociarChip(tx, dorsal.id, dorsal.chip, item.chipNumero);
            }
        }
        return { creados, existentes };
    }, { timeout: 60_000 });
}