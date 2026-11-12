//frontend/src/types/claverespaldo.ts
export type EstadoClaveRespaldo = 'Disponible' | 'Utilizada' | 'Invalidada'

export type ClaveRespaldo = {
  id: string
  numero: number
  clave: string
  estado: EstadoClaveRespaldo
  fechaHoraUso: string | null
}