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
