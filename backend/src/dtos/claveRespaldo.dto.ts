//backend/src/dtos/claveRespaldo.dto.ts
import { EstadoClaveRespaldo } from "../generated/prisma/client";

export type ClaveRespaldoDTO = {
    id: string;
    numero: number;
    clave: string;
    estado: EstadoClaveRespaldo;
    fechaHoraUso: Date | null;
};