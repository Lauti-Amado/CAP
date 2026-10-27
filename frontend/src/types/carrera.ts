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