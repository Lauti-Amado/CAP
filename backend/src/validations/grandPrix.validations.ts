import { z } from "zod";

const id = z.string().uuid();
const fecha = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
        (value) =>
            !Number.isNaN(Date.parse(value)) &&
            new Date(value).toISOString().slice(0, 10) === value,
        "Ingresá una fecha válida.",
    )
    .transform((value) => new Date(`${value}T00:00:00.000Z`));
const motivo = z.string().trim().min(3).max(1000);
export const datosGrandPrixSchema = z
    .object({
        nombre: z.string().trim().min(3).max(120),
        fechaInicio: fecha,
        fechaFin: fecha,
        fechaReferenciaEdad: fecha,
        minimoCarrerasCalendario: z.number().int().min(0).max(1000),
        minimoParticipacionesCorredor: z.number().int().min(0).max(1000),
        exigeAfiliacion: z.boolean(),
        admiteResultadosPrevios: z.boolean(),
    })
    .strict()
    .refine((data) => data.fechaInicio <= data.fechaFin, {
        message: "La fecha de fin debe ser igual o posterior al inicio.",
        path: ["fechaFin"],
    });
export const actualizarGrandPrixSchema = z
    .object({ datos: datosGrandPrixSchema, motivo })
    .strict();
export const estadoGrandPrixSchema = z
    .object({
        estado: z.enum(["Borrador", "Activo", "Cerrado", "Cancelado"]),
        motivo,
    })
    .strict();
export const categoriaGrandPrixSchema = z
    .object({
        nombre: z.string().trim().min(2).max(120),
        sexo: z.enum(["Masculino", "Femenino"]).nullable(),
        edadMinima: z.number().int().min(0).max(120).nullable(),
        edadMaxima: z.number().int().min(0).max(120).nullable(),
        discapacidad: z
            .enum([
                "Discapacidad_general",
                "Discapacidad_silla",
                "Discapacidad_visual",
            ])
            .nullable(),
    })
    .strict()
    .refine((data) => (data.edadMinima ?? 0) <= (data.edadMaxima ?? 120), {
        message: "El rango de edades es inválido.",
        path: ["edadMaxima"],
    });
export const pruebaGrandPrixSchema = z
    .object({ distanciaCarreraId: id })
    .strict();
export const incluirPruebaSchema = z
    .object({ incluida: z.boolean(), motivo })
    .strict();
export const participacionGrandPrixSchema = z
    .object({ corredorId: id, categoriaId: id })
    .strict();
export const estadoParticipacionSchema = z
    .object({
        estado: z.enum(["Activa", "Retirada", "Excluida"]),
        motivo,
    })
    .strict();
export const reglamentoGrandPrixSchema = z
    .object({
        basePuesto: z.enum(["TodosCarrera", "ParticipantesGrandPrix"]),
        copiarDeId: id.optional(),
    })
    .strict();
export const reglasGrandPrixSchema = z
    .object({
        basePuesto: z.enum(["TodosCarrera", "ParticipantesGrandPrix"]),
        reglas: z
            .array(
                z
                    .object({
                        pruebaId: id,
                        puesto: z.number().int().min(1).max(10000),
                        puntos: z.number().int().min(0).max(1000000),
                    })
                    .strict(),
            )
            .max(10000),
    })
    .strict()
    .refine(
        (data) =>
            new Set(data.reglas.map((r) => `${r.pruebaId}:${r.puesto}`))
                .size === data.reglas.length,
        {
            message: "Hay puestos repetidos para una prueba.",
            path: ["reglas"],
        },
    );
export const aplicarReglamentoSchema = z
    .object({
        pruebaIds: z
            .array(id)
            .min(1)
            .max(1000)
            .refine((ids) => new Set(ids).size === ids.length),
        retroactivo: z.boolean(),
        motivo,
    })
    .strict();
export const recalcularGrandPrixSchema = z.object({ motivo }).strict();
export const grandPrixRecursoParams = z.object({ id, recursoId: id });
export const tablaGrandPrixQuery = z.object({
    categoriaId: id.optional(),
    sexo: z.enum(["Masculino", "Femenino"]).optional(),
    kilometraje: z.coerce.number().positive().optional(),
    busqueda: z.string().trim().max(100).optional(),
});
export type DatosGrandPrix = z.infer<typeof datosGrandPrixSchema>;
export type DatosCategoriaGP = z.infer<typeof categoriaGrandPrixSchema>;
export type DatosReglasGP = z.infer<typeof reglasGrandPrixSchema>;
export type AplicacionReglamento = z.infer<typeof aplicarReglamentoSchema>;
export type FiltrosTablaGP = z.infer<typeof tablaGrandPrixQuery>;
