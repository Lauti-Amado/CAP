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