//frontend/src/pages/administracion/RolesPermisos.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { RolUsuario, UsuarioAdministracion } from '../../types/administracion'
import { ApiError } from '../../services/apiService'
import { actualizarRolesUsuario, obtenerUsuario } from '../../services/usuarioGestionService'
import { useAuth } from '../../context/AuthContext'
import { opcionesRol } from './opcionesRol'
import './Administracion.css'

function RolesPermisos() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario: sesion } = useAuth()

  const [usuario, setUsuario] = useState<UsuarioAdministracion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [rolesSeleccionados, setRolesSeleccionados] = useState<RolUsuario[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let activo = true

    obtenerUsuario(id)
      .then((encontrado) => {
        if (!activo) return
        setUsuario(encontrado)
        setRolesSeleccionados(encontrado.roles)
      })
      .catch((e) => {
        if (!activo) return
        // 404 = el usuario no existe. Cualquier otro error se muestra tal cual
        if (!(e instanceof ApiError && e.status === 404)) {
          setErrorCarga(e instanceof Error ? e.message : 'No se pudo cargar el usuario')
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => { activo = false }
  }, [id])

  const volverAAdministracion = () => navigate('/administrador/configuraciones')

  if (cargando) {
    return (
      <main className="main-content p-4">
        <span className="spinner-border" role="status" aria-label="Cargando" />
      </main>
    )
  }

  if (!usuario) {
    return (
      <main className="main-content p-4">
        <h1 className="h3 fw-bold">{errorCarga ? 'No se pudo cargar el usuario' : 'Usuario no encontrado'}</h1>
        <p className="text-secondary">
          {errorCarga ?? 'No se encontró un usuario con el identificador indicado.'}
        </p>
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

  // Nadie puede quitarse a sí mismo el rol de Administrador (el backend también lo rechaza)
  const esPropio = sesion?.id === usuario.id
  const rolProtegido = (rol: RolUsuario) => esPropio && rol === 'Administrador' && rolesSeleccionados.includes(rol)

  const huboCambios =
    rolesSeleccionados.length !== usuario.roles.length ||
    rolesSeleccionados.some((rol) => !usuario.roles.includes(rol))

  // marca o desmarca un rol (un usuario puede tener varios)
  const alternarRol = (rol: RolUsuario) => {
    if (rolProtegido(rol)) return
    setRolesSeleccionados((actuales) =>
      actuales.includes(rol) ? actuales.filter((r) => r !== rol) : [...actuales, rol]
    )
  }

  const guardarCambios = async () => {
    setGuardando(true)
    setError(null)
    try {
      await actualizarRolesUsuario(usuario.id, rolesSeleccionados)
      volverAAdministracion()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los cambios')
      setGuardando(false)
    }
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
              <h2 className="h5 fw-bold mb-1">Asignación de Roles</h2>
              <p className="text-secondary small mb-3">
                Seleccione los roles que definirán los permisos y accesos del usuario en la plataforma.
              </p>

              <div className="d-grid gap-2 pb-3 mb-3 border-bottom" role="group" aria-label="Roles">
                {opcionesRol.map(({ rol, descripcion }) => {
                  const seleccionado = rolesSeleccionados.includes(rol)
                  const bloqueado = rolProtegido(rol)
                  return (
                    <button
                      type="button"
                      key={rol}
                      role="checkbox"
                      aria-checked={seleccionado}
                      disabled={bloqueado}
                      title={bloqueado ? 'No podés quitarte tu propio rol de Administrador' : undefined}
                      className={`admin-rol d-flex justify-content-between align-items-center${seleccionado ? ' admin-rol--seleccionado' : ''}`}
                      onClick={() => alternarRol(rol)}
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

              {esPropio && (
                <p className="text-secondary small">
                  Estás editando tu propio usuario: no podés quitarte el rol de Administrador.
                </p>
              )}

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={volverAAdministracion}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-sm admin-btn-primary"
                  disabled={rolesSeleccionados.length === 0 || !huboCambios || guardando}
                  onClick={guardarCambios}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
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