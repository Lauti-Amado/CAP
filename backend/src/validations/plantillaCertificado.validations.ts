//backend/src/validations/plantillaCertificado.validations.ts
import { z } from "zod";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Debe ser un color hexadecimal (#RRGGBB)");

export const plantillaCertificadoSchema = z.object({
    nombre: z.string().trim().min(1).max(100),
    colorPrimario: color,
    colorSecundario: color,
    colorFondo: color,
    fuente: z.string().trim().min(1).max(100),
    esquinasRedondeadas: z.boolean(),
    sombras: z.boolean(),
    marcaDeAgua: z.boolean(),
});

export type DatosPlantillaCertificado = z.infer<typeof plantillaCertificadoSchema>;