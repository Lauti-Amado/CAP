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

export type OpcionRol = {
  rol: RolUsuario
  descripcion: string
}