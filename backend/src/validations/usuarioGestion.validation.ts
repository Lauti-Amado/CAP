//backend/src/validations/usuarioGestion.validation.ts
import { z } from "zod";

export const listarUsuariosQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
});

export const actualizarRolesSchema = z.object({
  roles: z.array(z.enum(["Administrador", "Clasificador"]))
    .min(1, "Debe seleccionar al menos un rol"),
});

export type ActualizarRoles = z.infer<typeof actualizarRolesSchema>;