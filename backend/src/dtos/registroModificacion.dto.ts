//backend/src/dtos/registroModificacion.dto.ts
import type { AccionAuditada, EntidadAuditada } from "../generated/prisma/client";

export type RegistroModificacionDTO = {
    id: string;
    fechaHora: Date;
    usuario: { id: string; nombre: string };
    entidad: EntidadAuditada;
    entidadId: string;
    accion: AccionAuditada;
    campo: string;
    valorAnterior: string | null;
    valorNuevo: string | null;
};
