//frontend/src/services/clasificacionService.ts
import { apiFetch } from './apiService'
import type { PaginaClasificacion, FiltrosClasificacion } from '../types/clasificacionApi'

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
