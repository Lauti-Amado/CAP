//backend/src/listeners/resultadoCategoria.listener.ts
import { alActualizarseClasificacion } from "../events/clasificacion.events";
import { regenerarSiCorresponde } from "../services/resultadoCategoria.service";

const enCurso = new Map<string, { repetir: boolean }>();

async function regenerar(carreraId: string) {
    const actual = enCurso.get(carreraId);
    if (actual) {
        actual.repetir = true;
        return;
    }

    const estado = { repetir: false };
    enCurso.set(carreraId, estado);

    try {
        do {
            estado.repetir = false;
            await regenerarSiCorresponde(carreraId);
        } while (estado.repetir);
    } catch (error) {
        console.error(`No se pudieron regenerar los resultados por categoría de la carrera ${carreraId}:`, error);
    } finally {
        enCurso.delete(carreraId);
    }
}

export function registrarListenerResultadosCategoria() {
    alActualizarseClasificacion(({ carreraId }) => {
        void regenerar(carreraId);
    });
}