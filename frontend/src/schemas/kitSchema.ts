//frontend/src/schemas/kitSchema.ts
import { z } from 'zod'

export const dniBusquedaSchema = z.object({
  dni: z.string().trim().regex(/^\d{7,8}$/, 'Ingresá un DNI válido: solo números, sin puntos (7 u 8 dígitos).'),
})

export const dorsalSchema = z.object({
  dorsal: z
    .string()
    .trim()
    .regex(/^\d{1,5}$/, 'El dorsal debe ser un número de hasta 5 dígitos')
    .refine((valor) => Number(valor) > 0, 'El dorsal debe ser mayor a cero'),
})