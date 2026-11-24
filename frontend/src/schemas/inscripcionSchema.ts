//frontend/src/schemas/inscripcionSchema.ts
import { z } from 'zod'

const dni = z.string().trim().regex(/^\d{7,8}$/, 'DNI inválido: ingresá solo números, sin puntos')
const texto = z.string().trim().min(1, 'Campo obligatorio').max(100, 'Máximo 100 caracteres')
const telefono = z.string().trim().min(6, 'Teléfono inválido').max(30, 'Teléfono inválido')

// Los inputs de fecha entregan "YYYY-MM-DD"
const aFecha = (valor: string) => new Date(`${valor}T00:00:00`)
const hoy = () => {
  const fecha = new Date()
  fecha.setHours(0, 0, 0, 0)
  return fecha
}

export const contactoEmergenciaSchema = z.object({
  dni,
  nombre: texto,
  apellido: texto,
  telefono,
})

// El apto médico debe cubrir hasta la fecha de la carrera (si se conoce)
export const crearCorredorFormSchema = (fechaCarreraISO?: string) =>
  z
    .object({
      nombre: texto,
      apellido: texto,
      genero: z.enum(['Femenino', 'Masculino'], { error: 'Seleccioná el género' }),
      fechaNacimiento: z
        .string()
        .min(1, 'Ingresá la fecha de nacimiento')
        .refine((valor) => aFecha(valor) <= new Date(), 'La fecha de nacimiento no puede ser futura'),
      dni,
      telefono,
      discapacidad: z.enum(['', 'Ninguna', 'Visual', 'Silla de ruedas', 'Otra']),
      aptoMedico: z.boolean(),
      vencimientoAptoMedico: z.string(),
    })
    .superRefine((datos, ctx) => {
      if (!datos.aptoMedico) return

      if (datos.vencimientoAptoMedico === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['vencimientoAptoMedico'],
          message: 'Ingresá la fecha de vencimiento del apto médico para continuar.',
        })
        return
      }

      if (aFecha(datos.vencimientoAptoMedico) <= hoy()) {
        ctx.addIssue({
          code: 'custom',
          path: ['vencimientoAptoMedico'],
          message: 'El apto médico está vencido. Cambiá la fecha por una futura para continuar con la inscripción.',
        })
        return
      }

      if (fechaCarreraISO && datos.vencimientoAptoMedico < fechaCarreraISO) {
        ctx.addIssue({
          code: 'custom',
          path: ['vencimientoAptoMedico'],
          message: `El apto médico debe estar vigente hasta la fecha de la carrera (${fechaCarreraISO}).`,
        })
      }
    })

export const corredorFormSchema = crearCorredorFormSchema()

// Paso 1 completo: el corredor y su contacto de emergencia (que puede no estar elegido todavía)
export const crearInscripcionPaso1Schema = (fechaCarreraISO?: string) =>
  z
    .object({
      corredor: crearCorredorFormSchema(fechaCarreraISO),
      contactoEmergencia: contactoEmergenciaSchema
        .nullable()
        .refine((contacto): boolean => contacto !== null, 'Buscá o creá un contacto de emergencia.'),
    })
    .superRefine((datos, ctx) => {
      if (datos.contactoEmergencia && datos.corredor.dni === datos.contactoEmergencia.dni) {
        ctx.addIssue({
          code: 'custom',
          path: ['contactoEmergencia', 'dni'],
          message: 'El contacto de emergencia no puede ser el mismo corredor.',
        })
      }
    })

export const inscripcionPaso1Schema = crearInscripcionPaso1Schema()

// Paso 2: distancia y producto opcional. Espeja las reglas del backend (crearInscripcionSchema):
// kilometraje positivo, tipo de distancia válido y cantidad entera de 1 a 10.
// El stock y el cupo dependen de la carrera y se controlan en la pantalla.
const CANTIDAD_MAXIMA_PRODUCTO = 10

export const inscripcionPaso2Schema = z
  .object({
    // Clave "kilometraje|tipoDistancia" (ej. "10|Competitiva")
    distancia: z
      .string()
      .min(1, 'Seleccioná una distancia.')
      .regex(/^\d+(\.\d+)?\|(Participativa|Competitiva)$/, 'La distancia seleccionada no es válida.')
      .refine((valor) => Number.parseFloat(valor.split('|')[0]) > 0, 'La distancia seleccionada no es válida.'),
    productoDinamico: z.enum(['si', 'no']),
    productoId: z.string(),
    varianteId: z.string(),
    cantidad: z.string(),
  })
  .superRefine((datos, ctx) => {
    if (datos.productoDinamico === 'no') return

    if (datos.productoId === '') {
      ctx.addIssue({ code: 'custom', path: ['productoId'], message: 'Seleccioná un producto.' })
      return
    }

    if (datos.varianteId === '') {
      ctx.addIssue({ code: 'custom', path: ['varianteId'], message: 'Seleccioná una variante.' })
      return
    }

    const cantidad = Number(datos.cantidad)
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > CANTIDAD_MAXIMA_PRODUCTO) {
      ctx.addIssue({
        code: 'custom',
        path: ['cantidad'],
        message: `La cantidad debe ser un número entero de 1 a ${CANTIDAD_MAXIMA_PRODUCTO}.`,
      })
    }
  })

export type ContactoEmergenciaForm = z.infer<typeof contactoEmergenciaSchema>
export type InscripcionPaso1Form = z.infer<typeof inscripcionPaso1Schema>
export type InscripcionPaso2Form = z.infer<typeof inscripcionPaso2Schema>