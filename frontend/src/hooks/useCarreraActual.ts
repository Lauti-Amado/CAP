//frontend/src/hooks/useCarreraActual.ts
import { useParams } from 'react-router-dom'
import { useCarrera } from '../context/CarreraContext'
import { slugCarrera } from '../utils/carrera'
import type { Carrera } from '../types/carrera'

export function useCarreraActual(): Carrera | null {
  const { carreras } = useCarrera()
  const { id, nombreCarrera } = useParams()

  if (id) return carreras.find((c) => c.id === id) ?? null
  if (nombreCarrera) return carreras.find((c) => slugCarrera(c.nombre) === nombreCarrera) ?? null
  return null
}