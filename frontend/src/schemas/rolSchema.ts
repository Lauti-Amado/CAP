//frontend/src/schemas/rolSchema.ts
import { z } from 'zod'

export const rolesUsuarioSchema = z.object({
  roles: z
    .array(z.enum(['Administrador', 'Clasificador']))
    .min(1, 'Seleccioná al menos un rol.'),
})

export type RolesUsuarioForm = z.infer<typeof rolesUsuarioSchema>