//frontend/src/hooks/useDetalleCarrera.ts
import { useEffect, useState } from 'react'
import { ApiError } from '../services/apiService'
import { obtenerDetalleCarrera } from '../services/carreraService'
import type { CarreraDetalle } from '../types/carrera'

// Con id undefined no consulta nada (por ejemplo, cuando la pantalla no está en modo "carrera finalizada")
export function useDetalleCarrera(id: string | undefined) {
  const [carrera, setCarrera] = useState<CarreraDetalle | null>(null)
  const [cargando, setCargando] = useState(id !== undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return undefined
    let activo = true

    setCargando(true)
    obtenerDetalleCarrera(id)
      .then((datos) => {
        if (!activo) return
        setCarrera(datos)
        setError(null)
      })
      .catch((e: unknown) => {
        if (activo) setError(e instanceof ApiError ? e.message : 'No se pudo cargar la carrera')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => { activo = false }
  }, [id])

  return { carrera, cargando, error }
}