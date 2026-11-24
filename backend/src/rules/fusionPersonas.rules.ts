//backend/src/rules/fusionPersonas.rules.ts
// Plan de fusión de dos Personas con el mismo DNI (ver docs/integracion/fusion-persona-dni-web.md).
// Es una función pura: recibe una foto de cada Persona y devuelve las operaciones a realizar, sin tocar la base.
// Quien ejecute el plan debe respetar el orden y no ejecutar nada si hay conflictos (ver tieneConflictos).
import type { EstadoInscripcion } from "../generated/prisma/client";

export type InscripcionResumen = {
    id: string;
    idCarrera: string;
    estado: EstadoInscripcion;
    tieneEntregaKit: boolean;
};

export type CorredorResumen = {
    id: string;
    afiliacionId: string | null;
    aptosMedicosIds: string[];
    inscripciones: InscripcionResumen[];
};

export type PersonaResumen = {
    id: string;
    usuarioId: string | null;
    corredor: CorredorResumen | null;
    // Corredores (de cualquier persona) que la tienen como contacto de emergencia
    contactoDeCorredoresIds: string[];
};

export type MotivoConflicto =
    | "AMBAS_TIENEN_USUARIO"
    | "AMBOS_SON_SOCIOS"
    | "INSCRIPCION_REPETIDA_EN_CARRERA"
    | "CONTACTO_DE_EMERGENCIA_PROPIO";

export type OperacionFusion =
    | {
          tipo: "repuntar";
          tabla: "Corredor" | "Usuario" | "AptoMedico" | "Afiliacion" | "Inscripcion";
          campo: string;
          id: string;
          hacia: string;
      }
    | { tipo: "eliminar"; tabla: "Persona" | "Corredor"; id: string }
    | { tipo: "conflicto"; motivo: MotivoConflicto; detalle: Record<string, string> };

export function tieneConflictos(plan: OperacionFusion[]): boolean {
    return plan.some((operacion) => operacion.tipo === "conflicto");
}

// Orden de preferencia para quedarse con una inscripción repetida: con kit entregado, luego Pagada, luego el resto
function prioridad(inscripcion: InscripcionResumen): number {
    if (inscripcion.tieneEntregaKit || inscripcion.estado === "Confirmada") return 4;
    if (inscripcion.estado === "Pagada") return 3;
    if (inscripcion.estado === "En_proceso") return 2;
    return 1;
}

// Gana la Persona canónica (la que ya existe en el servidor); la duplicada se elimina al final
export function planificarFusion(canonica: PersonaResumen, duplicada: PersonaResumen): OperacionFusion[] {
    if (canonica.id === duplicada.id) {
        throw new Error("La Persona canónica y la duplicada no pueden ser la misma.");
    }

    const plan: OperacionFusion[] = [];
    const corredorCanonico = canonica.corredor;
    const corredorDuplicado = duplicada.corredor;
    const seFusionanCorredores = corredorCanonico !== null && corredorDuplicado !== null;
    const corredorDuplicadoPasaALaCanonica = corredorDuplicado !== null && corredorCanonico === null;

    // 1. Corredores que tienen a la duplicada como contacto de emergencia
    for (const corredorId of duplicada.contactoDeCorredoresIds) {
        if (seFusionanCorredores && corredorId === corredorDuplicado.id) continue; // ese corredor se elimina
        const quedaComoCorredorDeLaCanonica =
            corredorId === corredorCanonico?.id ||
            (corredorDuplicadoPasaALaCanonica && corredorId === corredorDuplicado.id);
        if (quedaComoCorredorDeLaCanonica) {
            plan.push({ tipo: "conflicto", motivo: "CONTACTO_DE_EMERGENCIA_PROPIO", detalle: { corredorId } });
            continue;
        }
        plan.push({ tipo: "repuntar", tabla: "Corredor", campo: "contactoEmergenciaId", id: corredorId, hacia: canonica.id });
    }

    // 2. Usuario
    if (duplicada.usuarioId) {
        if (canonica.usuarioId) {
            plan.push({
                tipo: "conflicto",
                motivo: "AMBAS_TIENEN_USUARIO",
                detalle: { usuarioCanonicoId: canonica.usuarioId, usuarioDuplicadoId: duplicada.usuarioId },
            });
        } else {
            plan.push({ tipo: "repuntar", tabla: "Usuario", campo: "personaId", id: duplicada.usuarioId, hacia: canonica.id });
        }
    }

    // 3. Corredor
    if (corredorDuplicado) {
        if (!corredorCanonico) {
            plan.push({ tipo: "repuntar", tabla: "Corredor", campo: "personaId", id: corredorDuplicado.id, hacia: canonica.id });
        } else {
            plan.push(...planificarFusionDeCorredores(corredorCanonico, corredorDuplicado));
        }
    }

    // 4. La duplicada se elimina al final, cuando nada la referencia
    plan.push({ tipo: "eliminar", tabla: "Persona", id: duplicada.id });
    return plan;
}

function planificarFusionDeCorredores(canonico: CorredorResumen, duplicado: CorredorResumen): OperacionFusion[] {
    const plan: OperacionFusion[] = [];

    for (const aptoId of duplicado.aptosMedicosIds) {
        plan.push({ tipo: "repuntar", tabla: "AptoMedico", campo: "corredorId", id: aptoId, hacia: canonico.id });
    }

    if (duplicado.afiliacionId) {
        if (canonico.afiliacionId) {
            plan.push({
                tipo: "conflicto",
                motivo: "AMBOS_SON_SOCIOS",
                detalle: { afiliacionCanonicaId: canonico.afiliacionId, afiliacionDuplicadaId: duplicado.afiliacionId },
            });
        } else {
            plan.push({ tipo: "repuntar", tabla: "Afiliacion", campo: "afiliadoId", id: duplicado.afiliacionId, hacia: canonico.id });
        }
    }

    const inscripcionesCanonicas = new Map(canonico.inscripciones.map((i) => [i.idCarrera, i]));
    for (const inscripcion of duplicado.inscripciones) {
        const repetida = inscripcionesCanonicas.get(inscripcion.idCarrera);
        if (repetida) {
            plan.push({
                tipo: "conflicto",
                motivo: "INSCRIPCION_REPETIDA_EN_CARRERA",
                detalle: {
                    idCarrera: inscripcion.idCarrera,
                    inscripcionCanonicaId: repetida.id,
                    inscripcionDuplicadaId: inscripcion.id,
                    sugerida: prioridad(inscripcion) > prioridad(repetida) ? "duplicada" : "canonica",
                },
            });
        } else {
            plan.push({ tipo: "repuntar", tabla: "Inscripcion", campo: "idCorredor", id: inscripcion.id, hacia: canonico.id });
        }
    }

    plan.push({ tipo: "eliminar", tabla: "Corredor", id: duplicado.id });
    return plan;
}