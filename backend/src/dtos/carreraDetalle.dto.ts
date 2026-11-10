//backend/src/dtos/carreraDetalle.dto.ts
import type { CarreraDTO } from "./carrera.dto";

export type CarreraDetalleDTO = CarreraDTO & {
    cantidadInscriptos: number;
    cantidadKitsEntregados: number;
    cantidadClasificados: number;
};