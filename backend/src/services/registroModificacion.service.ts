//backend/src/services/registroModificacion.service.ts
import type { AccionAuditada, EntidadAuditada, Prisma } from "../generated/prisma/client";
import { cambiosRegistrables, type CambioCampo } from "../rules/registroModificacion.rules";

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
