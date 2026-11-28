//backend/src/services/registroModificacion.service.ts
import type { AccionAuditada, EntidadAuditada, Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { toPaginaDto, type PaginaDTO } from "../dtos/pagina.dto";
import type { RegistroModificacionDTO } from "../dtos/registroModificacion.dto";
import { cambiosRegistrables, type CambioCampo } from "../rules/registroModificacion.rules";
import type { FiltrosRegistroModificacion } from "../validations/registroModificacion.validations";

type Tx = Prisma.TransactionClient;

export type EntradaRegistro = {
    usuarioId: string;
    carreraId: string;
    entidad: EntidadAuditada;
    entidadId: string;
    accion: AccionAuditada;
    cambios: CambioCampo[];
    // Se recibe como parámetro para no depender del reloj dentro de la lógica
    ahora?: Date;
};

// Guarda una fila por cada campo que cambió. Se llama DENTRO de la misma transacción que
// hace la modificación: si esta falla, el registro tampoco queda; y si el registro falla, no se modifica nada.
export async function registrarModificacion(tx: Tx, entrada: EntradaRegistro): Promise<void> {
    const cambios = cambiosRegistrables(entrada.cambios);
    if (cambios.length === 0) return;

    const fechaHora = entrada.ahora ?? new Date();

    await tx.registroModificacion.createMany({
        data: cambios.map((cambio) => ({
            entidad: entrada.entidad,
            entidadId: entrada.entidadId,
            accion: entrada.accion,
            campo: cambio.campo,
            valorAnterior: cambio.valorAnterior,
            valorNuevo: cambio.valorNuevo,
            carreraId: entrada.carreraId,
            usuarioId: entrada.usuarioId,
            fechaHora,
        })),
    });
}

// Historial de modificaciones manuales de una carrera, de la más reciente a la más antigua
export async function listarPorCarrera(carreraId: string, filtros: FiltrosRegistroModificacion): Promise<PaginaDTO<RegistroModificacionDTO>> {
    const carrera = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { id: true } });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const { pagina, limite, entidad, entidadId, usuarioId } = filtros;
    const where: Prisma.RegistroModificacionWhereInput = {
        carreraId,
        ...(entidad && { entidad }),
        ...(entidadId && { entidadId }),
        ...(usuarioId && { usuarioId }),
    };

    const [total, registros] = await Promise.all([
        prisma.registroModificacion.count({ where }),
        prisma.registroModificacion.findMany({
            where,
            orderBy: { fechaHora: "desc" },
            skip: (pagina - 1) * limite,
            take: limite,
            include: { usuario: { include: { persona: true } } },
        }),
    ]);

    const datos: RegistroModificacionDTO[] = registros.map((r) => ({
        id: r.id,
        fechaHora: r.fechaHora,
        usuario: { id: r.usuarioId, nombre: `${r.usuario.persona.nombre} ${r.usuario.persona.apellido}` },
        entidad: r.entidad,
        entidadId: r.entidadId,
        accion: r.accion,
        campo: r.campo,
        valorAnterior: r.valorAnterior,
        valorNuevo: r.valorNuevo,
    }));

    return toPaginaDto(datos, total, pagina, limite);
}
