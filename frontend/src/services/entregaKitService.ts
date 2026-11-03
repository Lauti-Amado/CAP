import { apiFetch } from './apiService'
import type {
  CorredorEntregaKitDTO,
  EntregaKitDTO,
  EntregaRecienteDTO,
} from '../types/entregaKits'

/**
 * Obtiene las últimas entregas de kits de una carrera.
 */
export function obtenerEntregasRecientes(
  carreraId: string,
  limite = 3
): Promise<EntregaRecienteDTO[]> {
  return apiFetch<EntregaRecienteDTO[]>(
    `/api/carreras/${carreraId}/entregas-recientes?limite=${limite}`
  )
}

/**
 * Busca un corredor por DNI dentro de una carrera.
 */
export function buscarCorredorPorDni(
  carreraId: string,
  dni: string
): Promise<CorredorEntregaKitDTO> {
  const params = new URLSearchParams({ dni })

  return apiFetch<CorredorEntregaKitDTO>(
    `/api/carreras/${carreraId}/corredores?${params.toString()}`
  )
}

/**
 * Registra la entrega del kit y el dorsal asignado.
 */
export function registrarEntregaKit(
  inscripcionId: string,
  numeroDorsal: string
): Promise<EntregaKitDTO> {
  return apiFetch<EntregaKitDTO>(
    `/api/inscripciones/${inscripcionId}/entrega-kit`,
    {
      method: 'POST',
      body: JSON.stringify({ numero: numeroDorsal }),
    }
  )
}