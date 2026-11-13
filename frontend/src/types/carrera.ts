export type EstadoCarrera =
  | "Creada"
  | "Publicada"
  | "Activa"
  | "Entrega_kits"
  | "En_curso"
  | "Finalizada"
  | "Cancelada";

export type TipoDistancia =
  | "Participativa"
  | "Competitiva";

export type Carrera = {
  id: string;
  estado: EstadoCarrera;
  nombre: string;
  fechaHoraCarrera: string;
  fechaHoraEntregaKits: string;
  fechaHoraModificacion: Date;
  imagenUrl: string;
  descripcion: string;
  participantesMax: number;
  lugar: Lugar;
  distancias: Distancia[];
};

export type Distancia = {
  kilometraje: number;
  tipoDistancia: TipoDistancia;
  precio: number;
};

export type Lugar = {
  nombre: string;
  localidad: string;
};

// Detalle de una carrera: la carrera + los conteos que calcula el backend
export type CarreraDetalle = Carrera & {
  cantidadInscriptos: number;
  cantidadKitsEntregados: number;
  cantidadClasificados: number;
};
