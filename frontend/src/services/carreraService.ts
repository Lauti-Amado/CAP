//frontend/src/services/carreraService.ts
import { apiFetch } from './apiService'
import type { Carrera, CarreraDetalle } from '../types/carrera'

export function obtenerDetalleCarrera(id: string): Promise<CarreraDetalle> {
  return apiFetch<CarreraDetalle>(`/carreras/${id}/detalle`)
}

export function iniciarCarrera(id: string): Promise<Carrera> {
  return apiFetch<Carrera>(`/carreras/${id}/iniciar`, { method: 'POST' })
}

export function finalizarCarrera(id: string): Promise<Carrera> {
  return apiFetch<Carrera>(`/carreras/${id}/finalizar`, { method: 'POST' })
}