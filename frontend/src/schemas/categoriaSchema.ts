//frontend/src/schemas/categoriaSchema.ts
import { z } from 'zod'

const criterioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del criterio es obligatorio.'),
  valor: z.string().trim().min(1, 'El valor del criterio es obligatorio.'),
})

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria.').max(500, 'Máximo 500 caracteres.'),
  criterios: z.array(criterioSchema),
})