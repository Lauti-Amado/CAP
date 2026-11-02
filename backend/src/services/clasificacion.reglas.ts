//backend/src/services/clasificacion.reglas.ts
import type { EstadoCarrera, EstadoClasificacion, EstadoInscripcion } from "../generated/prisma/client";

// Estados de la carrera en los que existe una clasificación para cargar o corregir
export const ESTADOS_CARRERA_CLASIFICABLE: readonly EstadoCarrera[] = ["En_curso", "Finalizada"];

export function carreraAdmiteClasificacion(estado: EstadoCarrera): boolean {
    return ESTADOS_CARRERA_CLASIFICABLE.includes(estado);
}

// Para clasificar, el corredor debe haber retirado su kit (inscripción Confirmada con dorsal)
export function inscripcionHabilitada(inscripcion: { estado: EstadoInscripcion; tieneEntregaKit: boolean }): boolean {
    return inscripcion.estado === "Confirmada" && inscripcion.tieneEntregaKit;
}

export function puestoEnRango(puesto: number, totalParticipantes: number): boolean {
    return Number.isInteger(puesto) && puesto >= 1 && puesto <= totalParticipantes;
}

// Tiempo transcurrido desde la largada, en milisegundos
export function calcularTiempoDesdeLargada(ahora: Date, largada: Date): number {
    return ahora.getTime() - largada.getTime();
}

export function calcularProgreso(llegados: number, participantes: number): number {
    return participantes === 0 ? 0 : Math.round((llegados / participantes) * 100);
}

// Resumen de la carrera a partir de la cantidad de clasificaciones por estado
export function resumirConteos(conteos: Record<EstadoClasificacion, number>) {
    const participantes = Object.values(conteos).reduce((total, cantidad) => total + cantidad, 0);

    return {
        participantes,
        llegados: conteos.Finalizo,
        pendientes: conteos.Pendiente,
        noFinalizaron: conteos.No_finalizo,
        descalificados: conteos.Descalificado,
        progreso: calcularProgreso(conteos.Finalizo, participantes),
    };
}

type CambioEstado = { permitido: true } | { permitido: false; motivo: string };

// Cambios manuales de estado (PATCH). "Finalizo" no pasa por acá: lo fija el registro de un resultado.
export function evaluarCambioEstado(
    actual: EstadoClasificacion,
    nuevo: EstadoClasificacion,
    tieneResultado: boolean
): CambioEstado {
    if (nuevo === "Descalificado") return { permitido: true };

    if (nuevo === "No_finalizo") {
        if (actual === "Descalificado") return { permitido: false, motivo: "El corredor está descalificado." };
        if (tieneResultado) return { permitido: false, motivo: "El corredor ya tiene un resultado registrado." };
        return { permitido: true };
    }

    return { permitido: false, motivo: `El estado ${nuevo} no se puede asignar manualmente.` };
}

// Orden de la tabla: primero los que tienen resultado (por puesto), luego el resto por apellido y nombre
export function compararPorPuesto(
    a: { resultado: { puestoGeneral: number } | null; corredor: { apellido: string; nombre: string } },
    b: { resultado: { puestoGeneral: number } | null; corredor: { apellido: string; nombre: string } }
): number {
    if (a.resultado && b.resultado) return a.resultado.puestoGeneral - b.resultado.puestoGeneral;
    if (a.resultado) return -1;
    if (b.resultado) return 1;
    return (
        a.corredor.apellido.localeCompare(b.corredor.apellido, "es") ||
        a.corredor.nombre.localeCompare(b.corredor.nombre, "es")
    );
}
