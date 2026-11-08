//backend/src/events/clasificacion.events.ts
import { EventEmitter } from "node:events";

const CLASIFICACION_ACTUALIZADA = "clasificacion.actualizada";

export type ClasificacionActualizada = { carreraId: string };

const emisor = new EventEmitter();

export function notificarClasificacionActualizada(evento: ClasificacionActualizada) {
    emisor.emit(CLASIFICACION_ACTUALIZADA, evento);
}

export function alActualizarseClasificacion(listener: (evento: ClasificacionActualizada) => void) {
    emisor.on(CLASIFICACION_ACTUALIZADA, listener);
}