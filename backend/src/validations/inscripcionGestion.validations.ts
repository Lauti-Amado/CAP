//backend/src/validations/inscripcion.validations.ts
import { z } from "zod";
import { EstadoInscripcion, TipoDistancia } from "../generated/prisma/client";

const dni = z.string().trim().regex(/^\d{7,8}$/, "DNI inválido, ingresá solo números sin puntos");

export const contactoQuerySchema = z.object({ dni });

export const listadoQuerySchema = z.object({
    carreraId: z.uuid("El parámetro carreraId debe ser un UUID válido").optional(),
    dni: z.string().trim().regex(/^\d{1,8}$/, "Ingresá solo números").optional(), // búsqueda parcial
    kilometraje: z.coerce.number().positive().optional(),
    tipoDistancia: z.enum(TipoDistancia).optional(),
    pagado: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
    estado: z.enum(EstadoInscripcion).optional(),
    anio: z.coerce.number().int().min(2000).max(2100).optional(), // año de la inscripción
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListadoInscripciones = z.infer<typeof listadoQuerySchema>;