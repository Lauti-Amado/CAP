//frontend/src/services/carreraService.ts
import { apiFetch } from './apiService'
import type { CarreraDetalle } from '../types/carrera'

export function obtenerDetalleCarrera(id: string): Promise<CarreraDetalle> {
  return apiFetch<CarreraDetalle>(`/carreras/${id}/detalle`)
}