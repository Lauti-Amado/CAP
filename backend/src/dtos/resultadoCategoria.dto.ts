//backend/src/dtos/resultadoCategoria.dto.ts
export type GeneracionCategoriaDTO = {
    carreraId: string;
    categoria: { id: string; nombre: string };
    asignados: number; //corredores con puesto de categoría
    sinGrupo: number; //corredores con resultado que no encajan en ningún subgrupo
    grupos: { criterio: string; corredores: number }[];
};