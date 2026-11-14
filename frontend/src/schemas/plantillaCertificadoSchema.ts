//frontend/src/schemas/plantillaCertificadoSchema.ts
import { z } from 'zod'

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido (#RRGGBB)')

export const plantillaCertificadoSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  style: z.object({
    primaryColor: color,
    secondaryColor: color,
    backgroundColor: color,
    fontFamily: z.string().trim().min(1).max(100),
    rounded: z.boolean(),
    shadows: z.boolean(),
    watermark: z.boolean(),
  }),
})