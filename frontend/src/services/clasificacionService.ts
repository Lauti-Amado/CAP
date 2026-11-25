//frontend/src/services/clasificacionService.ts
import { apiFetch } from './apiService'
import type {
  ClasificacionDTO,
  ClasificacionTiempoRealDTO,
  EstadoManualClasificacion,
  FiltrosClasificacion,
  PaginaClasificacion,
  RegistrarResultadoBody,
} from '../types/clasificacionApi'

export type { ClasificacionDTO, ClasificacionTiempoRealDTO }

const LIMITE_MAXIMO = 100 // tope que acepta el backend por página

function buildQuery(filtros: Partial<FiltrosClasificacion>): string {
  const params = new URLSearchParams()
  if (filtros.estado)    params.set('estado',    filtros.estado)
  if (filtros.busqueda)  params.set('busqueda',  filtros.busqueda)
  if (filtros.distancia) params.set('distancia', String(filtros.distancia))
  if (filtros.sexo)      params.set('sexo',      filtros.sexo)
  if (filtros.categoria) params.set('categoria', filtros.categoria)
  if (filtros.pagina)    params.set('pagina',    String(filtros.pagina))
  if (filtros.limite)    params.set('limite',    String(filtros.limite))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** Resultados paginados con filtros */
export function listarClasificacion(
  carreraId: string,
  filtros: Partial<FiltrosClasificacion> = {}
): Promise<PaginaClasificacion> {
  return apiFetch<PaginaClasificacion>(`/carreras/${carreraId}/clasificacion${buildQuery(filtros)}`)
}

/**
 * Una sola página (hasta 100) de clasificaciones, sin metadatos de paginación.
 * Pensada para búsquedas puntuales (por ejemplo, por DNI); para listados usar `listarClasificacion`.
 */
export async function obtenerClasificaciones(
  carreraId: string,
  filtros: Partial<FiltrosClasificacion> = {}
): Promise<ClasificacionDTO[]> {
  const pagina = await listarClasificacion(carreraId, { limite: LIMITE_MAXIMO, ...filtros })
  return pagina.datos
}

/** Resumen + últimas llegadas de la carrera (más recientes primero) */
export function obtenerClasificacionTiempoReal(
  carreraId: string,
  limite = 20
): Promise<ClasificacionTiempoRealDTO> {
  return apiFetch<ClasificacionTiempoRealDTO>(
    `/carreras/${carreraId}/clasificacion/tiempo-real?limite=${limite}`
  )
}

/** Una clasificación puntual por id */
export function obtenerClasificacionPorId(id: string): Promise<ClasificacionDTO> {
  return apiFetch<ClasificacionDTO>(`/clasificaciones/${id}`)
}

/** Descalificar / marcar "No largó" / "No finalizó" */
export function cambiarEstadoClasificacion(
  id: string,
  estado: EstadoManualClasificacion
): Promise<ClasificacionDTO> {
  return apiFetch<ClasificacionDTO>(`/clasificaciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
}

/** Registra o corrige el resultado (puesto y tiempo) de una clasificación */
export function registrarResultadoClasificacion(
  id: string,
  datos: RegistrarResultadoBody
): Promise<ClasificacionDTO> {
  return apiFetch<ClasificacionDTO>(`/clasificaciones/${id}/resultado`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}
