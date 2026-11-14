//frontend/src/pages/administracion/Administracion.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Container, Row, Table } from 'react-bootstrap'
import { Award, Cpu, KeyRound, Pencil, Shapes, UserCog, type LucideIcon } from 'lucide-react'
import type { UsuarioAdministracion } from '../../types/administracion'
import { listarUsuarios } from '../../services/usuarioGestionService'
import ClavesRespaldoModal from '../../components/modales/ClavesRespaldoModal'
import './Administracion.css'

type Atajo = {
  titulo: string
  descripcion: string
  icon: LucideIcon
  path?: string // sin path = pantalla todavía no creada
}

const atajos: Atajo[] = [
  {
    titulo: 'Categorías',
    descripcion: 'Clasificaciones de corredores.',
    icon: Shapes,
    path: '/administrador/configuraciones/categorias',
  },
  // TODO: navegar a la configuración RFID cuando la organización compre los chips
  {
    titulo: 'Configuración RFID',
    descripcion: 'Parámetros de cronometraje.',
    icon: Cpu,
  },
  {
    titulo: 'Certificados',
    descripcion: 'Plantillas de premiación.',
    icon: Award,
    path: '/administrador/configuraciones/certificados',
  },
]

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
    <Container fluid as="main" className="p-4 min-vh-100">
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
      <Row as="section" className="g-3 mb-3" aria-label="Accesos de administración">
        {atajos.map(({ titulo, descripcion, icon: Icon, path }) => (
          <Col xs={12} sm={6} xl={4} key={titulo}>
            <Card
              as="button"
              type="button"
              className="admin-atajo h-100 w-100 p-0 text-start shadow-none"
              onClick={() => path && navigate(path)}
            >
              <Card.Body className="p-3">
                <div className="admin-icono mb-3">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <Card.Title as="h2" className="h6 fw-bold mb-1">{titulo}</Card.Title>
                <Card.Text className="text-secondary small mb-0">{descripcion}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* =========================
          CLAVES DE RESPALDO
      ========================= */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-sm admin-respaldo d-inline-flex align-items-center gap-2"
          onClick={() => setMostrarClaves(true)}
        >
          <KeyRound size={14} aria-hidden="true" />
          Claves de respaldo
        </button>
      </div>

      {/* =========================
          GESTIÓN DE USUARIOS
      ========================= */}
      <Card className="border rounded-3 overflow-hidden">
        <Card.Body className="p-3 pb-2">
          <Card.Title as="h2" className="h5 fw-bold mb-1 d-flex align-items-center gap-2">
            <UserCog size={18} className="text-success" aria-hidden="true" />
            Gestión de Usuarios
          </Card.Title>
          <Card.Text className="text-secondary small mb-0">
            Administre el acceso al sistema CAP Gestión.
          </Card.Text>
        </Card.Body>

        <div className="table-responsive">
          <Table hover className="admin-tabla align-middle mb-0 small">
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
                        <span key={rol} className={`admin-pill admin-badge--${rol.toLowerCase()}`}>
                          {rol}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-pill admin-badge--${usuario.estado.toLowerCase()}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-secondary p-0"
                        aria-label={`Editar roles de ${usuario.nombre}`}
                        onClick={() => navigate(`/administrador/configuraciones/${usuario.id}`)}
                      >
                        <Pencil size={13} aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Card.Footer className="bg-white d-flex justify-content-between align-items-center small text-secondary">
          <span>Mostrando {usuarios.length} de {total} usuarios</span>
          <div className="d-flex gap-2">
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </Card.Footer>
      </Card>

      <ClavesRespaldoModal show={mostrarClaves} onCerrar={() => setMostrarClaves(false)} />
    </Container>
  )
}

export default Administracion