//backend/src/dtos/resultadoCategoria.dto.ts
import type { TipoDistancia } from "../generated/prisma/client";

export type GeneracionCategoriaDTO = {
    categoria: { id: string; nombre: string };
    omitida?: string; //motivo; solo en la generación de todas las categorías
    distancias: {
        kilometraje: number;
        tipoDistancia: TipoDistancia;
        asignados: number; //corredores con puesto en esta categoría
        sinGrupo: number; //con resultado pero sin subgrupo (en "Discapacidades" es normal que sea alto)
        grupos: { criterio: string; corredores: number }[];
    }[];
};

export type GeneracionCarreraDTO = {
    carreraId: string;
    categorias: GeneracionCategoriaDTO[];
};