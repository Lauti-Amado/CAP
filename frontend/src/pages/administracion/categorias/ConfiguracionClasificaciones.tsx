import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ApiError } from '../../../services/apiService'
import { eliminarCategoria, listarCategorias } from '../../../services/categoriaService'
import type { CategoriaDTO } from '../../../types/categoria'
import '../Administracion.css'
import './Categorias.css'

const esCategoriaProtegida = (nombre: string) =>
  ['Edad CAP', 'Discapacidades', 'Sexo'].some(
    (nombreProtegido) =>
      nombreProtegido.toLowerCase() === nombre.trim().toLowerCase()
  )

function ConfiguracionClasificaciones() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [porEliminar, setPorEliminar] = useState<CategoriaDTO | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const cargarCategorias = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setCategorias(await listarCategorias())
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las categorías.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarCategorias()
  }, [cargarCategorias])

  const confirmarEliminacion = async () => {
    if (!porEliminar) return
    setEliminando(true)
    setError('')
    try {
      await eliminarCategoria(porEliminar.id)
      setPorEliminar(null)
      await cargarCategorias()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar la categoría.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <main className="main-content p-4">
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-1">Administración de categorías</h1>
        <p className="text-secondary mb-0">
          Configurá las categorías que se utilizan en la modalidad de clasificación por categorías.
        </p>
      </header>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h6 fw-bold mb-1">Categorías configuradas</h2>
          <p className="text-secondary small mb-0">Las modalidades General y Por discapacidades son fijas y no se administran desde aquí.</p>
        </div>
        <button
          type="button"
          className="btn btn-sm cat-btn-oscuro d-inline-flex align-items-center gap-2"
          onClick={() => navigate('/administrador/configuraciones/categorias/nueva')}
        >
          <Plus size={14} aria-hidden="true" /> Nueva categoría
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {cargando ? (
        <div className="text-secondary py-4" role="status">Cargando categorías...</div>
      ) : categorias.length === 0 ? (
        <section className="card">
          <div className="card-body text-center py-5">
            <h3 className="h6 fw-bold">Todavía no hay categorías configuradas</h3>
            <p className="text-secondary small mb-3">Creá una categoría para utilizarla en la clasificación de corredores.</p>
            <button
              type="button"
              className="btn btn-sm cat-btn-oscuro"
              onClick={() => navigate('/administrador/configuraciones/categorias/nueva')}
            >
              <Plus size={14} className="me-1" aria-hidden="true" /> Nueva categoría
            </button>
          </div>
        </section>
      ) : (
        <section className="row g-3" aria-label="Categorías configuradas">
          {categorias.map((categoria) => (
            <div className="col-12 col-md-6 col-xl-4" key={categoria.id}>
              <article className="card cat-card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h3 className="h6 fw-bold mb-0">{categoria.nombre}</h3>
                    {!esCategoriaProtegida(categoria.nombre) && (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-secondary p-0"
                          aria-label={`Editar ${categoria.nombre}`}
                          onClick={() => navigate(`/administrador/configuraciones/categorias/${categoria.id}`)}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          aria-label={`Eliminar ${categoria.nombre}`}
                          onClick={() => setPorEliminar(categoria)}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-secondary small mb-3">{categoria.descripcion || 'Sin descripción.'}</p>
                  <div className="small fw-semibold mb-1">Criterios</div>
                  {categoria.criterios.length ? (
                    <ul className="small ps-3 mb-0">
                      {categoria.criterios.map((criterio, indice) => (
                        <li key={`${criterio.nombre}-${indice}`}>{criterio.nombre}: {criterio.valor}</li>
                      ))}
                    </ul>
                  ) : <p className="text-secondary small mb-0">Sin criterios definidos.</p>}
                </div>
              </article>
            </div>
          ))}
        </section>
      )}

      {porEliminar && (
        <>
          <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="titulo-eliminar-categoria">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title h5" id="titulo-eliminar-categoria">Eliminar categoría</h2>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setPorEliminar(null)} disabled={eliminando} />
                </div>
                <div className="modal-body">
                  ¿Deseás eliminar <strong>{porEliminar.nombre}</strong>? Esta acción no se puede deshacer.
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPorEliminar(null)} disabled={eliminando}>Cancelar</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => void confirmarEliminacion()} disabled={eliminando}>
                    {eliminando ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </main>
  )
}

export default ConfiguracionClasificaciones
