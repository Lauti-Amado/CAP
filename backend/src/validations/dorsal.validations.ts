//backend/src/validations/dorsal.validations.ts
import { z } from "zod";

const MAX_CHIP = 2147483647;

const chipNumero = z.number().int().positive().max(MAX_CHIP, "Número de chip inválido");

export const numeroDorsal = z.string()
    .trim()
    .regex(/^\d{1,5}$/, "El dorsal debe ser un número de hasta 5 dígitos")
    .transform((v) => String(Number(v))); // "0042" -> "42"

// Un dorsal: el número físico y, opcionalmente, el chip RFID que trae integrado
const dorsalSchema = z.object({
    numero: numeroDorsal,
    chipNumero: chipNumero.optional(),
});

export const crearDorsalSchema = dorsalSchema;
export const entregarKitSchema = dorsalSchema; // al entregar se indica qué dorsal (y chip) se lleva el corredor
export const vincularChipSchema = z.object({ chipNumero });

export const inventarioSchema = z.object({
    dorsales: z.array(dorsalSchema)
        .min(1, "Enviá al menos un dorsal")
        .max(5000),
}).superRefine((datos, ctx) => {
    const numeros = new Set<string>();
    const chips = new Set<number>();
    datos.dorsales.forEach((d, i) => {
        if (numeros.has(d.numero)) {
            ctx.addIssue({ code: "custom", path: ["dorsales", i, "numero"], message: `Dorsal repetido: ${d.numero}` });
        }
        numeros.add(d.numero);
        if (d.chipNumero !== undefined) {
            if (chips.has(d.chipNumero)) {
                ctx.addIssue({ code: "custom", path: ["dorsales", i, "chipNumero"], message: `Chip repetido: ${d.chipNumero}` });
            }
            chips.add(d.chipNumero);
        }
    });
});

export const numeroParamSchema = z.object({ numero: numeroDorsal });

export const chipParamSchema = z.object({
    numero: z.coerce.number().int().positive().max(MAX_CHIP, "Número de chip inválido"),
});

export const busquedaQuerySchema = z.object({
    busqueda: z.string().trim().max(100).optional(),
});

export const limiteQuerySchema = z.object({
    limite: z.coerce.number().int().min(1).max(50).default(5),
});

export type CrearDorsal = z.infer<typeof crearDorsalSchema>;
export type EntregarKit = z.infer<typeof entregarKitSchema>;
export type ItemInventario = CrearDorsal;