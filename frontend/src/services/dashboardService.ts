//frontend/src/services/dashboardService.ts
import { apiFetch } from './apiService'
import type { DashboardActivity } from '../types/dashboard'

export const obtenerActividadCarrera = (carreraId: string, limite = 10) =>
  apiFetch<DashboardActivity[]>(`/carreras/${carreraId}/actividad?limite=${limite}`)