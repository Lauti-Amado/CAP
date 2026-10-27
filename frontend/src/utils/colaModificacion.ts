export const RUTA_TIEMPO_REAL = '/clasificador/clasificaciones/tiempo-real'

// "?siguientes=2,3" -> [2, 3]
function leerCola(search: string): number[] {
  const crudo = new URLSearchParams(search).get('siguientes')
  if (!crudo) return []
  return crudo.split(',').map(Number).filter((n) => Number.isInteger(n))
}

// Ruta a la que ir después de guardar: el siguiente de la cola o, si no quedan, tiempo real
export function rutaTrasGuardar(search: string): string {
  const [siguiente, ...resto] = leerCola(search)
  if (siguiente === undefined) return RUTA_TIEMPO_REAL
  const cola = resto.length > 0 ? `?siguientes=${resto.join(',')}` : ''
  return `/clasificador/clasificaciones/${siguiente}${cola}`
}