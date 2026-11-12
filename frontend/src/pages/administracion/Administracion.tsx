//frontend/src/pages/administracion/Administracion.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Cpu, KeyRound, Pencil, Plus, Shapes, UserCog, type LucideIcon } from 'lucide-react'
import type { EstadoUsuario, RolUsuario, UsuarioAdministracion } from '../../types/administracion'
import { listarUsuarios } from '../../services/usuarioGestionService'
import ClavesRespaldoModal from '../../components/modales/ClavesRespaldoModal'
import './Administracion.css'

type Atajo = {
  titulo: string
  descripcion: string
  icon: LucideIcon
  path?: string   // sin path = pantalla todavía no creada
}

const atajos: Atajo[] = [
  { titulo: 'Categorías', descripcion: 'Clasificaciones de corredores.', icon: Shapes, path: '/administrador/configuraciones/categorias' },
  // TODO: navegar a la configuración RFID cuando exista
  { titulo: 'Configuración RFID', descripcion: 'Parámetros de cronometraje.', icon: Cpu },
  { titulo: 'Certificados', descripcion: 'Plantillas de premiación.', icon: Award, path: '/administrador/configuraciones/certificados' },
]

const claseRol: Record<RolUsuario, string> = {
  Administrador: 'admin-badge--administrador',
  Clasificador: 'admin-badge--clasificador',
}

const claseEstado: Record<EstadoUsuario, string> = {
  Activo: 'admin-badge--activo',
  Inactivo: 'admin-badge--inactivo',
}

function Administracion() {
  const navigate = useNavigate()
  const [mostrarClaves, setMostrarClaves] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [usuarios, setUsuarios] = useState<UsuarioAdministracion[]>([])
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)

    listarUsuarios(paginaActual)
      .then((respuesta) => {
        if (!activo) return
        setUsuarios(respuesta.datos)
        setTotal(respuesta.total)
        setTotalPaginas(respuesta.totalPaginas)
      })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar los usuarios')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => { activo = false }
  }, [paginaActual])

  return (
    <main className="main-content p-4">
      {/* =========================
          ENCABEZADO
      ========================= */}
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-1">Panel de Administración</h1>
        <p className="text-secondary small mb-0">
          Gestione la configuración global, roles de sistema y parámetros operativos de las carreras.
        </p>
      </header>

      {/* =========================
          ACCESOS
      ========================= */}
      <section className="row g-3 mb-3" aria-label="Accesos de administración">
        {atajos.map(({ titulo, descripcion, icon: Icon, path }) => (
          <div className="col-12 col-sm-6 col-xl-4" key={titulo}>
            <button
              type="button"
              className="card admin-atajo h-100 w-100 text-start"
              onClick={() => path && navigate(path)}
            >
              <div className="card-body">
                <span className="admin-icono mb-4">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h2 className="h6 fw-bold mb-1">{titulo}</h2>
                <p className="text-secondary small mb-0">{descripcion}</p>
              </div>
            </button>
          </div>
        ))}
      </section>

      {/* =========================
          CLAVES DE RESPALDO
      ========================= */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-sm admin-respaldo d-inline-flex align-items-center gap-2"
          onClick={() => setMostrarClaves(true)}   // MODIFICADO
        >
          <KeyRound size={14} aria-hidden="true" />
          Claves de respaldo
        </button>
      </div>

      {/* =========================
          GESTIÓN DE USUARIOS
      ========================= */}
      <section className="card">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h2 className="h5 fw-bold mb-1 d-flex align-items-center gap-2">
              <UserCog size={18} className="text-success" aria-hidden="true" />
              Gestión de Usuarios
            </h2>
            <p className="text-secondary small mb-0">
              Administre el acceso al sistema CAP Gestión.
            </p>
          </div>

          {/* TODO: navegar al alta de usuario cuando exista la pantalla */}
          <button
            type="button"
            className="btn btn-sm admin-btn-primary d-inline-flex align-items-center gap-2"
          >
            <Plus size={14} aria-hidden="true" />
            Nuevo usuario
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small admin-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Correo</th>
                <th>Roles</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <span className="spinner-border spinner-border-sm" role="status" aria-label="Cargando" />
                  </td>
                </tr>
              )}

              {!cargando && error && (
                <tr>
                  <td colSpan={6} className="text-center text-danger py-4">{error}</td>
                </tr>
              )}

              {!cargando && !error && usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-secondary py-4">No hay usuarios para mostrar.</td>
                </tr>
              )}

              {!cargando && !error && usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="fw-semibold">{usuario.nombre}</td>
                  <td>{usuario.dni}</td>
                  <td>{usuario.correo}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {usuario.roles.map((rol) => (
                        <span key={rol} className={`admin-pill ${claseRol[rol]}`}>{rol}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-pill ${claseEstado[usuario.estado]}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-secondary p-0 ms-auto me-0"
                        aria-label={`Editar roles de ${usuario.nombre}`}
                        onClick={() => navigate(`/administrador/configuraciones/${usuario.id}`)}
                      >
                        <Pencil size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white d-flex justify-content-between align-items-center small text-secondary">
          <span>Mostrando {usuarios.length} de {total} usuarios</span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
      <ClavesRespaldoModal show={mostrarClaves} onCerrar={() => setMostrarClaves(false)} />
    </main>
  )
}

export default Administracion