// frontend/src/hooks/useClasificacionEnVivo.ts
import { useEffect, useRef } from 'react'

const BASE = import.meta.env.VITE_API_URL

// Varios avisos seguidos (por ejemplo, una ráfaga de llegadas) se juntan en una sola recarga
const ESPERA_MS = 300

// Escucha los avisos del backend (Server-Sent Events) y ejecuta `alActualizar`
// cuando cambia la clasificación de la carrera. La sesión viaja en la cookie httpOnly.
export function useClasificacionEnVivo(carreraId: string | undefined, alActualizar: () => void) {
  const alActualizarRef = useRef(alActualizar)

  useEffect(() => {
    alActualizarRef.current = alActualizar
  }, [alActualizar])

  useEffect(() => {
    if (!carreraId) return

    const fuente = new EventSource(
      `${BASE}/carreras/${carreraId}/clasificacion/eventos`,
      { withCredentials: true }
    )

    let temporizador: ReturnType<typeof setTimeout> | undefined
    let primeraConexion = true

    // Si la conexión se cortó y volvió, se pudieron perder avisos: se vuelve a cargar
    fuente.onopen = () => {
      if (!primeraConexion) alActualizarRef.current()
      primeraConexion = false
    }

    fuente.addEventListener('clasificacion', () => {
      clearTimeout(temporizador)
      temporizador = setTimeout(() => alActualizarRef.current(), ESPERA_MS)
    })

    return () => {
      clearTimeout(temporizador)
      fuente.close()
    }
  }, [carreraId])
}
