//frontend/src/hooks/useCronometroCarrera.ts
import { useEffect, useState } from 'react'
import type { Carrera } from '../types/carrera'
import { formatearDuracionConMs } from '../utils/tiempo'

export type EstadoCronometro = 'sin-iniciar' | 'en-curso' | 'finalizada'

const INTERVALO_MS = 50

// El estado y la hora real de largada y fin vienen de la carrera: el backend los guarda al iniciar y al finalizar.
export function useCronometroCarrera(carrera: Carrera | null | undefined) {
  const [ahora, setAhora] = useState(() => Date.now())
  const enCurso = carrera?.estado === 'En_curso'

  useEffect(() => {
    if (!enCurso) return undefined
    setAhora(Date.now())
    const intervalo = setInterval(() => setAhora(Date.now()), INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [enCurso])

  const estado: EstadoCronometro = enCurso
    ? 'en-curso'
    : carrera?.estado === 'Finalizada'
      ? 'finalizada'
      : 'sin-iniciar'

  // Las carreras anteriores no tienen hora real guardada: se usan los campos viejos
  const inicio = carrera ? new Date(carrera.fechaHoraInicio ?? carrera.fechaHoraCarrera).getTime() : 0   // MODIFICADO
  const fin = carrera ? new Date(carrera.fechaHoraFin ?? carrera.fechaHoraModificacion).getTime() : 0  
  const transcurridoMs = estado === 'en-curso' ? ahora - inicio : estado === 'finalizada' ? fin - inicio : 0

  return { estado, transcurrido: formatearDuracionConMs(transcurridoMs) }
}