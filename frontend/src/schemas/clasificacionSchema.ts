//frontend/src/schemas/clasificacionSchema.ts
import { z } from 'zod'

const INT_MAX = 2147483647 // Límite de un Int de Prisma/SQLite (igual que el backend)

const FORMATO_TIEMPO = /^(\d{1,2}):([0-5]\d):([0-5]\d)(?:\.(\d{1,3}))?$/

// "01:45:23" o "01:45:23.450" -> milisegundos (NaN si el texto no tiene ese formato)
export function tiempoAMilisegundos(texto: string): number {
  const coincidencia = FORMATO_TIEMPO.exec(texto)
  if (!coincidencia) return NaN

  const [, horas, minutos, segundos, fraccion = '0'] = coincidencia
  const base = Number(horas) * 3600 + Number(minutos) * 60 + Number(segundos)
  return base * 1000 + Number(fraccion.padEnd(3, '0'))
}

const puestoTexto = z.string().trim().regex(/^\d+$/, 'Ingresá solo números')

// Carga manual: solo el puesto, que tiene que existir dentro de los participantes de la carrera
export const puestoManualSchema = (totalParticipantes: number) =>
  z.object({
    puesto: puestoTexto.refine(
      (valor) => Number(valor) >= 1 && Number(valor) <= totalParticipantes,
      `El puesto debe estar entre 1 y ${totalParticipantes.toLocaleString('es-AR')}.`,
    ),
  })

// Modificación: puesto y tiempo. Devuelve el cuerpo de PUT /api/clasificaciones/:id/resultado
export const resultadoClasificacionSchema = z
  .object({
    tiempoOficial: z
      .string()
      .trim()
      .regex(FORMATO_TIEMPO, 'Formato inválido. Usá HH:MM:SS o HH:MM:SS.mmm (ej. 01:45:23.450)')
      .refine((valor) => tiempoAMilisegundos(valor) > 0, 'El tiempo debe ser mayor a cero')
      .refine((valor) => tiempoAMilisegundos(valor) <= INT_MAX, 'El tiempo es demasiado grande'),
    puestoGeneral: puestoTexto.refine(
      (valor) => Number(valor) >= 1 && Number(valor) <= INT_MAX,
      'El puesto debe ser un número mayor a cero',
    ),
  })
  .transform((datos) => ({
    puestoGeneral: Number(datos.puestoGeneral),
    tiempoLlegada: tiempoAMilisegundos(datos.tiempoOficial),
  }))