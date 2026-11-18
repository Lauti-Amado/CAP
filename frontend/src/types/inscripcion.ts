
export type EstadoInscripcionBackend =
  | 'En_proceso'
  | 'Pagada'
  | 'Anulada'
  | 'Confirmada'

export type TipoDistanciaBackend = 'Participativa' | 'Competitiva'

export type InscripcionListadoDTO = {
  id: string
  estado: EstadoInscripcionBackend
  fechaHoraCreacion: string
  corredor: {
    nombre: string
    apellido: string
    dni: string
  }
  carrera: {
    id: string
    nombre: string
  }
  distancia: {
    kilometraje: number
    tipoDistancia: TipoDistanciaBackend
  }
  pago: {
    pagado: boolean
    metodo: 'Pago_virtual' | 'Pago_presencial'
  }
  kitEntregado: boolean
}

export type PaginaDTO<T> = {
  datos: T[]
  total: number
  pagina: number
  totalPaginas: number
}

export type FiltrosListadoInscripciones = {
  carreraId?: string
  dni?: string
  kilometraje?: number
  tipoDistancia?: TipoDistanciaBackend
  pagado?: boolean
  estado?: EstadoInscripcionBackend
  anio?: number
  pagina: number
  limite: number
}


export type Inscripcion = {
  id: string
  dni: string
  corredor: string
  carrera: string
  distancia: string
  fecha: string
  tipo: 'Socio' | 'No socio'
  pago: string
  estado: string
}

export type FiltrosInscripciones = {
  dni: string
  carrera: string
  distancia: string
  pago: string
  estado: string
  anio: string
  pagina: number
}

export type InscripcionDetalle = {
  id: string
  numero: string
  estado: string
  carrera: string
  fechaInscripcion: string

  corredor: {
    nombreCompleto: string
    dni: string
    fechaNacimiento: string
    genero: string
    telefono: string
    email: string
    discapacidad: string
    equipoClub: string
  }

  participacion: {
    distancia: string
    tipo: string
  }

  pago: {
    estado: string
    metodo: string
    total: string
    adicionales: string
  }

  entrega: {
    estadoKit: string
    dorsal: string
    chipRfid: string
    fechaEntrega: string
    aptoMedico: string
  }
}

export type ContactoEmergencia = {
  nombre: string
  apellido: string
  dni: string
  telefono: string
}

export type ContactoEmergenciaDTO = {
  dni: string
  nombre: string
  apellido: string
  telefono: string
}


export type InscripcionDetalleDTO = {
  id: string
  estado: string
  fechaHoraCreacion: string
  carrera: {
    id: string
    nombre: string
    estado: string
    fechaHoraCarrera: string
  }
  distancia: {
    kilometraje: number
    tipoDistancia: string
    precio: number
  }
  corredor: {
    dni: string
    nombre: string
    apellido: string
    telefono: string
    sexo: string
    fechaNacimiento: string
    discapacidad: string | null
    equipo: string | null
    email: string | null
    contactoEmergencia: ContactoEmergenciaDTO
  }
  pago: {
    pagado: boolean
    metodo: string
    total: number
    productos: {
      nombre: string
      variante: string
      cantidad: number
    }[]
  }
  aptoMedico: {
    requerido: boolean
    vigente: boolean
    fechaVencimiento: string | null
  }
  entrega: {
    id: string
    inscripcionId: string
    fechaHoraEntrega: string
    dorsal: {
      id: string
      numero: string
      chip: {
        id: string
        numero: number
      } | null
    }
  } | null
}


export type OpcionesInscripcionDTO = {
  carrera: {
    id: string
    nombre: string
    estado: string
    fechaHoraCarrera: string
    admiteInscripciones: boolean
  }
  cupo: {
    maximo: number
    ocupados: number
  }
  distancias: {
    kilometraje: number
    tipoDistancia: string
    precio: number
  }[]
  productos: {
    id: string
    nombre: string
    variantes: {
      id: string
      nombre: string
      precio: number
      stock: number
    }[]
  }[]
}
export type CrearInscripcionPayload = {
  corredor: {
    dni: string
    nombre: string
    apellido: string
    telefono: string
    sexo: 'Femenino' | 'Masculino'
    fechaNacimiento: string
    discapacidad?:
      | 'Discapacidad_general'
      | 'Discapacidad_silla'
      | 'Discapacidad_visual'
  }
  contactoEmergencia: ContactoEmergencia
  aptoMedico?: {
    fechaVencimiento: string
  }
  distancia: {
    kilometraje: number
    tipoDistancia: TipoDistanciaBackend
  }
  productos: {
    varianteId: string
    cantidad: number
  }[]
}