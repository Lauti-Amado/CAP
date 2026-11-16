//backend/src/validations/claveRespaldo.validations.ts
import { z } from "zod";

// GET /api/claves-respaldo?usuarioId=...
export const clavesCuentaQuerySchema = z.object({
    usuarioId: z.uuid("El parámetro usuarioId debe ser un UUID válido"),
});