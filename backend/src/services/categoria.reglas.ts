//backend/src/services/categoria.reglas.ts
import { Discapacidad, Sexo } from "../generated/prisma/client";

export type DatosCorredor = {
    sexo: Sexo;
    fechaNacimiento: Date;
    discapacidad: Discapacidad | null;
};

// Condiciones que debe cumplir un corredor para entrar en un subgrupo (todas las presentes)
export type CondicionGrupo = {
    sexo?: Sexo;
    discapacidad?: Discapacidad;
    edad?: { min: number; max: number };
};

export type Grupo = { criterioId: string; condicion: CondicionGrupo };

export type Participante = DatosCorredor & { resultadoId: string; puestoGeneral: number };

export type AsignacionCategoria = { resultadoId: string; criterioId: string; puesto: number };

const FORMATO_SEXO_EDAD = /^(masculino|femenino)?\s*(?:(\d+)\s*a\s*(\d+))?$/i;

// Traduce el `valor` de un criterio a condiciones. Devuelve null si el formato no se reconoce.
// Formatos: "18 a 24", "Masculino 18 a 24", "Femenino", "Discapacidad_visual"
export function interpretarCriterio(valor: string): CondicionGrupo | null {
    const texto = valor.trim();

    const discapacidad = Object.values(Discapacidad).find((d) => d === texto);
    if (discapacidad) return { discapacidad };

    const partes = FORMATO_SEXO_EDAD.exec(texto);
    if (!partes || (!partes[1] && !partes[2])) return null;

    const [, sexoTexto, min, max] = partes;
    const condicion: CondicionGrupo = {};

    if (sexoTexto) condicion.sexo = sexoTexto.toLowerCase() === "masculino" ? "Masculino" : "Femenino";

    if (min !== undefined && max !== undefined) {
        if (Number(min) > Number(max)) return null;
        condicion.edad = { min: Number(min), max: Number(max) };
    }

    return condicion;
}

// Años cumplidos en la fecha indicada (por ejemplo, la de la carrera)
export function calcularEdad(fechaNacimiento: Date, enFecha: Date): number {
    const edad = enFecha.getUTCFullYear() - fechaNacimiento.getUTCFullYear();
    const todaviaNoCumplio =
        enFecha.getUTCMonth() < fechaNacimiento.getUTCMonth() ||
        (enFecha.getUTCMonth() === fechaNacimiento.getUTCMonth() &&
            enFecha.getUTCDate() < fechaNacimiento.getUTCDate());

    return todaviaNoCumplio ? edad - 1 : edad;
}

export function cumpleCondicion(condicion: CondicionGrupo, corredor: DatosCorredor, fechaCarrera: Date): boolean {
    if (condicion.sexo && corredor.sexo !== condicion.sexo) return false;
    if (condicion.discapacidad && corredor.discapacidad !== condicion.discapacidad) return false;
    if (condicion.edad) {
        const edad = calcularEdad(corredor.fechaNacimiento, fechaCarrera);
        if (edad < condicion.edad.min || edad > condicion.edad.max) return false;
    }
    return true;
}

// Ubica a cada participante en su subgrupo (uno solo por categoría) y numera los puestos por orden de llegada general.
// sinGrupo: no encajan en ninguno. conflictos: encajan en más de uno (criterios que se superponen).
export function asignarPuestosPorGrupo(participantes: Participante[], grupos: Grupo[], fechaCarrera: Date) {
    const ordenados = [...participantes].sort((a, b) => a.puestoGeneral - b.puestoGeneral);
    const contadores = new Map<string, number>();
    const asignaciones: AsignacionCategoria[] = [];
    const sinGrupo: string[] = [];
    const conflictos: string[] = [];

    for (const participante of ordenados) {
        const coincidencias = grupos.filter((g) => cumpleCondicion(g.condicion, participante, fechaCarrera));

        if (coincidencias.length === 0) {
            sinGrupo.push(participante.resultadoId);
            continue;
        }
        if (coincidencias.length > 1) {
            conflictos.push(participante.resultadoId);
            continue;
        }

        const [grupo] = coincidencias;
        const puesto = (contadores.get(grupo.criterioId) ?? 0) + 1;
        contadores.set(grupo.criterioId, puesto);
        asignaciones.push({ resultadoId: participante.resultadoId, criterioId: grupo.criterioId, puesto });
    }

    return { asignaciones, sinGrupo, conflictos };
}