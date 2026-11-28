//backend/src/rules/registroModificacion.rules.ts
// Reglas puras de la trazabilidad: no tocan la base de datos.

export type ValorAuditable = string | number | boolean | Date | null | undefined;

// Un campo antes y después de la modificación
export type CambioCampo = { campo: string; anterior: ValorAuditable; nuevo: ValorAuditable };

// Cómo se guarda: los valores siempre como texto
export type CambioRegistrable = { campo: string; valorAnterior: string | null; valorNuevo: string | null };

export function valorComoTexto(valor: ValorAuditable): string | null {
    if (valor === null || valor === undefined) return null;
    if (valor instanceof Date) return valor.toISOString();
    return String(valor);
}

// Deja solo los campos que realmente cambiaron. Si no cambió ninguno, no hay nada que registrar.
export function cambiosRegistrables(cambios: CambioCampo[]): CambioRegistrable[] {
    return cambios
        .map((c) => ({ campo: c.campo, valorAnterior: valorComoTexto(c.anterior), valorNuevo: valorComoTexto(c.nuevo) }))
        .filter((c) => c.valorAnterior !== c.valorNuevo);
}
