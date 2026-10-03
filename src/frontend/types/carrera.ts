export type Distancia = {
  kilometraje: number
  tipoDistancia: string
}

export type DistanciaCarrera = {
  id: number
  precioDistancia: number
  distancia: Distancia
}

export type Lugar = {
  nombre: string
  localidad: {
    nombre: string
  }
}

export type Carrera = {
  id: number
  nombre: string
  fechaHora: string
  imagenUrl: string
  descripcion: string
  cupoMax: number
  estado: string
  lugar: Lugar
  distanciaCarrera: DistanciaCarrera[]
}