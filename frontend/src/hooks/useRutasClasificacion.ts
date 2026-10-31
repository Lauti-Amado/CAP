//frontend/src/hooks/useRutasClasificacion.ts
import { useParams } from 'react-router-dom'

/**
 * Las pantallas de clasificación se usan en dos lugares:
 *  - Clasificación (clasificador):  /clasificador/clasificaciones/:nombreCarrera/...  → carrera en curso
 *  - Carreras (administrador):      /administrador/carreras/:id/clasificacion/...     → carrera finalizada
 * Este hook arma las rutas según dónde se esté, para que "volver" y "guardar" no saquen al usuario de su sección.
 */
export function useRutasClasificacion() {
  const { nombreCarrera, id } = useParams()
  const enCarreras = nombreCarrera === undefined

  const base = enCarreras
    ? `/administrador/carreras/${id}/clasificacion`
    : `/clasificador/clasificaciones/${nombreCarrera}`

  const listado = enCarreras ? `${base}/completa` : `${base}/tiempo-real`

  const corredor = (corredorId: number | string, cola = '') => `${base}/${corredorId}${cola}`

  // Después de guardar: pasa al siguiente corredor de la cola (?siguientes=2,3) o vuelve al listado
  const trasGuardar = (search: string) => {
    const siguientes = new URLSearchParams(search).get('siguientes')?.split(',').filter(Boolean) ?? []
    if (siguientes.length === 0) return listado
    const [proximo, ...resto] = siguientes
    return corredor(proximo, resto.length > 0 ? `?siguientes=${resto.join(',')}` : '')
  }

  return { enCarreras, carreraId: id, dashboard: base, listado, corredor, trasGuardar }
}