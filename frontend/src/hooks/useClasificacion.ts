//frontend/src/hooks/useClasificacion.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { listarClasificacion } from '../services/clasificacionService'
import type { ClasificacionDTO, FiltrosClasificacion, PaginaClasificacion } from '../types/clasificacionApi'
import { ApiError } from '../services/apiService'

export type FiltrosActivos = Partial<FiltrosClasificacion>

const LIMITE_DEFAULT = 20

export function useClasificacion(carreraId: string | undefined) {
  const [filtros, setFiltros] = useState<FiltrosActivos>({ pagina: 1, limite: LIMITE_DEFAULT })
  const [datos, setDatos] = useState<ClasificacionDTO[]>([])
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Usamos una ref para cancelar peticiones desactualizadas
  const abortRef = useRef<AbortController | null>(null)

  const cargar = useCallback(async (filtrosActivos: FiltrosActivos) => {
    if (!carreraId) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setCargando(true)
    setError(null)

    try {
      const res: PaginaClasificacion = await listarClasificacion(carreraId, filtrosActivos)
      setDatos(res.datos)
      setTotal(res.total)
      setTotalPaginas(res.totalPaginas)
    } catch (e) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Error al cargar clasificaciones.')
    } finally {
      setCargando(false)
    }
  }, [carreraId])

  useEffect(() => {
    void cargar(filtros)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carreraId, JSON.stringify(filtros)])

  const cambiarFiltro = useCallback(<K extends keyof FiltrosActivos>(key: K, valor: FiltrosActivos[K]) => {
    setFiltros((prev) => ({ ...prev, [key]: valor, pagina: key === 'pagina' ? (valor as number) : 1 }))
  }, [])

  const cambiarPagina = useCallback((p: number) => {
    setFiltros((prev) => ({ ...prev, pagina: p }))
  }, [])

  return { datos, total, totalPaginas, cargando, error, filtros, cambiarFiltro, cambiarPagina }
}
