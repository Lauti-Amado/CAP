//backend/src/listeners/clasificacionEnVivo.listener.ts
import { alActualizarseClasificacion } from "../events/clasificacion.events";
import { avisarClasificacionActualizada } from "../services/clasificacionEnVivo.service";

export function registrarListenerClasificacionEnVivo() {
    alActualizarseClasificacion(({ carreraId }) => {
        avisarClasificacionActualizada(carreraId);
    });
}
