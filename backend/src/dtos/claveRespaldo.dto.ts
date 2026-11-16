//backend/src/dtos/claveRespaldo.dto.ts
import { EstadoClaveRespaldo } from "../generated/prisma/client";

export type ClaveRespaldoDTO = {
    id: string;
    clave: string;
    estado: EstadoClaveRespaldo;
    fechaHoraUso: Date | null;
};

//Una cuenta que puede usar claves de respaldo
export type CuentaClavesDTO = {
    id: string;
    nombre: string; //Nombre y apellido
    dni: string;
    correo: string;
    disponibles: number;
};