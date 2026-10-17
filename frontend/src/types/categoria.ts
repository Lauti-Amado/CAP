//frontend/src/types/categoria.ts
export type Clasificacion = {
  id: number
  nombre: string
  descripcion: string
  predeterminada: boolean
  etiqueta?: string
  subcategorias?: string[]
  acento: 'verde' | 'gris'
}

export type CarreraConfiguracion = {
  nombre: string
  fecha: string
  ubicacion: string
  distancia: string
}

export type TipoCategoria = 'edad-sexo' | 'especial'
export type SexoCategoria = 'Masculino' | 'Femenino'

export type FormularioCategoria = {
  nombre: string
  descripcion: string
  carrera: string
  tipo: TipoCategoria
  sexo: SexoCategoria
  edadMin: string
  edadMax: string
  capacidad: string
}