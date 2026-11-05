import { apiFetch } from './apiService'
import type { CategoriaDTO, DatosCategoria } from '../types/categoria'

export function listarCategorias(): Promise<CategoriaDTO[]> {
  return apiFetch<CategoriaDTO[]>('/categorias')
}

export function obtenerCategoria(id: string): Promise<CategoriaDTO> {
  return apiFetch<CategoriaDTO>(`/categorias/${id}`)
}

export function crearCategoria(datos: DatosCategoria): Promise<CategoriaDTO> {
  return apiFetch<CategoriaDTO>('/categorias', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarCategoria(id: string, datos: DatosCategoria): Promise<CategoriaDTO> {
  return apiFetch<CategoriaDTO>(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarCategoria(id: string): Promise<void> {
  return apiFetch<void>(`/categorias/${id}`, { method: 'DELETE' })
}
