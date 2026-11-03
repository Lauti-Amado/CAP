export type EstadoInscripcion =
  | 'En_proceso'
  | 'Pagada'
  | 'Confirmada'
  | 'Anulada'

export type ChipDTO = {
  id: string
  numero: number
}

export type DorsalDTO = {
  id: string
  numero: string
  chip: ChipDTO | null
}

export type EntregaKitDTO = {
  id: string
  inscripcionId: string
  fechaHoraEntrega: string
  dorsal: DorsalDTO
}

export type EntregaRecienteDTO = EntregaKitDTO & {
  corredor: {
    nombre: string
    apellido: string
  }
  distancia: {
    kilometraje: number
    tipoDistancia: 'Participativa' | 'Competitiva'
  }
}

export type CorredorEntregaKitDTO = {
  inscripcionId: string

  corredor: {
    id: string
    nombre: string
    apellido: string
    dni: string
    fechaNacimiento: string
    sexo: 'Masculino' | 'Femenino'
  }

  distancia: {
    kilometraje: number
    tipoDistancia: 'Participativa' | 'Competitiva'
  }

  talleRemera: string | null
  equipo: {
    nombre: string
    codigoEquipo: string | null
  } | null

  inscripcion: {
    estado: EstadoInscripcion
    pagada: boolean
  }

  aptoMedico: {
    aprobado: boolean
    fechaVencimiento: string
  } | null

  habilitadoParaRetirarKit: boolean
  motivosNoHabilitado: string[]

  entregaKit: EntregaKitDTO | null
}

// Tipo de presentación utilizado por componentes existentes.
// No representa los estados que devuelve el backend.
export type EstadoVerificacion =
  | 'pagado'
  | 'verificado'
  | 'pendiente'