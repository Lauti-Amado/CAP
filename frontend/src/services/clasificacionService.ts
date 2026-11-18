
import { apiFetch } from './apiService'
import type { EstadoClasificacion } from '../types/clasificacion'

export type CorredorClasificacionDTO = {
  dni: string
  nombre: string
  apellido: string
  sexo: 'Masculino' | 'Femenino'
  discapacidad: string | null
}

export type ClasificacionDTO = {
  id: string
  estado: string
  inscripcionId: string
  corredor: CorredorClasificacionDTO
  dorsal: string | null
  equipo: string | null
  distancia: {
    kilometraje: number
    tipoDistancia: string
  }
  resultado: {
    id: string
    tiempoLlegada: number | null
    puestoGeneral: number
    estado: string
    categorias: {
      categoriaId: string
      nombre: string
      puesto: number
    }[]
  } | null
}

export type ResumenClasificacionDTO = {
  participantes: number
  llegados: number
  pendientes: number
  noFinalizaron: number
  noLargaron: number
  descalificados: number
  progreso: number
}

export type ClasificacionTiempoRealDTO = {
  carrera: {
    id: string
    estado: string
    fechaHoraCarrera: string
  }
  resumen: ResumenClasificacionDTO
  llegadas: ClasificacionDTO[]
}

export function obtenerClasificaciones(
  carreraId: string,
  filtros?: {
    estado?: EstadoClasificacion
    busqueda?: string
  }
): Promise<ClasificacionDTO[]> {
  const params = new URLSearchParams()

  if (filtros?.estado) params.set('estado', filtros.estado)
  if (filtros?.busqueda) params.set('busqueda', filtros.busqueda)

  const query = params.toString()

  return apiFetch<ClasificacionDTO[]>(
    `/carreras/${carreraId}/clasificacion${query ? `?${query}` : ''}`
  )
}

export function obtenerClasificacionTiempoReal(
  carreraId: string,
  limite = 20
): Promise<ClasificacionTiempoRealDTO> {
  return apiFetch<ClasificacionTiempoRealDTO>(
    `/carreras/${carreraId}/clasificacion/tiempo-real?limite=${limite}`
  )
}
export type RegistrarResultadoPayload = {
  puestoGeneral: number
  tiempoLlegada?: number | null
}

export function registrarResultadoClasificacion(
  clasificacionId: string,
  datos: RegistrarResultadoPayload,
): Promise<ClasificacionDTO> {
  return apiFetch<ClasificacionDTO>(
    `/clasificaciones/${clasificacionId}/resultado`,
    {
      method: 'PUT',
      body: JSON.stringify(datos),
    },
  )
}
export type EstadoManualClasificacion = 'Descalificado' | 'No_largo'

export function cambiarEstadoClasificacion(
  clasificacionId: string,
  estado: EstadoManualClasificacion
): Promise<ClasificacionDTO> {
  return apiFetch<ClasificacionDTO>(
    `/clasificaciones/${clasificacionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }
  )
}