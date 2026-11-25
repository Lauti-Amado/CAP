//frontend/src/hooks/useResumenClasificacion.ts
import { useCallback, useEffect, useState } from 'react'
import { obtenerClasificacionTiempoReal } from '../services/clasificacionService'
import type { ResumenClasificacionDTO } from '../types/clasificacionApi'
import { useClasificacionEnVivo } from './useClasificacionEnVivo'

// Totales de la carrera (participantes, llegados, pendientes, progreso).
// No depende de la página/filtros de la tabla y se refresca solo cuando cambia la clasificación.
export function useResumenClasificacion(carreraId: string | undefined, enVivo = false) {
  const [resumen, setResumen] = useState<ResumenClasificacionDTO | null>(null)

  const cargar = useCallback(async () => {
    if (!carreraId) return
    try {
      // limite 1: solo interesa el resumen, no las llegadas
      const respuesta = await obtenerClasificacionTiempoReal(carreraId, 1)
      setResumen(respuesta.resumen)
    } catch {
      // las estadísticas son complementarias: si fallan, la tabla sigue funcionando
    }
  }, [carreraId])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useClasificacionEnVivo(enVivo ? carreraId : undefined, () => void cargar())

  return resumen
}
