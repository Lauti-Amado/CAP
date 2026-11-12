//backend/src/validations/certificado.validations.ts
import { z } from "zod";

export const candidatosQuerySchema = z.object({
    busqueda: z.string().trim().min(1).max(100).optional(),
});