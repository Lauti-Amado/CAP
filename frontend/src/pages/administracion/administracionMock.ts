//frontend/src/pages/administracion/administracionMock.ts
import type { OpcionRol, Usuario } from '../../types/administracion'

// MOCK TEMPORAL
// TODO BACKEND: reemplazar por la consulta real de usuarios.
export const usuariosMock: Usuario[] = [
  { id: 1, nombre: 'Carlos Gómez', dni: '28.345.912', correo: 'cgomez@cap.org', rol: 'Administrador', estado: 'Activo' },
  { id: 2, nombre: 'Lucía Torres', dni: '32.112.544', correo: 'ltorres@cap.org', rol: 'Clasificador', estado: 'Activo' },
  { id: 3, nombre: 'Martín Silva', dni: '35.887.210', correo: 'msilva@cap.org', rol: 'Clasificador', estado: 'Inactivo' },
  { id: 4, nombre: 'Ana López', dni: '29.544.102', correo: 'alopez@cap.org', rol: 'Administrador', estado: 'Activo' },
]

export const opcionesRolMock: OpcionRol[] = [
  { rol: 'Administrador', descripcion: 'Acceso a la administración general y a la configuración del sistema.' },
  { rol: 'Clasificador', descripcion: 'Acceso a la clasificación, los horarios y los resultados.' },
]