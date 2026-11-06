//backend/src/validations/inscripcion.validations.ts
import { z } from "zod";
import { Discapacidad, EstadoInscripcion, Sexo, TipoDistancia } from "../generated/prisma/client";

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

// ---------- Alta de una inscripción presencial ----------

const texto = z.string().trim().min(1, "Campo obligatorio").max(100);
const telefono = z.string().trim().min(6, "Teléfono inválido").max(30, "Teléfono inválido");

const personaSchema = z.object({ dni, nombre: texto, apellido: texto, telefono });

const corredorSchema = personaSchema.extend({
    sexo: z.enum(Sexo),
    fechaNacimiento: z.coerce.date().refine((f) => f <= new Date(), "La fecha de nacimiento no puede ser futura"),
    discapacidad: z.enum(Discapacidad).optional(),
});

const aptoMedicoSchema = z.object({
    fechaVencimiento: z.coerce.date().refine(
        (f) => f.getTime() > Date.now(),
        "El apto médico está vencido: ingresá una fecha de vencimiento futura"
    ),
});

const distanciaSchema = z.object({
    kilometraje: z.number().positive(),
    tipoDistancia: z.enum(TipoDistancia),
});

const productoSchema = z.object({
    varianteId: z.uuid("El ID de la variante debe ser un UUID válido"),
    cantidad: z.number().int().min(1).max(10),
});

const equipoSchema = z.object({
    nombre: texto,
    codigoEquipo: z.string().trim().min(1).max(50).optional(),
});

export const crearInscripcionSchema = z.object({
    corredor: corredorSchema,
    contactoEmergencia: personaSchema,
    aptoMedico: aptoMedicoSchema.optional(),
    distancia: distanciaSchema,
    equipo: equipoSchema.optional(),
    productos: z.array(productoSchema).max(10).default([]),
}).superRefine((datos, ctx) => {
    if (datos.corredor.dni === datos.contactoEmergencia.dni) {
        ctx.addIssue({
            code: "custom",
            path: ["contactoEmergencia", "dni"],
            message: "El contacto de emergencia no puede ser el mismo corredor",
        });
    }

    const variantes = new Set<string>();
    datos.productos.forEach((p, i) => {
        if (variantes.has(p.varianteId)) {
            ctx.addIssue({
                code: "custom",
                path: ["productos", i, "varianteId"],
                message: "Variante repetida: sumá la cantidad en una sola línea",
            });
        }
        variantes.add(p.varianteId);
    });
});

export type CrearInscripcion = z.infer<typeof crearInscripcionSchema>;