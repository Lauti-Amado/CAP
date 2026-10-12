import { z } from "zod";

const personaSchema = z.object({
  nombre: z.string()
    .trim()
    .min(1, "El nombre es obligatorio").max(100),
  apellido: z.string()
    .trim()
    .min(1, "El apellido es obligatorio").max(100),
  dni: z.string()
    .trim()
    .regex(/^\d{7,8}$/, "DNI inválido, ingresa solo números sin puntos"),
  telefono: z.string()
    .trim()
    .min(6, "Teléfono inválido"),
})

const email = z.string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Email inválido"))

//Para registrar a un nuevo corredor
export const registroCorredorSchema = z.object({
  nombre: z.string()
    .trim()
    .min(1, "El nombre es obligatorio").max(100),

  apellido: z.string()
    .trim()
    .min(1, "El apellido es obligatorio").max(100),

  dni: z.string()
    .trim()
    .regex(/^\d{7,8}$/, "DNI inválido, ingresa solo números sin puntos"),

  telefono: z.string()
    .trim()
    .min(6, "Teléfono inválido"),
  
  //Datos de corredor (adentro de corredor.dato)
  corredor: z.object({
    fechaNacimiento: z.coerce.date()
      .max(new Date(), "La fecha de nacimiento no puede ser en el futuro"),
    sexo: z.enum(["Masculino", "Femenino"],
      { message: "El sexo debe ser Masculino o Femenino" }),
    discapacidad: z.enum(["Discapacidad_general", "Discapacidad_silla", "Discapacidad_visual"])
      .optional(),
    contactoEmergencia: personaSchema
  })

});

//Para el login
export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegistroCorredor = z.infer<typeof registroCorredorSchema>;
export type Login = z.infer<typeof loginSchema>;