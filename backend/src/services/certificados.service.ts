//backend/src/services/certificados.service.ts
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { inscripcionCertificadoInclude, toCandidatoCertificadoDto, type CandidatoCertificadoDTO, type InscripcionCertificado, type ResultadoEnvioCertificadoDTO, type ResultadoReintentoDTO,} from "../dtos/certificado.dto";
import * as reglas from "../rules/certificado.rules";
import { enviarEmailConPlantilla, ErrorEmailNoDisponible, leerConfiguracionBrevo } from "./email.service";

const LIMITE_CANDIDATOS = 20;

// Candado contra doble click: evita enviar dos veces el mismo certificado en simultáneo
const enviosEnCurso = new Set<string>();

async function obtenerCarrera(carreraId: string) {
    const carrera = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { id: true } });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");
}

async function obtenerInscripcion(inscripcionId: string): Promise<InscripcionCertificado> {
    const inscripcion = await prisma.inscripcion.findUnique({
        where: { id: inscripcionId },
        include: inscripcionCertificadoInclude,
    });
    if (!inscripcion) throw new ErrorNoEncontrado("Inscripción no encontrada.");
    return inscripcion;
}

const enCola = (inscripcionId: string) =>
    prisma.certificadoCarrera.upsert({
        where: { inscripcionId },
        create: { inscripcionId, enviado: false, url: "" },
        update: {},
    });

const marcarEnviado = (inscripcionId: string) =>
    prisma.certificadoCarrera.upsert({
        where: { inscripcionId },
        create: { inscripcionId, enviado: true, url: "" },
        update: { enviado: true },
    });

// Socios que finalizaron la carrera (solo ellos pueden recibir certificado)
export async function listarCandidatos(carreraId: string, busqueda?: string): Promise<CandidatoCertificadoDTO[]> {
    await obtenerCarrera(carreraId);

    const inscripciones = await prisma.inscripcion.findMany({
        where: {
            distanciaCarrera: { idCarrera: carreraId },
            corredor: { afiliacion: { isNot: null } },
            clasificacion: { is: { estado: "Finalizo", resultado: { isNot: null } } },
            ...(busqueda
                ? {
                    OR: [
                        { corredor: { persona: { dni: { contains: busqueda } } } },
                        { corredor: { persona: { nombre: { contains: busqueda } } } },
                        { corredor: { persona: { apellido: { contains: busqueda } } } },
                        { entregaKit: { dorsal: { numero: { contains: busqueda } } } },
                    ],
                }
                : {}),
        },
        include: inscripcionCertificadoInclude,
        orderBy: { clasificacion: { resultado: { puestoGeneral: "asc" } } },
        take: LIMITE_CANDIDATOS,
    });

    return inscripciones.map(toCandidatoCertificadoDto);
}

export async function listarPendientes(carreraId: string): Promise<CandidatoCertificadoDTO[]> {
    await obtenerCarrera(carreraId);

    const inscripciones = await prisma.inscripcion.findMany({
        where: {
            distanciaCarrera: { idCarrera: carreraId },
            certificadoCarrera: { is: { enviado: false } },
        },
        include: inscripcionCertificadoInclude,
    });

    return inscripciones.map(toCandidatoCertificadoDto);
}

export async function enviarCertificado(inscripcionId: string): Promise<ResultadoEnvioCertificadoDTO> {
    if (enviosEnCurso.has(inscripcionId)) {
        throw new ErrorReglaDeNegocio("El certificado de este corredor ya se está enviando.");
    }
    enviosEnCurso.add(inscripcionId);

    try {
        const inscripcion = await obtenerInscripcion(inscripcionId);
        const { email, resultado } = reglas.validarEnviable(inscripcion);
        const { plantillaCertificadoId } = leerConfiguracionBrevo();
        const { persona } = inscripcion.corredor;
        const nombre = `${persona.nombre} ${persona.apellido}`;

        try {
            await enviarEmailConPlantilla({
                para: { email, nombre },
                plantillaId: plantillaCertificadoId,
                parametros: {
                    nombre,
                    carrera: inscripcion.distanciaCarrera.carrera.nombre,
                    distancia: `${inscripcion.distanciaCarrera.distancia.kilometraje} km`,
                    puesto: resultado.puestoGeneral,
                    tiempo: reglas.formatearTiempo(resultado.tiempoLlegada) ?? "-",
                },
            });
        } catch (error) {
            if (!(error instanceof ErrorEmailNoDisponible)) throw error;
            console.error(`Certificado de ${email} en cola:`, error.message);
            await enCola(inscripcion.id);
            return {
                estado: "Pendiente",
                mensaje: "Sin conexión: el certificado quedó en cola y se enviará al reintentar.",
            };
        }

        try {
            await marcarEnviado(inscripcion.id);
        } catch (error) {
            console.error(`Certificado enviado a ${email} pero no se pudo registrar el envío:`, error);
        }
        return { estado: "Enviado", mensaje: `Certificado enviado a ${email}.` };
    } finally {
        enviosEnCurso.delete(inscripcionId);
    }
}

// Reintenta la cola de la carrera. Corta en el primer "sin conexión" para no insistir.
export async function reintentarPendientes(carreraId: string): Promise<ResultadoReintentoDTO> {
    const pendientes = await listarPendientes(carreraId);
    let enviados = 0;

    for (const { inscripcionId } of pendientes) {
        try {
            const resultado = await enviarCertificado(inscripcionId);
            if (resultado.estado === "Pendiente") break;
            enviados++;
        } catch (error) {
            console.error(`No se pudo reintentar el certificado de la inscripción ${inscripcionId}:`, error);
        }
    }

    return { enviados, pendientes: pendientes.length - enviados };
}