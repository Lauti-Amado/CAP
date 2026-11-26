//backend/src/dtos/plantillaCertificado.dto.ts
import type { PlantillaCertificado } from "../generated/prisma/client";

export type PlantillaCertificadoDTO = Omit<PlantillaCertificado, "fechaHoraCreacion">;

export function toPlantillaCertificadoDto(p: PlantillaCertificado): PlantillaCertificadoDTO {
    const { fechaHoraCreacion: _omitida, ...dto } = p;
    return dto;
}