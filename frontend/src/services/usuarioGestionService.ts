//frontend/src/services/usuarioGestionService.ts
import { apiFetch } from './apiService'
import type { PaginaUsuarios, RolUsuario, UsuarioAdministracion } from '../types/administracion'

export const listarUsuarios = (pagina: number) =>
  apiFetch<PaginaUsuarios>(`/usuarios?pagina=${pagina}`)

export const obtenerUsuario = (id: string) =>
  apiFetch<UsuarioAdministracion>(`/usuarios/${id}`)

export const actualizarRolesUsuario = (id: string, roles: RolUsuario[]) =>
  apiFetch<UsuarioAdministracion>(`/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ roles }),
  })