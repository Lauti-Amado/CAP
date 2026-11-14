//frontend/src/utils/validar.ts
import { z } from 'zod'

export type ErroresFormulario = Record<string, string>

export type ResultadoValidacion<T> =
  | { ok: true; datos: T; errores: ErroresFormulario }
  | { ok: false; errores: ErroresFormulario }

// Valida con un schema de zod y devuelve el primer mensaje de cada campo.
// La clave es la ruta del campo (ej. "corredor.nombre" o "criterios.0.valor").
export function validar<S extends z.ZodType>(schema: S, valores: unknown): ResultadoValidacion<z.output<S>> {
  const resultado = schema.safeParse(valores)
  if (resultado.success) return { ok: true, datos: resultado.data, errores: {} }

  const errores: ErroresFormulario = {}
  for (const issue of resultado.error.issues) {
    const campo = issue.path.join('.')
    if (!(campo in errores)) errores[campo] = issue.message
  }
  return { ok: false, errores }
}