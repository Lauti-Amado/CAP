//frontend/src/pages/administracion/Administracion.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Col, Container, Row, Table } from 'react-bootstrap'
import { Award, Cpu, KeyRound, Pencil, Shapes, UserCog, type LucideIcon } from 'lucide-react'
import type { EstadoUsuario, RolUsuario, UsuarioAdministracion } from '../../types/administracion'
import { listarUsuarios } from '../../services/usuarioGestionService'
import ClavesRespaldoModal from '../../components/modales/ClavesRespaldoModal'

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

const estiloRol: Record<RolUsuario, { bg: string; text?: string }> = {
  Administrador: { bg: 'success' },
  Clasificador: { bg: 'primary-subtle', text: 'primary-emphasis' },
}

const estiloEstado: Record<EstadoUsuario, { bg: string; text: string }> = {
  Activo: { bg: 'success-subtle', text: 'success-emphasis' },
  Inactivo: { bg: 'secondary-subtle', text: 'secondary-emphasis' },
}

const celda = 'px-3 py-3'

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
            <Button
              variant="light"
              className="border shadow-sm h-100 w-100 p-3 text-start"
              onClick={() => path && navigate(path)}
            >
              <span className="d-inline-flex rounded bg-primary-subtle text-primary p-2 mb-3">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="d-block h6 fw-bold mb-1">{titulo}</span>
              <span className="d-block text-secondary small">{descripcion}</span>
            </Button>
          </Col>
        ))}
      </Row>

      {/* =========================
          CLAVES DE RESPALDO
      ========================= */}
      <div className="mb-4">
        <Button
          variant="outline-danger"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => setMostrarClaves(true)}
        >
          <KeyRound size={14} aria-hidden="true" />
          Claves de respaldo
        </Button>
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
          <Table hover className="align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th className={`${celda} fw-semibold text-body-secondary`}>Nombre</th>
                <th className={`${celda} fw-semibold text-body-secondary`}>DNI</th>
                <th className={`${celda} fw-semibold text-body-secondary`}>Correo</th>
                <th className={`${celda} fw-semibold text-body-secondary`}>Roles</th>
                <th className={`${celda} fw-semibold text-body-secondary`}>Estado</th>
                <th className={`${celda} fw-semibold text-body-secondary text-end`}>Acciones</th>
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
                  <td className={`${celda} fw-semibold`}>{usuario.nombre}</td>
                  <td className={celda}>{usuario.dni}</td>
                  <td className={celda}>{usuario.correo}</td>
                  <td className={celda}>
                    <div className="d-flex flex-wrap gap-1">
                      {usuario.roles.map((rol) => (
                        <Badge key={rol} pill bg={estiloRol[rol].bg} text={estiloRol[rol].text}>
                          {rol}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className={celda}>
                    <Badge pill bg={estiloEstado[usuario.estado].bg} text={estiloEstado[usuario.estado].text}>
                      {usuario.estado}
                    </Badge>
                  </td>
                  <td className={`${celda} text-end`}>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-secondary p-1"
                      aria-label={`Editar roles de ${usuario.nombre}`}
                      onClick={() => navigate(`/administrador/configuraciones/${usuario.id}`)}
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Card.Footer className="bg-white border-top-0 d-flex justify-content-between align-items-center small text-secondary px-3 py-3">
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