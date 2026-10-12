import { z } from "zod";

export const idParamSchema = z.object({
    id: z.uuid("El parámetro ID debe ser un UUID válido")
});

export type IdParam = z.infer<typeof idParamSchema>;