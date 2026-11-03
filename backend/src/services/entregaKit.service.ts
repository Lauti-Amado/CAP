//backend/src/services/entregaKit.service.ts
import { prisma } from "../config/prisma";
import type { EstadoCarrera, Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { toEntregaKitDto, toEntregaRecienteDto, type EntregaKitDTO, type EntregaRecienteDTO,} from "../dtos/dorsal.dto";
import { asociarChip, obtenerOCrearDorsal } from "./dorsal.service";
import type { EntregarKit } from "../validations/dorsal.validations";

// Estados de la carrera en los que se puede entregar (o deshacer) un kit
const ESTADOS_ENTREGA_KITS: readonly EstadoCarrera[] = ["Entrega_kits"];

const conDorsal = { dorsal: { include: { chip: true } } } satisfies Prisma.EntregaKitInclude;

export const inscripcionParaEntregaInclude = {
    compra: true,
    corredor: { include: { aptosMedicos: true } },
    distanciaCarrera: { include: { distancia: true, carrera: true } },
    entregaKit: true,
} satisfies Prisma.InscripcionInclude;

export type InscripcionParaEntrega = Prisma.InscripcionGetPayload<{
    include: typeof inscripcionParaEntregaInclude;
}>;

// Reglas de negocio

export function requiereAptoMedico(kilometraje: number, tipo: string): boolean {
    return kilometraje > 10 && tipo === "Competitiva";
}

export function vencimientoAptoVigente(i: InscripcionParaEntrega): Date | null {
    const fechaCarrera = i.distanciaCarrera.carrera.fechaHoraCarrera;
    const vigentes = i.corredor.aptosMedicos
        .filter((a) => a.aprobado && a.fechaVencimiento >= fechaCarrera)
        .map((a) => a.fechaVencimiento);
    if (vigentes.length === 0) return null;
    return new Date(Math.max(...vigentes.map((f) => f.getTime())));
}

export function motivosNoHabilitado(i: InscripcionParaEntrega): string[] {
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

// Casos de uso

export async function entregarKit(inscripcionId: string, datos: EntregarKit): Promise<EntregaKitDTO> {
    return prisma.$transaction(async (tx) => {
        const inscripcion = await tx.inscripcion.findUnique({
            where: { id: inscripcionId },
            include: inscripcionParaEntregaInclude,
        });
        if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
        if (inscripcion.entregaKit) {
            throw new ErrorReglaDeNegocio("Esta inscripción ya tiene un kit entregado.");
        }

        const motivos = motivosNoHabilitado(inscripcion);
        if (motivos.length > 0) throw new ErrorReglaDeNegocio(motivos.join(" "));

        const dorsal = await obtenerOCrearDorsal(tx, datos.numero);

        // En una misma carrera el dorsal no puede repetirse
        const enUso = await tx.entregaKit.findFirst({
            where: {
                dorsalId: dorsal.id,
                inscripcion: { distanciaCarrera: { idCarrera: inscripcion.distanciaCarrera.idCarrera } },
            },
        });
        if (enUso) throw new ErrorReglaDeNegocio(`El dorsal ${datos.numero} ya fue entregado en esta carrera.`);

        if (datos.chipNumero !== undefined) await asociarChip(tx, dorsal, datos.chipNumero);

        const entrega = await tx.entregaKit.create({
            data: { inscripcionId, dorsalId: dorsal.id },
            include: conDorsal,
        });
        await tx.inscripcion.update({ where: { id: inscripcionId }, data: { estado: "Confirmada" } });

        return toEntregaKitDto(entrega);
    });
}

export async function obtenerEntrega(inscripcionId: string): Promise<EntregaKitDTO> {
    const entrega = await prisma.entregaKit.findUnique({ where: { inscripcionId }, include: conDorsal });
    if (!entrega) throw new ErrorNoEncontrado("La inscripción no tiene un kit entregado.");
    return toEntregaKitDto(entrega);
}

export async function deshacerEntrega(inscripcionId: string): Promise<void> {
    const inscripcion = await prisma.inscripcion.findUnique({
        where: { id: inscripcionId },
        include: {
            entregaKit: true,
            clasificacion: true,
            distanciaCarrera: { include: { carrera: true } },
        },
    });
    if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
    if (!inscripcion.entregaKit) throw new ErrorNoEncontrado("La inscripción no tiene un kit entregado.");
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

export async function entregasRecientes(carreraId: string, limite: number): Promise<EntregaRecienteDTO[]> {
    const entregas = await prisma.entregaKit.findMany({
        where: { inscripcion: { distanciaCarrera: { idCarrera: carreraId } } },
        orderBy: { fechaHoraEntrega: "desc" },
        take: limite,
        include: {
            ...conDorsal,
            inscripcion: {
                include: {
                    corredor: { include: { persona: true } },
                    distanciaCarrera: { include: { distancia: true } },
                },
            },
        },
    });
    return entregas.map(toEntregaRecienteDto);
}