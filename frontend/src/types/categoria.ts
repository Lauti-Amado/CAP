export type CriterioCategoria = {
  nombre: string
  valor: string
}

export type CategoriaDTO = {
  id: string
  nombre: string
  descripcion: string
  criterios: CriterioCategoria[]
}

export type DatosCategoria = {
  nombre: string
  descripcion: string
  criterios: CriterioCategoria[]
}

export type CarreraConfiguracion = {
  nombre: string
  fecha: string
  ubicacion: string
  distancia: string
}

export type Clasificacion = {
  id: number
  nombre: string
  descripcion: string
  predeterminada: boolean
  etiqueta?: string
  subcategorias?: string[]
  acento: string
}
