//frontend/src/types/administracion.ts
export type RolUsuario = 'Administrador' | 'Clasificador'
export type EstadoUsuario = 'Activo' | 'Inactivo'

export type Usuario = {
  id: string
  nombre: string
  dni: string
  correo: string
  rol: RolUsuario
  estado: EstadoUsuario
}

export type UsuarioAdministracion = {
  id: string
  nombre: string
  dni: string
  correo: string
  roles: RolUsuario[]
  estado: EstadoUsuario
}

export type PaginaUsuarios = {
  datos: UsuarioAdministracion[]
  total: number
  pagina: number
  totalPaginas: number
}

export type OpcionRol = {
  rol: RolUsuario
  descripcion: string
}