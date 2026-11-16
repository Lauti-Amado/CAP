//frontend/src/types/claveRespaldo.ts
export type EstadoClaveRespaldo = 'Disponible' | 'Utilizada' | 'Invalidada'

export type ClaveRespaldo = {
  id: string
  clave: string | null   // null si no se pudo leer
  estado: EstadoClaveRespaldo
  fechaHoraUso: string | null
  usos: number
}

export type CuentaClaves = {
  id: string
  nombre: string
  dni: string
  correo: string
  disponibles: number
}