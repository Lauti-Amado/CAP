//frontend/src/schemas/usuarioSchema.ts
import { z } from "zod";

const email = z.string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Email inválido"))

//Login
export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, "La contraseña es obligatoria"),
  recordarme: z.boolean().optional()
});

export type Login = z.infer<typeof loginSchema>;

//Acceso de contingencia
export const contingenciaSchema = z.object({
  email: email,
  clave: z.string()
    .trim()
    .regex(/^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/, "La clave debe tener 8 caracteres, por ejemplo K9X2-M4P8"),
});

export type Contingencia = z.infer<typeof contingenciaSchema>;