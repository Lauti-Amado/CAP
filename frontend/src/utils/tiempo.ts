//frontend/src/utils/tiempo.ts
// 5400000 ms -> "01:30:00"
export function formatearDuracion(milisegundos: number): string {
  const totalSegundos = Math.max(0, Math.floor(milisegundos / 1000))
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(':')
}

// 5400123 ms -> "01:30:00.123"
export function formatearDuracionConMs(milisegundos: number): string {
  const total = Math.max(0, Math.floor(milisegundos))
  const milis = String(total % 1000).padStart(3, '0')
  return `${formatearDuracion(total)}.${milis}`
}