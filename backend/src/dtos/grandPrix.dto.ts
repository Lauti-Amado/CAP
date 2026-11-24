import type {
    Prisma,
    EstadoGrandPrix,
    EstadoCarrera,
    EstadoParticipacionGrandPrix,
    EstadoReglamentoGrandPrix,
    BasePuestoGrandPrix,
    Sexo,
    Discapacidad,
    TipoDistancia,
} from "../generated/prisma/client";

// Proyecciones compartidas entre las consultas del servicio y sus contratos de salida.
export const grandPrixInclude = {
    categorias: { orderBy: { nombre: "asc" } },
    pruebas: {
        include: {
            distanciaCarrera: { include: { carrera: true, distancia: true } },
            reglamento: { include: { reglas: true } },
        },
    },
    participaciones: {
        include: { corredor: { include: { persona: true, afiliacion: true } } },
    },
    reglamentos: { include: { reglas: true }, orderBy: { version: "desc" } },
} satisfies Prisma.GrandPrixInclude;
export const resumenGrandPrixInclude = {
    _count: { select: { participaciones: true, categorias: true } },
    pruebas: {
        where: { incluida: true },
        select: { distanciaCarrera: { select: { idCarrera: true } } },
    },
} satisfies Prisma.GrandPrixInclude;
export const cambioGrandPrixSelect = {
    id: true,
    fechaHora: true,
    accion: true,
    motivo: true,
    usuario: { select: { email: true } },
} satisfies Prisma.CambioGrandPrixSelect;
export const detalleCambioGrandPrixSelect = {
    datosAntes: true,
    datosDespues: true,
} satisfies Prisma.CambioGrandPrixSelect;
export const catalogoPruebaGrandPrixInclude = {
    carrera: true,
    distancia: true,
} satisfies Prisma.DistanciaCarreraInclude;
export const corredorGrandPrixInclude = {
    persona: true,
    afiliacion: true,
} satisfies Prisma.CorredorInclude;

export type GrandPrixPrisma = Prisma.GrandPrixGetPayload<{
    include: typeof grandPrixInclude;
}>;
type ResumenGrandPrixPrisma = Prisma.GrandPrixGetPayload<{
    include: typeof resumenGrandPrixInclude;
}>;
type CambioGrandPrixPrisma = Prisma.CambioGrandPrixGetPayload<{
    select: typeof cambioGrandPrixSelect;
}>;
type DetalleCambioGrandPrixPrisma = Prisma.CambioGrandPrixGetPayload<{
    select: typeof detalleCambioGrandPrixSelect;
}>;
type CatalogoPruebaGrandPrixPrisma = Prisma.DistanciaCarreraGetPayload<{
    include: typeof catalogoPruebaGrandPrixInclude;
}>;
type CorredorGrandPrixPrisma = Prisma.CorredorGetPayload<{
    include: typeof corredorGrandPrixInclude;
}>;
type ParticipacionGrandPrixPrisma = GrandPrixPrisma["participaciones"][number];
type PruebaGrandPrixPrisma = GrandPrixPrisma["pruebas"][number];

export type RecursoGrandPrixDTO = { id: string };
export type RecalculoGrandPrixDTO = { aportes: number };
export type ConfiguracionGrandPrixDTO = {
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
    fechaReferenciaEdad: Date;
    minimoCarrerasCalendario: number;
    minimoParticipacionesCorredor: number;
    exigeAfiliacion: boolean;
    admiteResultadosPrevios: boolean;
};
export type ResumenGrandPrixDTO = {
    id: string;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoGrandPrix;
    necesitaRecalculo: boolean;
    participantes: number;
    categorias: number;
    carreras: number;
};
export type CategoriaGrandPrixDTO = {
    id: string;
    grandPrixId: string;
    nombre: string;
    sexo: Sexo | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    discapacidad: Discapacidad | null;
};
export type PruebaGrandPrixDTO = {
    id: string;
    incluida: boolean;
    distanciaCarreraId: string;
    carreraId: string;
    carrera: string;
    fecha: Date;
    estadoCarrera: EstadoCarrera;
    kilometraje: number;
    tipoDistancia: TipoDistancia;
    reglamentoId: string | null;
    version: number | null;
};
export type ParticipacionGrandPrixDTO = {
    id: string;
    corredorId: string;
    categoriaId: string;
    estado: EstadoParticipacionGrandPrix;
    fechaInscripcion: Date;
    afiliacionVerificada: boolean;
    nombre: string;
    dni: string;
};
export type ReglaPuntajeGrandPrixDTO = {
    pruebaId: string;
    puesto: number;
    puntos: number;
};
export type ReglamentoGrandPrixDTO = {
    id: string;
    version: number;
    estado: EstadoReglamentoGrandPrix;
    basePuesto: BasePuestoGrandPrix;
    fechaPublicacion: Date | null;
    reglas: ReglaPuntajeGrandPrixDTO[];
};
export type CambioGrandPrixDTO = {
    id: string;
    fechaHora: Date;
    accion: string;
    motivo: string;
    actor: string;
};
export type DetalleCambioGrandPrixDTO = {
    datosAntes: string | null;
    datosDespues: string | null;
};
export type GrandPrixDTO = ConfiguracionGrandPrixDTO & {
    id: string;
    estado: EstadoGrandPrix;
    necesitaRecalculo: boolean;
    categorias: CategoriaGrandPrixDTO[];
    pruebas: PruebaGrandPrixDTO[];
    participaciones: ParticipacionGrandPrixDTO[];
    reglamentos: ReglamentoGrandPrixDTO[];
    cambios: CambioGrandPrixDTO[];
};
export type CatalogoPruebaGrandPrixDTO = {
    distanciaCarreraId: string;
    carreraId: string;
    carrera: string;
    fecha: Date;
    estadoCarrera: EstadoCarrera;
    kilometraje: number;
};
export type CorredorGrandPrixDTO = {
    id: string;
    nombre: string;
    dni: string;
    sexo: Sexo;
    fechaNacimiento: Date;
    discapacidad: Discapacidad | null;
    afiliado: boolean;
};
export type CambioPuntajeGrandPrixDTO = {
    participacionId: string;
    nombre: string;
    antes: number;
    despues: number;
};
export type PrevisualizacionGrandPrixDTO = {
    cambios: CambioPuntajeGrandPrixDTO[];
    aportes: number;
};
export type DetallePuntajeGrandPrixDTO = {
    pruebaId: string;
    puntos: number;
    puestoCategoria: number;
    reglamentoId: string;
    carrera: string;
    kilometraje: number;
};
export type FilaTablaGrandPrixDTO = {
    id: string;
    corredorId: string;
    nombre: string;
    dni: string;
    sexo: Sexo;
    categoriaId: string;
    categoria: string;
    puntos: number;
    carrerasCompletadas: number;
    elegible: boolean;
    detalles: DetallePuntajeGrandPrixDTO[];
    puesto: number | null;
    puestoCategoria: number | null;
};
export type TablaGrandPrixDTO = {
    grandPrix: {
        id: string;
        nombre: string;
        estado: EstadoGrandPrix;
        necesitaRecalculo: boolean;
        minimoParticipacionesCorredor: number;
        minimoCarrerasCalendario: number;
    };
    carreras: number;
    carrerasFinalizadas: number;
    calendarioCumplido: boolean;
    provisional: boolean;
    filas: FilaTablaGrandPrixDTO[];
};

export function toConfiguracionGrandPrixDTO(
    gp: GrandPrixPrisma,
): ConfiguracionGrandPrixDTO {
    return {
        nombre: gp.nombre,
        fechaInicio: gp.fechaInicio,
        fechaFin: gp.fechaFin,
        fechaReferenciaEdad: gp.fechaReferenciaEdad,
        minimoCarrerasCalendario: gp.minimoCarrerasCalendario,
        minimoParticipacionesCorredor: gp.minimoParticipacionesCorredor,
        exigeAfiliacion: gp.exigeAfiliacion,
        admiteResultadosPrevios: gp.admiteResultadosPrevios,
    };
}
export function toResumenGrandPrixDTO(
    gp: ResumenGrandPrixPrisma,
): ResumenGrandPrixDTO {
    return {
        id: gp.id,
        nombre: gp.nombre,
        fechaInicio: gp.fechaInicio,
        fechaFin: gp.fechaFin,
        estado: gp.estado,
        necesitaRecalculo: gp.necesitaRecalculo,
        participantes: gp._count.participaciones,
        categorias: gp._count.categorias,
        carreras: new Set(gp.pruebas.map((p) => p.distanciaCarrera.idCarrera))
            .size,
    };
}
export function toCategoriaGrandPrixDTO(
    c: GrandPrixPrisma["categorias"][number],
): CategoriaGrandPrixDTO {
    return {
        id: c.id,
        grandPrixId: c.grandPrixId,
        nombre: c.nombre,
        sexo: c.sexo,
        edadMinima: c.edadMinima,
        edadMaxima: c.edadMaxima,
        discapacidad: c.discapacidad,
    };
}
export function toPruebaGrandPrixDTO(
    p: PruebaGrandPrixPrisma,
): PruebaGrandPrixDTO {
    return {
        id: p.id,
        incluida: p.incluida,
        distanciaCarreraId: p.distanciaCarreraId,
        carreraId: p.distanciaCarrera.idCarrera,
        carrera: p.distanciaCarrera.carrera.nombre,
        fecha: p.distanciaCarrera.carrera.fechaHoraCarrera,
        estadoCarrera: p.distanciaCarrera.carrera.estado,
        kilometraje: p.distanciaCarrera.distancia.kilometraje,
        tipoDistancia: p.distanciaCarrera.distancia.tipoDistancia,
        reglamentoId: p.reglamentoId,
        version: p.reglamento?.version ?? null,
    };
}
export function toParticipacionGrandPrixDTO(
    p: ParticipacionGrandPrixPrisma,
): ParticipacionGrandPrixDTO {
    return {
        id: p.id,
        corredorId: p.corredorId,
        categoriaId: p.categoriaId,
        estado: p.estado,
        fechaInscripcion: p.fechaInscripcion,
        afiliacionVerificada: p.afiliacionVerificada,
        nombre: `${p.corredor.persona.apellido}, ${p.corredor.persona.nombre}`,
        dni: p.corredor.persona.dni,
    };
}
export function toReglamentoGrandPrixDTO(
    r: GrandPrixPrisma["reglamentos"][number],
): ReglamentoGrandPrixDTO {
    return {
        id: r.id,
        version: r.version,
        estado: r.estado,
        basePuesto: r.basePuesto,
        fechaPublicacion: r.fechaPublicacion,
        reglas: r.reglas.map(({ pruebaId, puesto, puntos }) => ({
            pruebaId,
            puesto,
            puntos,
        })),
    };
}
export function toCambioGrandPrixDTO(
    c: CambioGrandPrixPrisma,
): CambioGrandPrixDTO {
    return {
        id: c.id,
        fechaHora: c.fechaHora,
        accion: c.accion,
        motivo: c.motivo,
        actor: c.usuario?.email ?? "Sistema",
    };
}
export function toDetalleCambioGrandPrixDTO(
    c: DetalleCambioGrandPrixPrisma,
): DetalleCambioGrandPrixDTO {
    return { datosAntes: c.datosAntes, datosDespues: c.datosDespues };
}
export function toGrandPrixDTO(
    gp: GrandPrixPrisma,
    cambios: CambioGrandPrixPrisma[],
): GrandPrixDTO {
    return {
        id: gp.id,
        ...toConfiguracionGrandPrixDTO(gp),
        estado: gp.estado,
        necesitaRecalculo: gp.necesitaRecalculo,
        categorias: gp.categorias.map(toCategoriaGrandPrixDTO),
        pruebas: gp.pruebas
            .map(toPruebaGrandPrixDTO)
            .sort(
                (a, b) =>
                    a.fecha.getTime() - b.fecha.getTime() ||
                    a.kilometraje - b.kilometraje,
            ),
        participaciones: gp.participaciones.map(toParticipacionGrandPrixDTO),
        reglamentos: gp.reglamentos.map(toReglamentoGrandPrixDTO),
        cambios: cambios.map(toCambioGrandPrixDTO),
    };
}
export function toCatalogoPruebaGrandPrixDTO(
    p: CatalogoPruebaGrandPrixPrisma,
): CatalogoPruebaGrandPrixDTO {
    return {
        distanciaCarreraId: p.id,
        carreraId: p.idCarrera,
        carrera: p.carrera.nombre,
        fecha: p.carrera.fechaHoraCarrera,
        estadoCarrera: p.carrera.estado,
        kilometraje: p.distancia.kilometraje,
    };
}
export function toCorredorGrandPrixDTO(
    c: CorredorGrandPrixPrisma,
): CorredorGrandPrixDTO {
    return {
        id: c.id,
        nombre: `${c.persona.apellido}, ${c.persona.nombre}`,
        dni: c.persona.dni,
        sexo: c.sexo,
        fechaNacimiento: c.fechaNacimiento,
        discapacidad: c.discapacidad,
        afiliado: c.afiliacion !== null,
    };
}
export function toPrevisualizacionGrandPrixDTO(
    cambios: {
        participacion: ParticipacionGrandPrixPrisma;
        antes: number;
        despues: number;
    }[],
    aportes: number,
): PrevisualizacionGrandPrixDTO {
    return {
        cambios: cambios.map((c) => ({
            participacionId: c.participacion.id,
            nombre: `${c.participacion.corredor.persona.apellido}, ${c.participacion.corredor.persona.nombre}`,
            antes: c.antes,
            despues: c.despues,
        })),
        aportes,
    };
}
export function toDetallePuntajeGrandPrixDTO(
    aporte: Pick<
        Prisma.PuntajeGrandPrixGetPayload<{}>,
        "pruebaId" | "puntos" | "puestoCategoria" | "reglamentoId"
    >,
    prueba: PruebaGrandPrixPrisma,
): DetallePuntajeGrandPrixDTO {
    return {
        pruebaId: aporte.pruebaId,
        puntos: aporte.puntos,
        puestoCategoria: aporte.puestoCategoria,
        reglamentoId: aporte.reglamentoId,
        carrera: prueba.distanciaCarrera.carrera.nombre,
        kilometraje: prueba.distanciaCarrera.distancia.kilometraje,
    };
}
export function toFilaTablaGrandPrixDTO(
    p: ParticipacionGrandPrixPrisma,
    calculo: Pick<
        FilaTablaGrandPrixDTO,
        "categoria" | "puntos" | "carrerasCompletadas" | "elegible" | "detalles"
    >,
): FilaTablaGrandPrixDTO {
    return {
        id: p.id,
        corredorId: p.corredorId,
        nombre: `${p.corredor.persona.apellido}, ${p.corredor.persona.nombre}`,
        dni: p.corredor.persona.dni,
        sexo: p.corredor.sexo,
        categoriaId: p.categoriaId,
        ...calculo,
        puesto: null,
        puestoCategoria: null,
    };
}
export function toTablaGrandPrixDTO(
    gp: GrandPrixPrisma,
    calculo: Omit<TablaGrandPrixDTO, "grandPrix">,
): TablaGrandPrixDTO {
    return {
        grandPrix: {
            id: gp.id,
            nombre: gp.nombre,
            estado: gp.estado,
            necesitaRecalculo: gp.necesitaRecalculo,
            minimoParticipacionesCorredor: gp.minimoParticipacionesCorredor,
            minimoCarrerasCalendario: gp.minimoCarrerasCalendario,
        },
        ...calculo,
    };
}
