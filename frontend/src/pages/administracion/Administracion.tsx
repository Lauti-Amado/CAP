//frontend/src/pages/administracion/Administracion.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Col, Container, Row, Table } from 'react-bootstrap'
import { Award, Cpu, KeyRound, Pencil, Shapes, UserCog, type LucideIcon } from 'lucide-react'
import type { EstadoUsuario, RolUsuario, UsuarioAdministracion } from '../../types/administracion'
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
  // TODO: navegar a la configuración RFID cuando exista
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

const badgeRolEstilos: Record<RolUsuario, React.CSSProperties> = {
  Administrador: {
    backgroundColor: '#006b35',
    color: '#ffffff',
  },
  Clasificador: {
    backgroundColor: '#d4def5',
    color: '#344054',
  },
}

const badgeEstadoEstilos: Record<EstadoUsuario, React.CSSProperties> = {
  Activo: {
    backgroundColor: '#bbf7d0',
    color: '#166534',
  },
  Inactivo: {
    backgroundColor: '#d9dee8',
    color: '#475467',
  },
}

// Base común de las píldoras de rol y estado
const estiloBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.4em 0.85em',
  border: 0,
  fontSize: '0.7rem',
  fontWeight: 600,
  lineHeight: 1,
}

const estiloCelda: React.CSSProperties = { padding: '12px 16px' }

const estiloEncabezado: React.CSSProperties = {
  ...estiloCelda,
  backgroundColor: '#eef1ff',
  color: '#344054',
  fontSize: '0.75rem',
  fontWeight: 600,
}

function Administracion() {
  const navigate = useNavigate()
  const [hoveredAtajo, setHoveredAtajo] = useState<string | null>(null)
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
    <Container fluid as="main" className="p-4" style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* =========================
          ENCABEZADO
      ========================= */}
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-1" style={{ color: '#172033' }}>
          Panel de Administración
        </h1>
        <p className="text-secondary small mb-0">
          Gestione la configuración global, roles de sistema y parámetros operativos de las carreras.
        </p>
      </header>

      {/* =========================
          ACCESOS
      ========================= */}
      <Row as="section" className="g-3 mb-3" aria-label="Accesos de administración">
        {atajos.map(({ titulo, descripcion, icon: Icon, path }) => {
          const isHovered = hoveredAtajo === titulo
          return (
            <Col xs={12} sm={6} xl={4} key={titulo}>
              <Card
                as="button"
                type="button"
                className="h-100 w-100 text-start border shadow-none"
                onClick={() => path && navigate(path)}
                onMouseEnter={() => setHoveredAtajo(titulo)}
                onMouseLeave={() => setHoveredAtajo(null)}
                style={{
                  borderColor: isHovered ? '#22c55e' : '#e6e9f3',
                  borderRadius: 10,
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  boxShadow: isHovered ? '0 4px 12px rgba(24, 38, 65, 0.08)' : 'none',
                  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                  padding: 0,
                }}
              >
                <Card.Body className="p-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: '#e8ecff',
                      color: '#4f5fd6',
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <Card.Title as="h2" className="h6 fw-bold mb-1" style={{ color: '#172033' }}>
                    {titulo}
                  </Card.Title>
                  <Card.Text className="text-secondary small mb-0">
                    {descripcion}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
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
      <Card className="border" style={{ borderColor: '#e6e9f3', borderRadius: 10, overflow: 'hidden' }}>
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-start gap-3 p-3 pb-2">
          <div>
            <Card.Title as="h2" className="h5 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#172033' }}>
              <UserCog size={18} className="text-success" aria-hidden="true" />
              Gestión de Usuarios
            </Card.Title>
            <Card.Text className="text-secondary small mb-0">
              Administre el acceso al sistema CAP Gestión.
            </Card.Text>
          </div>
        </Card.Body>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0 small">
            <thead>
              <tr>
                <th style={estiloEncabezado}>Nombre</th>
                <th style={estiloEncabezado}>DNI</th>
                <th style={estiloEncabezado}>Correo</th>
                <th style={estiloEncabezado}>Roles</th>
                <th style={estiloEncabezado}>Estado</th>
                <th style={estiloEncabezado} className="text-end">Acciones</th>
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
                  <td className="fw-semibold" style={estiloCelda}>{usuario.nombre}</td>
                  <td style={estiloCelda}>{usuario.dni}</td>
                  <td style={estiloCelda}>{usuario.correo}</td>
                  <td style={estiloCelda}>
                    <div className="d-flex flex-wrap gap-1">
                      {usuario.roles.map((rol) => (
                        <Badge key={rol} pill bg="none" style={{ ...estiloBadge, ...badgeRolEstilos[rol] }}>
                          {rol}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td style={estiloCelda}>
                    <Badge pill bg="none" style={{ ...estiloBadge, ...badgeEstadoEstilos[usuario.estado] }}>
                      {usuario.estado}
                    </Badge>
                  </td>
                  <td style={estiloCelda}>
                    <div className="d-flex justify-content-end">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-secondary p-0 ms-auto me-0"
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