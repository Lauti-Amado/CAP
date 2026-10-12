export type Inscripcion = {
  id: number
  dni: string
  corredor: string
  carrera: string
  distancia: string
  fecha: string
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
  id: number
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