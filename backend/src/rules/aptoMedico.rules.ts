//backend/src/rules/aptoMedico.rules.ts

export function requiereAptoMedico(kilometraje: number, tipoDistancia: string): boolean {
    return kilometraje > 10 && tipoDistancia === "Competitiva";
}

// Vencimiento del apto aprobado que cubre la fecha de la carrera (null si no hay ninguno)
export function vencimientoVigente(
    aptos: { aprobado: boolean; fechaVencimiento: Date }[],
    fechaCarrera: Date
): Date | null {
    const vigentes = aptos
        .filter((a) => a.aprobado && a.fechaVencimiento >= fechaCarrera)
        .map((a) => a.fechaVencimiento.getTime());

    return vigentes.length === 0 ? null : new Date(Math.max(...vigentes));
}