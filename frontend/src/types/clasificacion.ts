//frontend/src/types/clasificacion.ts
import type { EstadoVerificacion } from './entregaKits'

// Estado utilizado para representar visualmente la clasificación en el frontend.
//No coincide con el enum del backend
// Es una representación de presentación que combina estados de clasificación y resultado.
export type EstadoClasificacion = 'Oficial' | 'En revisión' | 'Descalificado' | 'No largó'

// Datos mínimos de un corredor para mostrar en los modales
export type ResumenCorredor = {
  id: string
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
  id: string
  puesto: number
  dorsal: string
  apellidosNombres: string
  dni: string
  categoria: string
  tiempo: string
  // Estados visuales de las llegadas en la tabla de clasificación.
  estado: 'OFICIAL' | 'EN REVISIÓN' | 'DESCALIFICADO' | 'NO LARGÓ'
  sexo: 'Masculino' | 'Femenino'
  club: string
  equipo: string
}

//No coincide con el enum del backen
export type EstadoParticipante = 'PENDIENTE' | 'EN CURSO' | 'LLEGADO'

// Fila de la tabla de participantes del dashboard de clasificación
export type ParticipanteClasificacion = {
  id: string
  dorsal: string
  atleta: string
  dni: string
  categoria: string
  estado: EstadoParticipante
  tiempo?: string
}