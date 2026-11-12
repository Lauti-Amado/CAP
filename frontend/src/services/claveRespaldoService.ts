//frontend/src/services/claveRespaldoService.ts
import { apiFetch } from './apiService'
import type { ClaveRespaldo } from '../types/claveRespaldo'

export const listarClavesRespaldo = () =>
  apiFetch<ClaveRespaldo[]>('/claves-respaldo')

export const generarClavesRespaldo = () =>
  apiFetch<ClaveRespaldo[]>('/claves-respaldo/generar', { method: 'POST' })