//frontend/src/types/carrera.ts
type EstadoCarrera = "Creada" | "Publicada" | "Activa" | "Entrega_kits" | "En_curso" | "Finalizada" | "Cancelada"
type TipoDistancia = "Participativa" | "Competitiva"

//este Carrera type es igual a como lo manda en el payload el backend
export type Carrera = {
  id: string;
  estado: EstadoCarrera;
  nombre: string;
  fechaHoraCarrera: Date;
  fechaHoraEntregaKits: Date;
  imagenUrl: string;
  descripcion: string;
  participantesMax: number;
  lugar: Lugar;

  distancias: Distancia[]
    fechaHoraModificacion: Date;   // Al finalizar la carrera es la hora de fin
}

export type Distancia = {
  kilometraje: number;
  tipoDistancia: TipoDistancia;
  precio: number;
}

export type Lugar = {
  nombre: string;
  localidad: string;
}

// Detalle de una carrera: la carrera + los conteos que calcula el backend
export type CarreraDetalle = Carrera & {
  cantidadInscriptos: number
  cantidadKitsEntregados: number
  cantidadClasificados: number
}