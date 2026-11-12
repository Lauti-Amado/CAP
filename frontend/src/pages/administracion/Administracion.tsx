//frontend/src/pages/administracion/Administracion.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Table,
} from 'react-bootstrap'
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

function Administracion() {
  const navigate = useNavigate()
  const [paginaActual, setPaginaActual] = useState(1)
  const [hoveredAtajo, setHoveredAtajo] = useState<string | null>(null)
  const [hoverRespaldo, setHoverRespaldo] = useState(false)
  const [hoverNuevoUsuario, setHoverNuevoUsuario] = useState(false)

  // MOCK TEMPORAL
  // TODO BACKEND: GET /api/usuarios?pagina={paginaActual}
  const usuarios = usuariosMock
  const totalPaginas = 2 // temporal, para ver el botón "Siguiente" como en Figma

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
          TODO (compañero): implementar la acción de este botón.
      ========================= */}
      <div className="mb-4">
        <Button
          type="button"
          size="sm"
          className="d-inline-flex align-items-center gap-2 fw-semibold"
          onMouseEnter={() => setHoverRespaldo(true)}
          onMouseLeave={() => setHoverRespaldo(false)}
          onClick={() => {
            // TODO: pendiente de implementación
          }}
          style={{
            color: hoverRespaldo ? '#7f1d1d' : '#991b1b',
            backgroundColor: hoverRespaldo ? '#fecaca' : '#fee2e2',
            borderColor: hoverRespaldo ? '#fca5a5' : '#fecaca',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: '0.875rem',
            transition: 'all 0.15s ease-in-out',
          }}
        >
          <KeyRound size={14} aria-hidden="true" />
          Claves de respaldo
        </Button>
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

          {/* TODO: navegar al alta de usuario cuando exista la pantalla */}
          <Button
            type="button"
            size="sm"
            className="d-inline-flex align-items-center gap-2 border-0 fw-semibold text-white"
            onMouseEnter={() => setHoverNuevoUsuario(true)}
            onMouseLeave={() => setHoverNuevoUsuario(false)}
            style={{
              backgroundColor: hoverNuevoUsuario ? '#16a34a' : '#22c55e',
              borderRadius: 6,
              padding: '6px 14px',
              transition: 'background-color 0.15s ease-in-out',
            }}
          >
            <Plus size={14} aria-hidden="true" />
            Nuevo usuario
          </Button>
        </Card.Body>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0 small" style={{ borderColor: '#eef1ff' }}>
            <thead>
              <tr style={{ background: '#eef1ff' }}>
                <th style={{ background: '#eef1ff', color: '#344054', fontSize: '0.75rem', fontWeight: 600, padding: '10px 16px', borderTop: 'none' }}>
                  Nombre
                </th>
                <th style={{ background: '#eef1ff', color: '#344054', fontSize: '0.75rem', fontWeight: 600, padding: '10px 16px', borderTop: 'none' }}>
                  DNI
                </th>
                <th style={{ background: '#eef1ff', color: '#344054', fontSize: '0.75rem', fontWeight: 600, padding: '10px 16px', borderTop: 'none' }}>
                  Correo
                </th>
                <th style={{ background: '#eef1ff', color: '#344054', fontSize: '0.75rem', fontWeight: 600, padding: '10px 16px', borderTop: 'none' }}>
                  Rol
                </th>
                <th style={{ background: '#eef1ff', color: '#344054', fontSize: '0.75rem', fontWeight: 600, padding: '10px 16px', borderTop: 'none' }}>
                  Estado
                </th>
                <th className="text-end" style={{ background: '#eef1ff', color: '#344054', fontSize: '0.75rem', fontWeight: 600, padding: '10px 16px', borderTop: 'none' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="fw-semibold" style={{ padding: '12px 16px' }}>{usuario.nombre}</td>
                  <td style={{ padding: '12px 16px' }}>{usuario.dni}</td>
                  <td style={{ padding: '12px 16px' }}>{usuario.correo}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge
                      pill
                      style={{
                        ...badgeRolEstilos[usuario.rol],
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.4em 0.85em',
                        border: 0,
                        fontSize: '0.7rem',
                        color:'White',
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      {usuario.rol}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge
                      pill
                      style={{
                        ...badgeEstadoEstilos[usuario.estado],
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.4em 0.85em',
                        border: 0,
                        fontSize: '0.7rem',
                        color:'White',
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      {usuario.estado}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="d-flex justify-content-end">
                      <Button
                        type="button"
                        variant="link"
                        className="text-secondary p-0 ms-auto me-0"
                        aria-label={`Editar rol de ${usuario.nombre}`}
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

        <Card.Footer className="bg-white d-flex justify-content-between align-items-center small text-secondary py-3 px-3 border-top" style={{ borderColor: '#e6e9f3' }}>
          <span>Mostrando {usuarios.length} usuarios</span>
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
    </Container>
  )
}

export default Administracion
