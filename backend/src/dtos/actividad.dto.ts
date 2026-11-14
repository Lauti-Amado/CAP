//backend/src/dtos/actividad.dto.ts
export type ActividadTipo = "lectura" | "kit" | "inscripcion";

export type ActividadDTO = {
    id: string;
    tipo: ActividadTipo;
    descripcion: string;
    fechaHora: Date;
};