//frontend/src/types/clasificacion.ts
export type EstadoClasificacion = 'Oficial' | 'En revisión' | 'Descalificado'

// Datos mínimos de un corredor para mostrar en los modales
export type ResumenCorredor = {
  id: number
  dorsal: string
  nombre: string
  dni: string
  categoria: string
  estado: EstadoClasificacion
}

// Corredor inscripto en la carrera (carga manual)
export type CorredorClasificacion = ResumenCorredor

// Llegada registrada (tabla de clasificación en tiempo real)
export type LlegadaAtleta = {
  id: number
  puesto: number
  dorsal: string
  apellidosNombres: string
  dni: string
  categoria: string
  tiempo: string
  estado: 'OFICIAL' | 'EN REVISIÓN' | 'DESCALIFICADO'
  sexo: 'Masculino' | 'Femenino'
  club: string
  equipo: string
}