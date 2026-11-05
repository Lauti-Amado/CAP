import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, Plus, Save, Trash2 } from 'lucide-react'
import { ApiError } from '../../../services/apiService'
import { actualizarCategoria, crearCategoria, obtenerCategoria } from '../../../services/categoriaService'
import type { CriterioCategoria, DatosCategoria } from '../../../types/categoria'
import '../Administracion.css'
import './Categorias.css'

const formularioInicial: DatosCategoria = {
  nombre: '',
  descripcion: '',
  criterios: [],
}

function NuevaCategoria() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editando = id !== undefined
  const [form, setForm] = useState<DatosCategoria>(formularioInicial)
  const [cargando, setCargando] = useState(editando)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const volver = () => navigate('/administrador/configuraciones/categorias')

  useEffect(() => {
    if (!id) return
    let activo = true
    obtenerCategoria(id)
      .then((categoria) => {
        if (activo) setForm({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          criterios: categoria.criterios.map((criterio) => ({ ...criterio })),
        })
      })
      .catch((e: unknown) => {
        if (activo) setError(e instanceof ApiError ? e.message : 'No se pudo cargar la categoría.')
      })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [id])

  const actualizarCampo = (campo: 'nombre' | 'descripcion', valor: string) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  const actualizarCriterio = (indice: number, campo: keyof CriterioCategoria, valor: string) => {
    setForm((anterior) => ({
      ...anterior,
      criterios: anterior.criterios.map((criterio, i) => i === indice ? { ...criterio, [campo]: valor } : criterio),
    }))
  }

  const agregarCriterio = () => {
    setForm((anterior) => ({
      ...anterior,
      criterios: [...anterior.criterios, { nombre: '', valor: '' }],
    }))
  }

  const quitarCriterio = (indice: number) => {
    setForm((anterior) => ({
      ...anterior,
      criterios: anterior.criterios.filter((_, i) => i !== indice),
    }))
  }

  const puedeGuardar = form.nombre.trim().length > 0 && form.descripcion.trim().length > 0 &&
    form.criterios.every((criterio) => criterio.nombre.trim() && criterio.valor.trim())

  const guardar = async () => {
    if (!puedeGuardar || guardando) return
    setGuardando(true)
    setError('')
    const datos: DatosCategoria = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      criterios: form.criterios.map(({ nombre, valor }) => ({ nombre: nombre.trim(), valor: valor.trim() })),
    }
    try {
      if (id) await actualizarCategoria(id, datos)
      else await crearCategoria(datos)
      volver()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar la categoría.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <main className="main-content p-4"><p className="text-secondary">Cargando categoría...</p></main>
  }

  return (
    <main className="main-content cat-form p-4">
      <header className="d-flex align-items-start gap-3 mb-4">
        <button type="button" className="btn btn-link text-dark p-0 mt-1" aria-label="Volver a categorías" onClick={volver}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div>
          <h1 className="h2 fw-bold mb-1">{editando ? 'Editar categoría' : 'Nueva categoría'}</h1>
          <p className="text-secondary small mb-0">Definí el nombre, la descripción y los criterios de clasificación.</p>
        </div>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <section className="card mb-3">
            <div className="card-body">
              <h2 className="h6 fw-bold pb-2 mb-3 border-bottom">Información general</h2>
              <div className="mb-3">
                <label htmlFor="categoriaNombre" className="form-label small fw-semibold">Nombre <span className="text-danger">*</span></label>
                <input id="categoriaNombre" type="text" maxLength={100} className="form-control form-control-sm" placeholder="Ej.: 30 a 39 años" value={form.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} />
              </div>
              <div>
                <label htmlFor="categoriaDescripcion" className="form-label small fw-semibold">Descripción <span className="text-danger">*</span></label>
                <textarea id="categoriaDescripcion" maxLength={500} className="form-control form-control-sm" rows={3} placeholder="Describí a qué grupo corresponde esta categoría." value={form.descripcion} onChange={(e) => actualizarCampo('descripcion', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-2 mb-3 border-bottom">
                <div>
                  <h2 className="h6 fw-bold mb-1">Criterios de clasificación</h2>
                  <p className="text-secondary small mb-0">Cada criterio tiene un nombre y un valor.</p>
                </div>
                <button type="button" className="btn btn-outline-success btn-sm" onClick={agregarCriterio}>
                  <Plus size={14} className="me-1" aria-hidden="true" /> Agregar criterio
                </button>
              </div>

              {form.criterios.length === 0 ? (
                <p className="text-secondary small mb-0">Todavía no agregaste criterios. Podés crear la categoría sin criterios y completarlos después.</p>
              ) : form.criterios.map((criterio, indice) => (
                <div className="row g-2 align-items-end mb-3" key={indice}>
                  <div className="col-12 col-md-5">
                    <label htmlFor={`criterioNombre-${indice}`} className="form-label small fw-semibold">Nombre del criterio</label>
                    <input id={`criterioNombre-${indice}`} className="form-control form-control-sm" placeholder="Ej.: Edad mínima" value={criterio.nombre} onChange={(e) => actualizarCriterio(indice, 'nombre', e.target.value)} />
                  </div>
                  <div className="col-10 col-md-5">
                    <label htmlFor={`criterioValor-${indice}`} className="form-label small fw-semibold">Valor</label>
                    <input id={`criterioValor-${indice}`} className="form-control form-control-sm" placeholder="Ej.: 30" value={criterio.valor} onChange={(e) => actualizarCriterio(indice, 'valor', e.target.value)} />
                  </div>
                  <div className="col-2 col-md-2 d-grid">
                    <button type="button" className="btn btn-outline-danger btn-sm" aria-label={`Quitar criterio ${indice + 1}`} onClick={() => quitarCriterio(indice)}>
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-4">
          <aside className="card" aria-label="Vista previa">
            <div className="cat-vista-header d-flex justify-content-between align-items-center px-3 py-2">
              <span className="small fw-bold text-secondary">VISTA PREVIA</span>
              <Eye size={14} className="text-secondary" aria-hidden="true" />
            </div>
            <div className="card-body">
              <h2 className={`h6 fw-bold mb-1 ${form.nombre.trim() ? 'text-success' : 'text-secondary'}`}>{form.nombre.trim() || 'Nombre de la categoría'}</h2>
              <p className="text-secondary small mb-3">{form.descripcion.trim() || 'Sin descripción.'}</p>
              {form.criterios.map((criterio, indice) => (
                <div className="d-flex justify-content-between gap-3 small py-2 border-top" key={indice}>
                  <span className="text-secondary">{criterio.nombre || 'Criterio'}</span>
                  <strong>{criterio.valor || '—'}</strong>
                </div>
              ))}
              <div className="d-grid gap-2 mt-3">
                <button type="button" className="btn btn-sm admin-btn-primary d-inline-flex align-items-center justify-content-center gap-2" disabled={!puedeGuardar || guardando} onClick={() => void guardar()}>
                  <Save size={14} aria-hidden="true" /> {guardando ? 'Guardando...' : 'Guardar categoría'}
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={volver} disabled={guardando}>Cancelar</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default NuevaCategoria
