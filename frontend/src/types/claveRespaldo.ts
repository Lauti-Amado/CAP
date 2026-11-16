//frontend/src/types/claveRespaldo.ts
export type EstadoClaveRespaldo = 'Disponible' | 'Utilizada' | 'Invalidada'

export type ClaveRespaldo = {
  id: string
  clave: string
  estado: EstadoClaveRespaldo
  fechaHoraUso: string | null
}

export type CuentaClaves = {
  id: string
  nombre: string
  dni: string
  correo: string
  disponibles: number
}