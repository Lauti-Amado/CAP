//backend/src/validations/actividad.validations.ts
import { z } from "zod";

// GET /api/carreras/:id/actividad
export const actividadQuerySchema = z.object({
    limite: z.coerce.number().int().min(1).max(50).default(10),
});