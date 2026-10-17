//frontend/src/pages/administracion/Administracion.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Cpu,
  KeyRound,
  Pencil,
  Plus,
  Shapes,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import type { EstadoUsuario, RolUsuario } from '../../types/administracion'
// MOCK TEMPORAL
import { usuariosMock } from './administracionMock'
import './Administracion.css'

type Atajo = {
  titulo: string
  descripcion: string
  icon: LucideIcon
  path?: string   // sin path = pantalla todavía no creada
}

const atajos: Atajo[] = [
  { titulo: 'Categorías', descripcion: 'Clasificaciones de corredores.', icon: Shapes, path: '/administracion/categorias' },
  // TODO: navegar a la configuración RFID cuando exista
  { titulo: 'Configuración RFID', descripcion: 'Parámetros de cronometraje.', icon: Cpu },
  { titulo: 'Certificados', descripcion: 'Plantillas de premiación.', icon: Award, path: '/certificados' },
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
  const [paginaActual, setPaginaActual] = useState(1)

  // MOCK TEMPORAL
  // TODO BACKEND: GET /api/usuarios?pagina={paginaActual}
  const usuarios = usuariosMock
  const totalPaginas = 2   // temporal, para ver el botón "Siguiente" como en Figma

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
          TODO (compañero): implementar la acción de este botón.
      ========================= */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-sm admin-respaldo d-inline-flex align-items-center gap-2"
          onClick={() => {
            // TODO: pendiente de implementación
          }}
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
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="fw-semibold">{usuario.nombre}</td>
                  <td>{usuario.dni}</td>
                  <td>{usuario.correo}</td>
                  <td>
                    <span className={`admin-pill ${claseRol[usuario.rol]}`}>
                      {usuario.rol}
                    </span>
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
                        aria-label={`Editar rol de ${usuario.nombre}`}
                        onClick={() => navigate(`/administracion/usuarios/${usuario.id}/rol`)}
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
          <span>Mostrando {usuarios.length} usuarios</span>
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
    </main>
  )
}

export default Administracion