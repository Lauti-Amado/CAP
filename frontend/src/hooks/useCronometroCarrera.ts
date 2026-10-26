//frontend/src/hooks/useCronometroCarrera.ts
import { useCallback, useEffect, useState } from 'react'
import { formatearDuracionConMs } from '../utils/tiempo'

export type EstadoCronometro = 'sin-iniciar' | 'en-curso' | 'finalizada'

type RegistroCarrera = { inicio: number; fin?: number }

// MOCK TEMPORAL
// TODO BACKEND: la hora de inicio es Carrera.fechaHoraCarrera (se actualiza al iniciar,
// junto con estado = En_curso). El fin se registra al pasar la carrera a Finalizada.
const CLAVE = 'cap.carrera.cronometro'

const INTERVALO_MS = 50

function leer(): RegistroCarrera | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as RegistroCarrera) : null
  } catch {
    return null
  }
}

function guardar(registro: RegistroCarrera | null) {
  try {
    if (registro) localStorage.setItem(CLAVE, JSON.stringify(registro))
    else localStorage.removeItem(CLAVE)
  } catch {
    // Sin almacenamiento: el cronómetro funciona igual mientras la pantalla esté abierta
  }
}

export function useCronometroCarrera() {
  const [registro, setRegistro] = useState<RegistroCarrera | null>(leer)
  const [ahora, setAhora] = useState(() => Date.now())

  const enCurso = registro !== null && registro.fin === undefined

  useEffect(() => {
    if (!enCurso) return undefined
    setAhora(Date.now())
    const intervalo = setInterval(() => setAhora(Date.now()), INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [enCurso])

  const estado: EstadoCronometro =
    registro === null ? 'sin-iniciar' : registro.fin === undefined ? 'en-curso' : 'finalizada'

  const transcurridoMs = registro === null ? 0 : (registro.fin ?? ahora) - registro.inicio

  const iniciar = useCallback(() => {
    const nuevo: RegistroCarrera = { inicio: Date.now() }
    guardar(nuevo)
    setRegistro(nuevo)
  }, [])

  const reiniciar = useCallback(() => {
  guardar(null)
  setRegistro(null)
}, [])

  const finalizar = useCallback(() => {
    if (!registro || registro.fin !== undefined) return
    const nuevo: RegistroCarrera = { ...registro, fin: Date.now() }
    guardar(nuevo)
    setRegistro(nuevo)
  }, [registro])

  return { estado, transcurrido: formatearDuracionConMs(transcurridoMs), iniciar, finalizar, reiniciar }
}