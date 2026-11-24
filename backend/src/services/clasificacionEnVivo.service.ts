//backend/src/services/clasificacionEnVivo.service.ts
import type { Response } from "express";

// Clientes con la pantalla de clasificación abierta (Server-Sent Events), agrupados por carrera
const clientes = new Map<string, Set<Response>>();

const LATIDO_MS = 25_000;

// Registra la conexión de un cliente. Devuelve la función que la da de baja.
export function suscribirCliente(carreraId: string, res: Response): () => void {
    const deLaCarrera = clientes.get(carreraId) ?? new Set<Response>();
    deLaCarrera.add(res);
    clientes.set(carreraId, deLaCarrera);

    // Un comentario SSE cada tanto evita que la conexión inactiva se corte
    const latido = setInterval(() => res.write(": latido\n\n"), LATIDO_MS);

    return () => {
        clearInterval(latido);
        deLaCarrera.delete(res);
        if (deLaCarrera.size === 0) clientes.delete(carreraId);
    };
}

// Avisa a los clientes de la carrera que la clasificación cambió. No envía datos:
// cada cliente vuelve a pedir la clasificación, que sigue siendo la única fuente de verdad.
export function avisarClasificacionActualizada(carreraId: string): void {
    for (const res of clientes.get(carreraId) ?? []) {
        res.write(`event: clasificacion\ndata: ${JSON.stringify({ carreraId })}\n\n`);
    }
}

// Al apagar el backend: server.close() espera a que terminen las conexiones abiertas
export function cerrarClientes(): void {
    for (const deLaCarrera of clientes.values()) {
        for (const res of deLaCarrera) res.end();
    }
    clientes.clear();
}
