//frontend/src/pages/administracion/categorias/ConfiguracionClasificaciones.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, MapPin, Pencil, Plus, Ruler, Trash2 } from 'lucide-react'
import type { Clasificacion } from '../../../types/categoria'
// MOCK TEMPORAL
import { carreraConfiguracionMock, clasificacionesMock } from './categoriasMock'
import '../Administracion.css'
import './Categorias.css'

function ConfiguracionClasificaciones() {
  const navigate = useNavigate()

  // MOCK TEMPORAL
  // TODO BACKEND: GET /api/carreras/{id}/clasificaciones
  const carrera = carreraConfiguracionMock
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>(clasificacionesMock)
  const [porEliminar, setPorEliminar] = useState<Clasificacion | null>(null)

  const datosCarrera = [
    { icon: CalendarDays, etiqueta: 'Fecha', valor: carrera.fecha },
    { icon: MapPin, etiqueta: 'Ubicación', valor: carrera.ubicacion },
    { icon: Ruler, etiqueta: 'Distancia', valor: carrera.distancia },
  ]

  const confirmarEliminacion = () => {
    if (!porEliminar) return
    // TODO BACKEND: DELETE /api/clasificaciones/{id}
    setClasificaciones((anteriores) => anteriores.filter((c) => c.id !== porEliminar.id))
    setPorEliminar(null)
  }

  return (
    <main className="main-content p-4">
      {/* =========================
          ENCABEZADO
      ========================= */}
      <header className="mb-3">
        <h1 className="h2 fw-bold mb-1">Configuración de clasificaciones</h1>
        <p className="fw-bold text-success mb-0">{carrera.nombre}</p>
      </header>

      {/* =========================
          DATOS DE LA CARRERA
      ========================= */}
      <section className="card mb-4" aria-label="Datos de la carrera">
        <div className="card-body py-2">
          <div className="d-flex flex-wrap">
            {datosCarrera.map(({ icon: Icon, etiqueta, valor }) => (
              <div className="cat-dato d-flex align-items-center gap-2 px-3 py-2 flex-fill" key={etiqueta}>
                <span className="admin-icono">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <div className="text-secondary small">{etiqueta}</div>
                  <div className="fw-bold small">{valor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          CLASIFICACIONES
      ========================= */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h6 fw-bold mb-0">Clasificaciones configuradas</h2>
        <button
          type="button"
          className="btn btn-sm cat-btn-oscuro d-inline-flex align-items-center gap-2"
          onClick={() => navigate('/administrador/configuraciones/categorias/nueva')}
        >
          <Plus size={14} aria-hidden="true" />
          Nueva categoría
        </button>
      </div>

      <section className="row g-3" aria-label="Clasificaciones configuradas">
        {clasificaciones.map((clasificacion) => (
          <div className="col-12 col-md-6 col-xl-4" key={clasificacion.id}>
            <article className={`card cat-card h-100${clasificacion.acento === 'gris' ? ' cat-card--gris' : ''}`}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <h3 className="h6 fw-bold mb-0">{clasificacion.nombre}</h3>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-secondary p-0"
                      aria-label={`Editar ${clasificacion.nombre}`}
                      onClick={() => navigate(`/administrador/configuraciones/categorias/${clasificacion.id}/editar`)}
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-secondary p-0"
                      aria-label={`Eliminar ${clasificacion.nombre}`}
                      onClick={() => setPorEliminar(clasificacion)}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="text-secondary small mb-2">{clasificacion.descripcion}</p>

                {clasificacion.subcategorias && (
                  <ul className="small ps-3 mb-0">
                    {clasificacion.subcategorias.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-3 d-flex justify-content-between align-items-center">
                  <span>
                    {clasificacion.etiqueta && (
                      <span className="badge rounded-pill admin-badge--clasificador">
                        {clasificacion.etiqueta}
                      </span>
                    )}
                  </span>
                  {clasificacion.predeterminada && (
                    <span className="badge rounded-pill admin-badge--activo">Predeterminada</span>
                  )}
                </div>
              </div>
            </article>
          </div>
        ))}
      </section>

      {/* =========================
          CONFIRMAR ELIMINACIÓN
      ========================= */}
      {porEliminar && (
        <>
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title h5" id="titulo-eliminar">Eliminar clasificación</h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setPorEliminar(null)}
                  />
                </div>
                <div className="modal-body">
                  ¿Desea eliminar <strong>{porEliminar.nombre}</strong>? Esta acción no se puede deshacer.
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPorEliminar(null)}
                  >
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={confirmarEliminacion}>
                    Eliminar
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