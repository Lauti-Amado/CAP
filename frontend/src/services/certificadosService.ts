//frontend/src/services/certificadosService.ts
import { apiFetch } from './apiService'
import type {
  CandidatoCertificado,
  ResultadoEnvioCertificado,
  ResultadoReintento,
} from '../types/certificado'

export function buscarCandidatos(carreraId: string, busqueda = ''): Promise<CandidatoCertificado[]> {
  const params = new URLSearchParams()
  if (busqueda.trim()) params.set('busqueda', busqueda.trim())
  const query = params.toString()

  return apiFetch<CandidatoCertificado[]>(
    `/carreras/${carreraId}/certificados/candidatos${query ? `?${query}` : ''}`,
  )
}

export function listarPendientes(carreraId: string): Promise<CandidatoCertificado[]> {
  return apiFetch<CandidatoCertificado[]>(`/carreras/${carreraId}/certificados/pendientes`)
}

export function enviarCertificado(inscripcionId: string): Promise<ResultadoEnvioCertificado> {
  return apiFetch<ResultadoEnvioCertificado>(`/inscripciones/${inscripcionId}/certificado`, {
    method: 'POST',
  })
}

export function reintentarPendientes(carreraId: string): Promise<ResultadoReintento> {
  return apiFetch<ResultadoReintento>(`/carreras/${carreraId}/certificados/pendientes/reintentar`, {
    method: 'POST',
  })
}