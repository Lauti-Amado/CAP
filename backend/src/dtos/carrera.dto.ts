export type EstadoCarrera = "Creada" | "Publicada" | "Activa" | "Entrega_kits" | "En_curso" | "Finalizada" | "Cancelada";
export type TipoDistancia = "Participativa" | "Competitiva";

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

    distancias: Distancia[] //Se accede desde una Carrera con carrera.DistanciaCarrera.Distancia
}

export type Distancia = {
    kilometraje: number;
    tipoDistancia: TipoDistancia;
    precio: number;
}

export type Lugar = {
    nombre: string;
    localidad: string; //Se accede desde un Lugar con lugar.Localidad
}