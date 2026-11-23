//backend/src/validations/dorsal.validations.ts
import { z } from "zod";

// El chip se identifica por su código EPC: hexadecimal de hasta 32 dígitos (96 o 128 bits).
// Se guarda en mayúsculas para que "e280..." y "E280..." sean el mismo chip.
const chipNumero = z.string()
    .trim()
    .regex(/^[0-9a-fA-F]{1,32}$/, "El chip debe ser un código hexadecimal de hasta 32 dígitos")
    .transform((v) => v.toUpperCase());

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
    const chips = new Set<string>();
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

export const chipParamSchema = z.object({ numero: chipNumero });

export const busquedaQuerySchema = z.object({
    busqueda: z.string().trim().max(100).optional(),
});

export const limiteQuerySchema = z.object({
    limite: z.coerce.number().int().min(1).max(50).default(5),
});

export const dniQuerySchema = z.object({
    dni: z.string().trim().min(1, "Ingresá un DNI").max(20),
});

export type CrearDorsal = z.infer<typeof crearDorsalSchema>;
export type EntregarKit = z.infer<typeof entregarKitSchema>;
export type ItemInventario = CrearDorsal;