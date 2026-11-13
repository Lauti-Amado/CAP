//backend/src/dtos/certificado.dto.ts
import { Prisma } from "../generated/prisma/client";
import type { TipoDistancia } from "../generated/prisma/client";
import { estadoCertificado, formatearTiempo } from "../rules/certificado.rules";

export const inscripcionCertificadoInclude = {
    corredor: { include: { persona: { include: { usuario: true } }, afiliacion: true } },
    distanciaCarrera: { include: { distancia: true, carrera: true } },
    entregaKit: { include: { dorsal: true } },
    clasificacion: { include: { resultado: true } },
    certificadoCarrera: true,
} satisfies Prisma.InscripcionInclude;

export type InscripcionCertificado = Prisma.InscripcionGetPayload<{ include: typeof inscripcionCertificadoInclude }>;

export type EstadoCertificado = "Sin_enviar" | "Pendiente" | "Enviado";

export type CandidatoCertificadoDTO = {
    inscripcionId: string;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    numeroSocio: number | null;
    dorsal: string | null;
    distancia: { kilometraje: number; tipoDistancia: TipoDistancia };
    puesto: number | null;
    tiempo: string | null; //HH:MM:SS
    estado: EstadoCertificado;
};

export type ResultadoEnvioCertificadoDTO = {
    estado: "Enviado" | "Pendiente";
    mensaje: string;
};

export type ResultadoReintentoDTO = {
    enviados: number;
    pendientes: number;
};

export function toCandidatoCertificadoDto(i: InscripcionCertificado): CandidatoCertificadoDTO {
    const { persona, afiliacion } = i.corredor;
    const resultado = i.clasificacion?.resultado;

    return {
        inscripcionId: i.id,
        dni: persona.dni,
        nombre: persona.nombre,
        apellido: persona.apellido,
        email: persona.usuario?.email ?? null,
        numeroSocio: afiliacion?.numeroSocio ?? null,
        dorsal: i.entregaKit?.dorsal.numero ?? null,
        distancia: {
            kilometraje: i.distanciaCarrera.distancia.kilometraje,
            tipoDistancia: i.distanciaCarrera.distancia.tipoDistancia,
        },
        puesto: resultado?.puestoGeneral ?? null,
        tiempo: formatearTiempo(resultado?.tiempoLlegada ?? null),
        estado: estadoCertificado(i.certificadoCarrera),
    };
}