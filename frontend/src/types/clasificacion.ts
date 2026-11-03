//frontend/src/types/clasificacion.ts
import type { EstadoVerificacion } from './entregaKits'

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

// Corredor inscripto en la carrera (carga manual y detalle)
export type CorredorClasificacion = ResumenCorredor & {
  distancia: string
  talleRemera: string
  clubTeam: string
  estadoInscripcion: EstadoVerificacion
  estadoAptoMedico: EstadoVerificacion
  chipRfid: string
}

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

export type EstadoParticipante = 'PENDIENTE' | 'EN CURSO' | 'LLEGADO'

// Fila de la tabla de participantes del dashboard de clasificación
export type ParticipanteClasificacion = {
  id: number
  dorsal: string
  atleta: string
  dni: string
  categoria: string
  estado: EstadoParticipante
  tiempo?: string
}