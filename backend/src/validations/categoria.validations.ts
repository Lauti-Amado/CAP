import { z } from "zod";

const criterioCategoriaSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre del criterio es obligatorio."),
    valor: z.string().trim().min(1, "El valor del criterio es obligatorio."),
}).strict();

export const crearCategoriaSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(100),
    descripcion: z.string().trim().min(1, "La descripción es obligatoria.").max(500),
    criterios: z.array(criterioCategoriaSchema),
}).strict();

export const actualizarCategoriaSchema = crearCategoriaSchema;

export type DatosCategoria = z.infer<typeof crearCategoriaSchema>;