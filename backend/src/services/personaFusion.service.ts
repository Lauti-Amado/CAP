//backend/src/services/personaFusion.service.ts
// Lecturas para la fusión de Personas por DNI (ver docs/integracion/fusion-persona-dni-web.md).
// El ejecutor del plan (escrituras) todavía no existe: depende del resultado del spike de convivencia
// entre Prisma y PowerSync (docs/decisiones/03-convivencia-prisma-powersync.md).
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import type { PersonaResumen } from "../rules/fusionPersonas.rules";

type Tx = Prisma.TransactionClient;

export type DniDuplicado = { dni: string; cantidad: number };

// Con el @unique de la base no debería haber DNIs repetidos, pero las vistas de PowerSync no lo hacen cumplir
export async function buscarDnisDuplicados(): Promise<DniDuplicado[]> {
    const grupos = await prisma.persona.groupBy({
        by: ["dni"],
        _count: { _all: true },
        having: { dni: { _count: { gt: 1 } } },
    });
    return grupos.map((grupo) => ({ dni: grupo.dni, cantidad: grupo._count._all }));
}

export async function listarPersonasPorDni(tx: Tx, dni: string): Promise<{ id: string; fechaHoraCreacion: Date }[]> {
    return tx.persona.findMany({
        where: { dni },
        select: { id: true, fechaHoraCreacion: true },
        orderBy: { fechaHoraCreacion: "asc" },
    });
}

// Foto de una Persona con todo lo que la referencia, lista para planificarFusion
export async function cargarResumenPersona(tx: Tx, personaId: string): Promise<PersonaResumen> {
    const persona = await tx.persona.findUnique({
        where: { id: personaId },
        select: {
            id: true,
            usuario: { select: { id: true } },
            corredor: {
                select: {
                    id: true,
                    afiliacion: { select: { id: true } },
                    aptosMedicos: { select: { id: true } },
                    inscripciones: {
                        select: {
                            id: true,
                            idCarrera: true,
                            estado: true,
                            entregaKit: { select: { id: true } },
                        },
                    },
                },
            },
            corredoresContactoEmergencia: { select: { id: true } },
        },
    });
    if (!persona) throw new ErrorNoEncontrado("Persona no encontrada.");

    return {
        id: persona.id,
        usuarioId: persona.usuario?.id ?? null,
        corredor: persona.corredor && {
            id: persona.corredor.id,
            afiliacionId: persona.corredor.afiliacion?.id ?? null,
            aptosMedicosIds: persona.corredor.aptosMedicos.map((apto) => apto.id),
            inscripciones: persona.corredor.inscripciones.map((inscripcion) => ({
                id: inscripcion.id,
                idCarrera: inscripcion.idCarrera,
                estado: inscripcion.estado,
                tieneEntregaKit: inscripcion.entregaKit !== null,
            })),
        },
        contactoDeCorredoresIds: persona.corredoresContactoEmergencia.map((corredor) => corredor.id),
    };
}