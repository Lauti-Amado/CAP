//backend/src/dtos/carreraDetalle.dto.ts
import type { CarreraDTO } from "./carrera.dto";

export type CarreraDetalleDTO = CarreraDTO & {
    cantidadInscriptos: number;
    cantidadInscriptosConfirmados: number;
    cantidadKitsEntregados: number;
    cantidadClasificados: number;
};