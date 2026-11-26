//backend/src/rules/certificado.rules.ts
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type { EstadoCertificado, InscripcionCertificado } from "../dtos/certificado.dto";

export function formatearTiempo(ms: number | null): string | null {
    if (ms === null) return null;
    const total = Math.floor(ms / 1000);
    const dos = (n: number) => String(n).padStart(2, "0");
    return `${dos(Math.floor(total / 3600))}:${dos(Math.floor((total % 3600) / 60))}:${dos(total % 60)}`;
}

// CertificadoCarrera.enviado = false significa "en cola"; true, "enviado"
export function estadoCertificado(certificado: { enviado: boolean } | null): EstadoCertificado {
    if (!certificado) return "Sin_enviar";
    return certificado.enviado ? "Enviado" : "Pendiente";
}

// Devuelve lo necesario para enviar o lanza el motivo por el cual no se puede
export function validarEnviable(inscripcion: InscripcionCertificado) {
    if (inscripcion.distanciaCarrera.carrera.estado !== "Finalizada") {
        throw new ErrorReglaDeNegocio("Los certificados se envían una vez finalizada la carrera.");
    }
    if (!inscripcion.corredor.afiliacion) {
        throw new ErrorReglaDeNegocio("Los certificados solo se envían a socios.");
    }
    const email = inscripcion.corredor.persona.usuario?.email;
    if (!email) {
        throw new ErrorReglaDeNegocio("El socio no tiene un correo registrado.");
    }
    const resultado = inscripcion.clasificacion?.resultado;
    if (inscripcion.clasificacion?.estado !== "Finalizo" || !resultado) {
        throw new ErrorReglaDeNegocio("Solo se puede enviar el certificado a corredores que finalizaron la carrera.");
    }
    if (inscripcion.certificadoCarrera?.enviado) {
        throw new ErrorReglaDeNegocio("El certificado de este corredor ya fue enviado.");
    }
    return { email, resultado };
}