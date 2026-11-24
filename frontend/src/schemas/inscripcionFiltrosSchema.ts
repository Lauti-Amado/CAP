//frontend/src/schemas/inscripcionFiltrosSchema.ts
import { z } from 'zod'

// Filtros del listado de inscripciones. Espeja listadoQuerySchema del backend:
// DNI parcial de hasta 8 dígitos y año entre 2000 y 2100. Todos son opcionales ('' = sin filtro).
export const filtrosInscripcionesSchema = z.object({
  dni: z.string().trim().regex(/^\d{0,8}$/, 'Ingresá solo números (hasta 8 dígitos).'),
  carreraId: z.string(),
  kilometraje: z.string(),
  tipoDistancia: z.enum(['', 'Participativa', 'Competitiva']),
  pago: z.enum(['', 'true', 'false']),
  estado: z.enum(['', 'En_proceso', 'Pagada', 'Confirmada', 'Anulada']),
  anio: z
    .string()
    .trim()
    .refine(
      (valor) => valor === '' || (/^\d{4}$/.test(valor) && Number(valor) >= 2000 && Number(valor) <= 2100),
      'El año debe estar entre 2000 y 2100.'
    ),
})

export type FiltrosInscripcionesForm = z.infer<typeof filtrosInscripcionesSchema>