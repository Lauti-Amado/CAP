//frontend/src/types/certificado.ts
export type EstadoCertificado = 'Sin_enviar' | 'Pendiente' | 'Enviado'

export type CandidatoCertificado = {
  inscripcionId: string
  dni: string
  nombre: string
  apellido: string
  email: string | null
  numeroSocio: number | null
  dorsal: string | null
  distancia: { kilometraje: number; tipoDistancia: 'Participativa' | 'Competitiva' }
  puesto: number | null
  tiempo: string | null
  estado: EstadoCertificado
}

export type ResultadoEnvioCertificado = {
  estado: 'Enviado' | 'Pendiente'
  mensaje: string
}

export type ResultadoReintento = {
  enviados: number
  pendientes: number
}