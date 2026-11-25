//frontend/src/types/clasificacionApi.ts
// Tipos que espeja los DTOs del backend para el endpoint GET /carreras/:id/clasificacion

export type Sexo = 'Masculino' | 'Femenino'

export type EstadoClasificacionApi =
  | 'Pendiente'
  | 'Finalizo'
  | 'No_finalizo'
  | 'No_largo'
  | 'Descalificado'

export type FiltrosClasificacion = {
  estado:    EstadoClasificacionApi
  busqueda:  string   // nombre, apellido, DNI o dorsal
  distancia: number   // kilometraje exacto (ej: 10, 21)
  sexo:      Sexo
  categoria: string   // nombre de categoría (parcial)
  pagina:    number
  limite:    number
}

export type ClasificacionDTO = {
  id: string
  estado: EstadoClasificacionApi
  inscripcionId: string
  corredor: {
    dni: string
    nombre: string
    apellido: string
    sexo: Sexo
    discapacidad: string | null
  }
  dorsal: string | null
  equipo: string | null
  distancia: {
    kilometraje: number
    tipoDistancia: string
  }
  resultado: {
    id: string
    tiempoLlegada: number | null
    puestoGeneral: number
    estado: string
    categorias: { categoriaId: string; nombre: string; puesto: number }[]
    fechaHoraCreacion: string
    fechaHoraModificacion: string
  } | null
}

export type PaginaClasificacion = {
  datos: ClasificacionDTO[]
  total: number
  pagina: number
  totalPaginas: number
}


export type ResumenClasificacionDTO = {
  participantes: number
  llegados: number
  pendientes: number
  noFinalizaron: number
  noLargaron: number
  descalificados: number
  progreso: number // porcentaje de llegados sobre los que largaron (0-100)
}

export type ClasificacionTiempoRealDTO = {
  carrera: {
    id: string
    estado: string
    fechaHoraCarrera: string
  }
  resumen: ResumenClasificacionDTO
  llegadas: ClasificacionDTO[] // las más recientes primero
}

export type EstadoManualClasificacion = 'Descalificado' | 'No_finalizo' | 'No_largo'

export type RegistrarResultadoBody = {
  puestoGeneral: number
  tiempoLlegada?: number | null
  estado?: string
}
