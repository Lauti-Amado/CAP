//backend/src/validations/clasificacion.validations.ts
import { z } from "zod";
import { EstadoClasificacion, EstadoResultado } from "../generated/prisma/client";

const INT_MAX = 2147483647; // Límite de un Int de Prisma/SQLite

// GET /api/carreras/:id/clasificacion
export const clasificacionCarreraQuerySchema = z.object({
    estado: z.enum(EstadoClasificacion).optional(),
    busqueda: z.string().trim().max(100).optional(),
});

// GET /api/carreras/:id/clasificacion/tiempo-real
export const tiempoRealQuerySchema = z.object({
    limite: z.coerce.number().int().min(1).max(100).default(20),
});

// PATCH /api/clasificaciones/:id
// Sólo se permiten los estados que se fijan a mano. "Finalizo" se obtiene
// únicamente al registrar un resultado (PUT .../resultado) y "Pendiente" es el inicial.
export const cambiarEstadoClasificacionSchema = z.object({
    estado: z.enum([EstadoClasificacion.Descalificado, EstadoClasificacion.No_finalizo]),
}).strict();

// PUT /api/clasificaciones/:id/resultado
// - tiempoLlegada (en milisegundos) es opcional: si se omite al crear el resultado,
//   se calcula desde la largada de la carrera (sólo si está En_curso).
// - estado es opcional: por defecto "Oficial" (o el que ya tuviera el resultado).
export const registrarResultadoSchema = z.object({
    puestoGeneral: z.number().int().positive().max(INT_MAX),
    tiempoLlegada: z.number().int().positive().max(INT_MAX).optional(),
    estado: z.enum(EstadoResultado).optional(),
}).strict();

export type FiltrosClasificacion = z.infer<typeof clasificacionCarreraQuerySchema>;
export type CambiarEstadoClasificacion = z.infer<typeof cambiarEstadoClasificacionSchema>;
export type RegistrarResultado = z.infer<typeof registrarResultadoSchema>;
