import { calcularEdad } from "./categoria.reglas";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type { Sexo, Discapacidad } from "../generated/prisma/client";

export type CategoriaGP = {
    id: string;
    nombre: string;
    sexo: Sexo | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    discapacidad: Discapacidad | null;
};
export type CorredorGP = {
    id: string;
    sexo: Sexo;
    fechaNacimiento: Date;
    discapacidad: Discapacidad | null;
};
export type ParticipanteGP = {
    id: string;
    corredorId: string;
    categoriaId: string;
    estado: string;
    fechaInscripcion: Date;
    afiliacionVerificada: boolean;
};
export type ResultadoGP = {
    id: string;
    puestoGeneral: number;
    corredor: CorredorGP;
};
export type PruebaGP = {
    id: string;
    carreraId: string;
    fechaCarrera: Date;
    estadoCarrera: string;
    incluida: boolean;
    reglamentoId: string | null;
    basePuesto: "TodosCarrera" | "ParticipantesGrandPrix";
    reglas: { puesto: number; puntos: number }[];
    resultados: ResultadoGP[];
};
export type AporteGP = {
    participacionId: string;
    pruebaId: string;
    resultadoId: string;
    reglamentoId: string;
    puestoCategoria: number;
    puntos: number;
};

export function cumpleCategoria(
    categoria: CategoriaGP,
    corredor: CorredorGP,
    fechaEdad: Date,
): boolean {
    const edad = calcularEdad(corredor.fechaNacimiento, fechaEdad);
    return (
        (!categoria.sexo || categoria.sexo === corredor.sexo) &&
        (!categoria.discapacidad ||
            categoria.discapacidad === corredor.discapacidad) &&
        edad >= (categoria.edadMinima ?? 0) &&
        edad <= (categoria.edadMaxima ?? 120)
    );
}

export function categoriasSeSuperponen(
    a: CategoriaGP,
    b: CategoriaGP,
): boolean {
    return (
        (!a.sexo || !b.sexo || a.sexo === b.sexo) &&
        (!a.discapacidad ||
            !b.discapacidad ||
            a.discapacidad === b.discapacidad) &&
        Math.max(a.edadMinima ?? 0, b.edadMinima ?? 0) <=
            Math.min(a.edadMaxima ?? 120, b.edadMaxima ?? 120)
    );
}

// Cálculo puro. Cada resultado de entrada ya debe estar oficializado y habilitado.
export function calcularAportes(datos: {
    fechaReferenciaEdad: Date;
    exigeAfiliacion: boolean;
    admiteResultadosPrevios: boolean;
    categorias: CategoriaGP[];
    participantes: ParticipanteGP[];
    pruebas: PruebaGP[];
}): AporteGP[] {
    const participantes = new Map(
        datos.participantes
            .filter(
                (p) =>
                    p.estado === "Activa" &&
                    (!datos.exigeAfiliacion || p.afiliacionVerificada),
            )
            .map((p) => [p.corredorId, p]),
    );
    const aportes: AporteGP[] = [];
    const carrerasPorParticipante = new Set<string>();
    for (const prueba of datos.pruebas) {
        if (!prueba.incluida || prueba.estadoCarrera !== "Finalizada") continue;
        if (!prueba.reglamentoId)
            throw new ErrorReglaDeNegocio(
                "Hay una prueba finalizada sin reglamento asignado.",
            );
        const puestos = new Set<number>();
        const corredores = new Set<string>();
        const ordenados = [...prueba.resultados].sort(
            (a, b) => a.puestoGeneral - b.puestoGeneral,
        );
        const contador = new Map<string, number>();
        const puntosPorPuesto = new Map(
            prueba.reglas.map((r) => [r.puesto, r.puntos]),
        );
        for (const resultado of ordenados) {
            if (
                puestos.has(resultado.puestoGeneral) ||
                corredores.has(resultado.corredor.id)
            ) {
                throw new ErrorReglaDeNegocio(
                    "La prueba tiene puestos o corredores duplicados. Corregí sus resultados antes de puntuar.",
                );
            }
            puestos.add(resultado.puestoGeneral);
            corredores.add(resultado.corredor.id);
            const grupos = datos.categorias.filter((c) =>
                cumpleCategoria(
                    c,
                    resultado.corredor,
                    datos.fechaReferenciaEdad,
                ),
            );
            if (grupos.length > 1)
                throw new ErrorReglaDeNegocio(
                    "Hay categorías de Grand Prix que se superponen.",
                );
            const categoria = grupos[0];
            if (!categoria) continue;
            const participante = participantes.get(resultado.corredor.id);
            const habilitado =
                participante &&
                participante.categoriaId === categoria.id &&
                (datos.admiteResultadosPrevios ||
                    participante.fechaInscripcion <= prueba.fechaCarrera);
            if (prueba.basePuesto === "ParticipantesGrandPrix" && !habilitado)
                continue;
            const puesto = (contador.get(categoria.id) ?? 0) + 1;
            contador.set(categoria.id, puesto);
            if (!habilitado) continue;
            const claveCarrera = `${participante.id}:${prueba.carreraId}`;
            if (carrerasPorParticipante.has(claveCarrera)) {
                throw new ErrorReglaDeNegocio(
                    "Un corredor tiene resultados en dos distancias del mismo evento. Solo se admite un aporte por carrera.",
                );
            }
            carrerasPorParticipante.add(claveCarrera);
            aportes.push({
                participacionId: participante.id,
                pruebaId: prueba.id,
                resultadoId: resultado.id,
                reglamentoId: prueba.reglamentoId,
                puestoCategoria: puesto,
                puntos: puntosPorPuesto.get(puesto) ?? 0,
            });
        }
    }
    return aportes;
}

// Empates compartidos (1, 1, 3). El nombre ordena la presentación, no desempata.
export function asignarPosiciones<T extends { puntos: number; nombre: string }>(
    filas: T[],
): (T & { puesto: number })[] {
    const ordenadas = [...filas].sort(
        (a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre, "es"),
    );
    let puesto = 0;
    return ordenadas.map((fila, i) => {
        if (i === 0 || fila.puntos !== ordenadas[i - 1].puntos) puesto = i + 1;
        return { ...fila, puesto };
    });
}
