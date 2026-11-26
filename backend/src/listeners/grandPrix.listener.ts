import { alActualizarseClasificacion } from "../events/clasificacion.events";
import { actualizarPorCarrera } from "../services/grandPrix.service";

// Se agrupan notificaciones repetidas y se serializa SQLite durante los recálculos.
const pendientes = new Set<string>();
let procesando = false;
async function procesar() {
    if (procesando) return;
    procesando = true;
    try {
        while (pendientes.size) {
            const carreraId = pendientes.values().next().value!;
            pendientes.delete(carreraId);
            try {
                await actualizarPorCarrera(carreraId);
            } catch (error) {
                console.error("No se pudo actualizar el Grand Prix:", error);
            }
        }
    } finally {
        procesando = false;
    }
}
export function registrarListenerGrandPrix() {
    alActualizarseClasificacion(({ carreraId }) => {
        pendientes.add(carreraId);
        void procesar();
    });
}
