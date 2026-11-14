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

export const corredorFormSchema = z
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
    }
  })

// Paso 1 completo: el corredor y su contacto de emergencia (que puede no estar elegido todavía)
export const inscripcionPaso1Schema = z
  .object({
    corredor: corredorFormSchema,
    contactoEmergencia: contactoEmergenciaSchema
      .nullable()
      .refine((contacto) => contacto !== null, 'Buscá o creá un contacto de emergencia.'),
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