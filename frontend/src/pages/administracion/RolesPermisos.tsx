//frontend/src/pages/administracion/RolesPermisos.tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { RolUsuario } from '../../types/administracion'
// MOCK TEMPORAL
import { opcionesRolMock, usuariosMock } from './administracionMock'
import './Administracion.css'

function RolesPermisos() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // MOCK TEMPORAL
  // TODO BACKEND: GET /api/usuarios/{id}
  const usuario = usuariosMock.find((u) => u.id === Number(id))

  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario | null>(
    usuario?.rol ?? null
  )

  const volverAAdministracion = () => navigate('/administracion')

  if (!usuario) {
    return (
      <main className="main-content p-4">
        <h1 className="h3 fw-bold">Usuario no encontrado</h1>
        <p className="text-secondary">No se encontró un usuario con el identificador indicado.</p>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={volverAAdministracion}>
          Volver a administración
        </button>
      </main>
    )
  }

  const iniciales = usuario.nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const guardarCambios = () => {
    // TODO BACKEND: PATCH /api/usuarios/{id} con { rol: rolSeleccionado }
    volverAAdministracion()
  }

  return (
    <main className="main-content p-4">
      <h1 className="h2 fw-bold mb-4">Roles y Permisos</h1>

      <div className="row g-3">
        {/* =========================
            USUARIO
        ========================= */}
        <div className="col-12 col-lg-4">
          <section className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
                <span className="admin-avatar">{iniciales}</span>
                <div>
                  <div className="fw-bold">{usuario.nombre}</div>
                  <span className={`admin-pill ${usuario.estado === 'Activo' ? 'admin-badge--activo' : 'admin-badge--inactivo'}`}>
                    {usuario.estado}
                  </span>
                </div>
              </div>

              <div className="small text-secondary">DNI</div>
              <div className="fw-bold mb-3">{usuario.dni}</div>

              <div className="small text-secondary">Email</div>
              <div className="fw-bold">{usuario.correo}</div>
            </div>
          </section>
        </div>

        {/* =========================
            ASIGNACIÓN DE ROL
        ========================= */}
        <div className="col-12 col-lg-8">
          <section className="card h-100">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-1">Asignación de Rol</h2>
              <p className="text-secondary small mb-3">
                Seleccione el rol que definirá los permisos y accesos del usuario en la plataforma.
              </p>

              <div className="d-grid gap-2 pb-3 mb-3 border-bottom" role="radiogroup" aria-label="Rol">
                {opcionesRolMock.map(({ rol, descripcion }) => {
                  const seleccionado = rolSeleccionado === rol
                  return (
                    <button
                      type="button"
                      key={rol}
                      role="radio"
                      aria-checked={seleccionado}
                      className={`admin-rol d-flex justify-content-between align-items-center${seleccionado ? ' admin-rol--seleccionado' : ''}`}
                      onClick={() => setRolSeleccionado(rol)}
                    >
                      <span>
                        <span className="admin-rol__titulo d-block fw-bold small">{rol}</span>
                        <span className="d-block text-secondary small">{descripcion}</span>
                      </span>
                      {seleccionado && (
                        <span className="admin-rol__check">
                          <Check size={12} aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={volverAAdministracion}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-sm admin-btn-primary"
                  disabled={!rolSeleccionado}
                  onClick={guardarCambios}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default RolesPermisos