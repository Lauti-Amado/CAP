//backend/src/rules/carrera.rules.ts
import type { EstadoCarrera } from "../generated/prisma/client";

type Transicion = { permitida: true } | { permitida: false; motivo: string };

// Las etapas anteriores a Entrega_kits las maneja el sistema web
export function evaluarInicio(estado: EstadoCarrera, hayOtraEnCurso: boolean): Transicion {
    if (estado !== "Entrega_kits") {
        return { permitida: false, motivo: "Solo se puede iniciar una carrera que está en etapa de entrega de kits." };
    }
    if (hayOtraEnCurso) return { permitida: false, motivo: "Ya hay otra carrera en curso." };
    return { permitida: true };
}

export function evaluarFinalizacion(estado: EstadoCarrera): Transicion {
    if (estado !== "En_curso") {
        return { permitida: false, motivo: "Solo se puede finalizar una carrera en curso." };
    }
    return { permitida: true };
}