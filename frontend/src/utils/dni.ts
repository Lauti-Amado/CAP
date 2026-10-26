//frontend/src/utils/dni.ts
// Deja solo los dígitos: "38.456.789" y "38456789" se comparan igual.
export function normalizarDni(dni: string): string {
  return dni.replace(/\D/g, '')
}