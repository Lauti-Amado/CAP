//backend/src/validations/resultadoCategoria.validations.ts
import { z } from "zod";

// POST /api/carreras/:id/categorias/:categoriaId/resultados
export const carreraCategoriaParamsSchema = z.object({
    id: z.uuid("El ID de la carrera debe ser un UUID válido"),
    categoriaId: z.uuid("El ID de la categoría debe ser un UUID válido"),
});