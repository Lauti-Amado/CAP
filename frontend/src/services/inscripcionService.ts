
import { apiFetch } from './apiService'

import type {
  FiltrosListadoInscripciones,
  InscripcionListadoDTO,
  PaginaDTO,
  InscripcionDetalleDTO,
  OpcionesInscripcionDTO,
  ContactoEmergenciaDTO,
  CrearInscripcionPayload,
} from '../types/inscripcion'

// Listado paginado
export function obtenerInscripciones(
  filtros: FiltrosListadoInscripciones
): Promise<PaginaDTO<InscripcionListadoDTO>> {
  const params = new URLSearchParams()

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== '') {
      params.append(clave, String(valor))
    }
  })

  return apiFetch<PaginaDTO<InscripcionListadoDTO>>(
    `/inscripciones?${params.toString()}`
  )
}

// Obtener detalle por ID
export function obtenerInscripcion(
  id: string
): Promise<InscripcionDetalleDTO> {
  return apiFetch<InscripcionDetalleDTO>(`/inscripciones/${id}`)
}

// Obtener opciones para nueva inscripción
export function obtenerOpcionesInscripcion(
  carreraId: string
): Promise<OpcionesInscripcionDTO> {
  return apiFetch<OpcionesInscripcionDTO>(
    `/carreras/${carreraId}/inscripciones/opciones`
  )
}

// Buscar contacto de emergencia por DNI
export function buscarContactoEmergencia(
  dni: string
): Promise<ContactoEmergenciaDTO> {
  const params = new URLSearchParams({ dni })

  return apiFetch<ContactoEmergenciaDTO>(
    `/contactos-emergencia?${params.toString()}`
  )
}
export function crearInscripcion(
  carreraId: string,
  datos: CrearInscripcionPayload
): Promise<InscripcionDetalleDTO> {
  return apiFetch<InscripcionDetalleDTO>(
    `/carreras/${carreraId}/inscripciones`,
    {
      method: 'POST',
      body: JSON.stringify(datos),
    }
  )
}
// Cargar apto médico de una inscripción existente
export function cargarAptoMedico(
  inscripcionId: string,
  fechaVencimiento: string
): Promise<InscripcionDetalleDTO> {
  return apiFetch<InscripcionDetalleDTO>(
    `/inscripciones/${inscripcionId}/apto-medico`,
    {
      method: 'POST',
      body: JSON.stringify({ fechaVencimiento }),
    }
  )
}