//frontend/src/pages/administracion/categorias/NuevaCategoria.tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Eye, Flag, Save, Users } from 'lucide-react'
import type { FormularioCategoria } from '../../../types/categoria'
// MOCK TEMPORAL
import { capacidadesMock, carrerasCategoriaMock, clasificacionesMock } from './categoriasMock'
import '../Administracion.css'
import './Categorias.css'

const formularioInicial: FormularioCategoria = {
  nombre: '',
  descripcion: '',
  carrera: carrerasCategoriaMock[0],
  tipo: 'edad-sexo',
  sexo: 'Masculino',
  edadMin: '',
  edadMax: '',
  capacidad: capacidadesMock[0],
}

function NuevaCategoria() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editando = id !== undefined

  // MOCK TEMPORAL
  // TODO BACKEND (edición): GET /api/categorias/{id} con todos sus criterios
  const existente = clasificacionesMock.find((c) => c.id === Number(id))

  const [form, setForm] = useState<FormularioCategoria>({
    ...formularioInicial,
    ...(existente ? { nombre: existente.nombre, descripcion: existente.descripcion } : {}),
  })

  const volver = () => navigate('/administrador/configuraciones/categorias')

  if (editando && !existente) {
    return (
      <main className="main-content p-4">
        <h1 className="h3 fw-bold">Categoría no encontrada</h1>
        <p className="text-secondary">No se encontró una categoría con el identificador indicado.</p>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={volver}>
          Volver a clasificaciones
        </button>
      </main>
    )
  }

  const actualizar = <K extends keyof FormularioCategoria>(
    campo: K,
    valor: FormularioCategoria[K]
  ) => setForm((anterior) => ({ ...anterior, [campo]: valor }))

  /* Validación */
  const edadMin = Number(form.edadMin)
  const edadMax = Number(form.edadMax)
  const hayRango = form.edadMin !== '' && form.edadMax !== ''
  const rangoInvertido = hayRango && edadMin > edadMax
  const puedeGuardar =
    form.nombre.trim() !== '' && (form.tipo === 'especial' || (hayRango && !rangoInvertido))

  const guardar = () => {
    if (!puedeGuardar) return
    // TODO BACKEND: editando ? PUT /api/categorias/{id} : POST /api/categorias
    volver()
  }

  /* Vista previa */
  const rangoEdad = `${form.edadMin || '–'} - ${form.edadMax || '–'} años`
  const criterios =
    form.tipo === 'edad-sexo'
      ? [
          { icon: Users, etiqueta: 'Sexo', valor: form.sexo },
          { icon: CalendarDays, etiqueta: 'Edad', valor: rangoEdad },
        ]
      : [{ icon: Users, etiqueta: 'Capacidad', valor: form.capacidad }]

  return (
    <main className="main-content cat-form p-4">
      {/* =========================
          ENCABEZADO
      ========================= */}
      <header className="d-flex align-items-start gap-3 mb-4">
        <button
          type="button"
          className="btn btn-link text-dark p-0 mt-1"
          aria-label="Volver a clasificaciones"
          onClick={volver}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div>
          <h1 className="h2 fw-bold mb-1">{editando ? 'Editar Categoría' : 'Nueva Categoría'}</h1>
          <p className="text-secondary small mb-0">
            Definir parámetros para clasificación de corredores.
          </p>
        </div>
      </header>

      <div className="row g-3">
        {/* =========================
            FORMULARIO
        ========================= */}
        <div className="col-12 col-lg-8">
          <section className="card mb-3">
            <div className="card-body">
              <h2 className="h6 fw-bold pb-2 mb-3 border-bottom">Información General</h2>

              <div className="mb-3">
                <label htmlFor="categoriaNombre" className="form-label small fw-semibold">
                  Nombre de la categoría <span className="text-danger">*</span>
                </label>
                <input
                  id="categoriaNombre"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej: 30-34 Masculino"
                  value={form.nombre}
                  onChange={(e) => actualizar('nombre', e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="categoriaDescripcion" className="form-label small fw-semibold">
                  Descripción
                </label>
                <textarea
                  id="categoriaDescripcion"
                  className="form-control form-control-sm"
                  rows={3}
                  placeholder="Ej: Corredores masculinos de 30 a 34 años."
                  value={form.descripcion}
                  onChange={(e) => actualizar('descripcion', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="categoriaCarrera" className="form-label small fw-semibold">
                  Uso en Carrera
                </label>
                <select
                  id="categoriaCarrera"
                  className="form-select form-select-sm"
                  value={form.carrera}
                  onChange={(e) => actualizar('carrera', e.target.value)}
                >
                  {carrerasCategoriaMock.map((carrera) => (
                    <option key={carrera} value={carrera}>
                      {carrera}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold pb-2 mb-3 border-bottom">Criterios de Clasificación</h2>

              <div className="small fw-semibold mb-2">Tipo de Categoría</div>
              <div className="row g-2 mb-3" role="radiogroup" aria-label="Tipo de categoría">
                {[
                  { valor: 'edad-sexo', texto: 'Por Edad y Sexo' },
                  { valor: 'especial', texto: 'Especial / Capacidades' },
                ].map(({ valor, texto }) => {
                  const activa = form.tipo === valor
                  return (
                    <div className="col-12 col-sm-6" key={valor}>
                      <label className={`cat-opcion d-flex align-items-center gap-2${activa ? ' cat-opcion--activa' : ''}`}>
                        <input
                          type="radio"
                          name="tipoCategoria"
                          className="form-check-input mt-0"
                          checked={activa}
                          onChange={() => actualizar('tipo', valor as FormularioCategoria['tipo'])}
                        />
                        <span className="small">{texto}</span>
                      </label>
                    </div>
                  )
                })}
              </div>

              {form.tipo === 'edad-sexo' ? (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="categoriaSexo" className="form-label small fw-semibold">Sexo</label>
                    <select
                      id="categoriaSexo"
                      className="form-select form-select-sm"
                      value={form.sexo}
                      onChange={(e) => actualizar('sexo', e.target.value as FormularioCategoria['sexo'])}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="categoriaEdadMin" className="form-label small fw-semibold">
                      Rango de Edad
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        id="categoriaEdadMin"
                        type="number"
                        min={0}
                        className={`form-control form-control-sm${rangoInvertido ? ' is-invalid' : ''}`}
                        placeholder="Mín."
                        value={form.edadMin}
                        onChange={(e) => actualizar('edadMin', e.target.value)}
                      />
                      <span aria-hidden="true">-</span>
                      <input
                        type="number"
                        min={0}
                        className={`form-control form-control-sm${rangoInvertido ? ' is-invalid' : ''}`}
                        placeholder="Máx."
                        aria-label="Edad máxima"
                        value={form.edadMax}
                        onChange={(e) => actualizar('edadMax', e.target.value)}
                      />
                    </div>
                    {rangoInvertido && (
                      <div className="text-danger small mt-1">
                        La edad mínima no puede ser mayor que la máxima.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="categoriaCapacidad" className="form-label small fw-semibold">
                    Capacidad
                  </label>
                  <select
                    id="categoriaCapacidad"
                    className="form-select form-select-sm"
                    value={form.capacidad}
                    onChange={(e) => actualizar('capacidad', e.target.value)}
                  >
                    {capacidadesMock.map((capacidad) => (
                      <option key={capacidad} value={capacidad}>
                        {capacidad}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =========================
            VISTA PREVIA
        ========================= */}
        <div className="col-12 col-lg-4">
          <aside className="card" aria-label="Vista previa">
            <div className="cat-vista-header d-flex justify-content-between align-items-center px-3 py-2">
              <span className="small fw-bold text-secondary">VISTA PREVIA</span>
              <Eye size={14} className="text-secondary" aria-hidden="true" />
            </div>

            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                <h2 className={`h6 fw-bold mb-0 ${form.nombre.trim() ? 'text-success' : 'text-secondary'}`}>
                  {form.nombre.trim() || 'Nombre de la categoría'}
                </h2>
                <span className="badge rounded-pill admin-badge--activo">Activo</span>
              </div>

              <p className="text-secondary small mb-3">
                {form.descripcion.trim() || 'Sin descripción.'}
              </p>

              {criterios.map(({ icon: Icon, etiqueta, valor }) => (
                <div className="d-flex justify-content-between small py-2 border-top" key={etiqueta}>
                  <span className="text-secondary d-flex align-items-center gap-2">
                    <Icon size={13} aria-hidden="true" />
                    {etiqueta}
                  </span>
                  <strong>{valor}</strong>
                </div>
              ))}
              <div className="d-flex justify-content-between small py-2 border-top mb-3">
                <span className="text-secondary d-flex align-items-center gap-2">
                  <Flag size={13} aria-hidden="true" />
                  Asignación
                </span>
                <strong>{form.carrera}</strong>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-sm admin-btn-primary d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={!puedeGuardar}
                  onClick={guardar}
                >
                  <Save size={14} aria-hidden="true" />
                  Guardar categoría
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={volver}>
                  Cancelar
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default NuevaCategoria