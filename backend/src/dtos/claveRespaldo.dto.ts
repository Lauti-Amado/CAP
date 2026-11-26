//backend/src/dtos/claveRespaldo.dto.ts
import { EstadoClaveRespaldo } from "../generated/prisma/client";

export type ClaveRespaldoDTO = {
    id: string;
        clave: string | null;   // null si no se pudo descifrar
    estado: EstadoClaveRespaldo;
    fechaHoraUso: Date | null;
    usos: number;   // más de 1 indica que se reutilizó
};

//Una cuenta que puede usar claves de respaldo
export type CuentaClavesDTO = {
    id: string;
    nombre: string; //Nombre y apellido
    dni: string;
    correo: string;
    disponibles: number;
};