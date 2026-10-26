//backend/src/validations/dorsal.validations.ts
import { z } from "zod";

const chipNumero = z.number().int().positive().max(2147483647, "Número de chip inválido");

export const numeroDorsal = z.string()
    .trim()
    .regex(/^\d{1,5}$/, "El dorsal debe ser un número de hasta 5 dígitos")
    .transform((v) => String(Number(v))); // "0042" -> "42"

export const asignarDorsalSchema = z.object({
    numero: numeroDorsal,
    chipNumero: chipNumero.optional(),
});

export const vincularChipSchema = z.object({ chipNumero });

export const numeroParamSchema = z.object({ numero: numeroDorsal });

export const dniQuerySchema = z.object({
    dni: z.string().trim().regex(/^\d{7,8}$/, "DNI inválido, ingresa solo números sin puntos"),
});

export const busquedaQuerySchema = z.object({
    busqueda: z.string().trim().max(100).optional(),
});

export const limiteQuerySchema = z.object({
    limite: z.coerce.number().int().min(1).max(50).default(5),
});

// Carga masiva del inventario de dorsales (cada dorsal físico trae su chip)
export const inventarioSchema = z.object({
    dorsales: z.array(z.object({ numero: numeroDorsal, chipNumero: chipNumero.optional() }))
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

export type AsignarDorsal = z.infer<typeof asignarDorsalSchema>;
export type ItemInventario = z.infer<typeof inventarioSchema>["dorsales"][number];