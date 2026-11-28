//backend/src/validations/registroModificacion.validations.ts
import { z } from "zod";
import { EntidadAuditada } from "../generated/prisma/client";

// GET /api/carreras/:id/modificaciones  (paginado)
export const registroModificacionQuerySchema = z.object({
    entidad:   z.enum(EntidadAuditada).optional(),
    entidadId: z.string().trim().min(1).optional(),
    usuarioId: z.string().trim().min(1).optional(),
    pagina:    z.coerce.number().int().min(1).default(1),
    limite:    z.coerce.number().int().min(1).max(100).default(50),
});

export type FiltrosRegistroModificacion = z.infer<typeof registroModificacionQuerySchema>;
