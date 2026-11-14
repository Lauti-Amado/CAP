//backend/src/services/actividad.service.ts
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import type { ActividadDTO } from "../dtos/actividad.dto";

type Persona = { nombre: string; apellido: string };

const nombreCompleto = (p: Persona) => `${p.nombre} ${p.apellido}`;   // "Lucía Gómez"
const nombreCorto = (p: Persona) => `${p.nombre.charAt(0)}. ${p.apellido}`;   // "C. Silva"

// Últimos movimientos de una carrera: kits entregados, inscripciones presenciales y lecturas RFID
export async function listarPorCarrera(carreraId: string, limite: number): Promise<ActividadDTO[]> {
    const carrera = await prisma.carrera.findUnique({
        where: { id: carreraId },
        select: { fechaHoraEntregaKits: true },
    });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const [kits, inscripciones, lecturas] = await Promise.all([
        prisma.entregaKit.findMany({
            where: { inscripcion: { idCarrera: carreraId } },
            orderBy: { fechaHoraEntrega: "desc" },
            take: limite,
            include: { inscripcion: { include: { corredor: { include: { persona: true } } } } },
        }),
        prisma.inscripcion.findMany({
            where: {
                idCarrera: carreraId,
                estado: { not: "Anulada" },
                detalleCompra: { compra: { metodoPago: "Pago_presencial" } },
            },
            orderBy: { fechaHoraCreacion: "desc" },
            take: limite,
            include: { corredor: { include: { persona: true } } },
        }),
        // Un dorsal se reutiliza entre carreras: se acota a las lecturas posteriores a la entrega de kits
        prisma.lecturaRFID.findMany({
            where: {
                fechaHoraLectura: { gte: carrera.fechaHoraEntregaKits },
                chip: { dorsal: { entregas: { some: { inscripcion: { idCarrera: carreraId } } } } },
            },
            orderBy: { fechaHoraLectura: "desc" },
            take: limite,
            include: { chip: { include: { dorsal: true } } },
        }),
    ]);

    const actividad: ActividadDTO[] = [
        ...kits.map((k): ActividadDTO => ({
            id: `kit-${k.id}`,
            tipo: "kit",
            descripcion: `Kit entregado a ${nombreCompleto(k.inscripcion.corredor.persona)}`,
            fechaHora: k.fechaHoraEntrega,
        })),
        ...inscripciones.map((i): ActividadDTO => ({
            id: `inscripcion-${i.id}`,
            tipo: "inscripcion",
            descripcion: `Nueva inscripción manual: ${nombreCorto(i.corredor.persona)}`,
            fechaHora: i.fechaHoraCreacion,
        })),
        ...lecturas.map((l): ActividadDTO => ({
            id: `lectura-${l.id}`,
            tipo: "lectura",
            descripcion: `Lectura registrada: Dorsal #${l.chip.dorsal.numero}`,
            fechaHora: l.fechaHoraLectura,
        })),
    ];

    return actividad
        .sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime())
        .slice(0, limite);
}