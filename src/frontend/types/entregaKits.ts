export type CarreraActiva = {
  id: number
  nombre: string
  edicion: number
  estado: 'Activa'
  distancias: string[]
}

export type EstadoVerificacion =
  | 'pagado'
  | 'verificado'
  | 'pendiente'

export type CorredorDetalle = {
  id: number
  nombre: string
  dni: string
  categoria: string
  distancia: string
  talleRemera: string
  clubTeam: string

  inscripcion: {
    estado: EstadoVerificacion
  }

  aptoMedico?: {
    estado: EstadoVerificacion
  }

  habilitadoParaRetirarKit: boolean
}

export type UltimaEntrega = {
  id: number
  nombreCorredor: string
  numeroKit: number
  distancia: string
  minutosDesdeEntrega: number
}