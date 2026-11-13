//frontend/src/pages/dashboard/Dashboard.tsx
import { useState } from 'react'
import { Button, Card, Col, Container, ProgressBar, Row,} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Archive, BarChart3, CalendarDays, CloudCheck, Footprints, MapPin, MoreHorizontal, RefreshCw, Timer, Trophy, UsersRound, WifiOff, type LucideIcon,} from 'lucide-react'
import type { DashboardActivity } from '../../types/dashboard'
import type { EstadoSincronizacion } from '../../types/sincronizacion'
import { useDashboard } from '../../hooks/useDashboard'

const quickActions = [
  { label: 'Ver carreras', icon: Footprints, path: '/administrador/carreras' },
  { label: 'Ver Resultados', icon: BarChart3, path: '/clasificador/resultados' },
  { label: 'Grand Prix', icon: Trophy, path: '/clasificador/grand-prix' },
]

const activityIcons = {
  lectura: Timer,
  kit: Archive,
  inscripcion: UsersRound,
}

const estadosSincronizacion: Record<
  EstadoSincronizacion,
  { texto: string; icon: LucideIcon }
> = {
  conectado: { texto: 'Actualizado', icon: CloudCheck },
  sincronizando: { texto: 'Sincronizando...', icon: RefreshCw },
  'sin-conexion': { texto: 'Guardando localmente', icon: WifiOff },
}

function formatRaceDate(value: string) {
  const date = new Date(value)
  const zone = 'America/Argentina/Buenos_Aires'

  const partes = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: zone,
  }).formatToParts(date)
  const dia = partes.find((p) => p.type === 'day')?.value ?? ''
  const mes = partes.find((p) => p.type === 'month')?.value ?? ''

  const time = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: zone,
  }).format(date)
  const hour = Number(time.slice(0, 2))

  return `${dia} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}, ${String(hour % 12 || 12).padStart(2, '0')}${time.slice(2)} ${hour < 12 ? 'AM' : 'PM'}`
}

function formatActivityTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hace 1 día'
  if (days < 7) return `Hace ${days} días`

  const weeks = Math.floor(days / 7)
  return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
}

function ActivityRow({ activity }: { activity: DashboardActivity }) {
  const Icon = activityIcons[activity.tipo]
  const isKit = activity.tipo === 'kit'

  return (
    <li className="d-flex align-items-start gap-2 py-2">
      <span
        style={{
          width: '21px',
          height: '21px',
          flex: '0 0 21px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          backgroundColor: isKit ? '#eff3f0' : '#e8f5eb',
          color: isKit ? '#657069' : '#217947',
        }}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="d-flex flex-column min-w-0">
        <span style={{ fontSize: '13px', lineHeight: '13px', color: '#172033' }}>
          {activity.descripcion}
        </span>
        <span style={{ marginTop: '3px', color: '#828b84', fontSize: '10px' }}>
          {formatActivityTime(activity.fechaHora)}
        </span>
      </span>
    </li>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [hoveredQuickAction, setHoveredQuickAction] = useState<string | null>(null)
  const [hoverChipBtn, setHoverChipBtn] = useState(false)
  const [hoverVerTodo, setHoverVerTodo] = useState(false)

  const { data, cargando } = useDashboard()

  if (cargando) {
    return (
      <Container fluid as="main" className="py-3 px-3 px-md-4" aria-label="Dashboard de inicio">
        <span className="spinner-border" role="status" aria-label="Cargando" />
      </Container>
    )
  }

  const { nextRace, registrations, rfid, activities, sincronizacion } = data

  const estadoSync = estadosSincronizacion[sincronizacion.estado]
  const SyncIcon = estadoSync.icon

  const fillPercent =
    registrations.capacity > 0
      ? Math.min(100, Math.max(0, (registrations.confirmed / registrations.capacity) * 100))
      : 0
  const occupancy = Math.round(fillPercent)

  const syncPillStyles: Record<EstadoSincronizacion, React.CSSProperties> = {
    conectado: {
      backgroundColor: '#e3f4e8',
      color: '#15803d',
    },
    sincronizando: {
      backgroundColor: '#fef3c7',
      color: '#b45309',
      border: '1px solid #fcd34d',
    },
    'sin-conexion': {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #fecaca',
    },
  }

  return (
    <Container
      fluid
      as="main"
      className="py-3 px-3 px-md-4"
      aria-label="Dashboard de inicio"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
      }}
    >
      {/* =========================
          RESUMEN
      ========================= */}
      <section aria-label="Resumen" className="mb-3">
        <Row className="g-3">
          {/* Card Próxima Carrera */}
          <Col xs={12} md={6}>
            <Card
              as="article"
              className="h-100 border shadow-none"
              style={{
                borderColor: '#e6e9f3',
                borderRadius: '9px',
                backgroundColor: '#ffffff',
                boxShadow: '0 5px 13px rgba(24, 38, 65, 0.05)',
                minHeight: '137px',
              }}
            >
              <Card.Body className="p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        width: '27px',
                        height: '27px',
                        borderRadius: '5px',
                        color: '#08753d',
                        backgroundColor: '#eef1ff',
                      }}
                    >
                      <CalendarDays size={16} aria-hidden="true" />
                    </span>
                    {nextRace && (
                      <span
                        style={{
                          padding: '3px 6px',
                          borderRadius: '10px',
                          backgroundColor: '#bdf5d2',
                          color: '#446554',
                          fontSize: '9px',
                          fontWeight: 600,
                        }}
                      >
                        ● PRÓXIMA
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: '2px',
                      color: '#637069',
                      fontSize: '15px',
                      fontWeight: 600,
                      letterSpacing: '0.35px',
                    }}
                  >
                    PRÓXIMA CARRERA
                  </div>
                </div>

                {nextRace ? (
                  <div className="mt-2">
                    <h2 style={{ margin: '5px 0 7px', fontSize: '16px', lineHeight: '17px', fontWeight: 700, color: '#172033' }}>
                      {nextRace.name}
                    </h2>
                    <div
                      className="d-flex align-items-center gap-1"
                      style={{ color: '#303940', fontSize: '10px', marginTop: '3px' }}
                    >
                      <CalendarDays size={11} aria-hidden="true" />
                      {formatRaceDate(nextRace.startsAt)}
                    </div>
                    <div
                      className="d-flex align-items-center gap-1"
                      style={{ color: '#303940', fontSize: '10px', marginTop: '3px' }}
                    >
                      <MapPin size={11} aria-hidden="true" />
                      {nextRace.location}
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '10px 0 0', color: '#65716b', fontSize: '12px' }}>
                    No hay carreras programadas
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Card Inscriptos Confirmados */}
          <Col xs={12} md={6}>
            <Card
              as="article"
              className="h-100 border shadow-none"
              style={{
                borderColor: '#e6e9f3',
                borderRadius: '9px',
                backgroundColor: '#ffffff',
                boxShadow: '0 5px 13px rgba(24, 38, 65, 0.05)',
                minHeight: '137px',
              }}
            >
              <Card.Body className="p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        width: '27px',
                        height: '27px',
                        borderRadius: '5px',
                        color: '#08753d',
                        backgroundColor: '#eef1ff',
                      }}
                    >
                      <UsersRound size={16} aria-hidden="true" />
                    </span>
                    <span style={{ color: '#66736b', fontSize: '9px' }}>
                      Cupo: {occupancy}%
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: '2px',
                      color: '#637069',
                      fontSize: '15px',
                      fontWeight: 600,
                      letterSpacing: '0.35px',
                    }}
                  >
                    INSCRIPTOS CONFIRMADOS
                  </div>
                </div>

                <div className="mt-2">
                  <div className="d-flex align-items-baseline gap-1 mb-2">
                    <strong style={{ fontSize: '35px', lineHeight: '36px', fontWeight: 700, color: '#172033' }}>
                      {registrations.confirmed.toLocaleString('es-AR')}
                    </strong>
                    <span style={{ color: '#758077', fontSize: '11px' }}>
                      / {registrations.capacity.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <ProgressBar
                    style={{
                      height: '5px',
                      borderRadius: '9px',
                      backgroundColor: '#e3e9ff',
                    }}
                  >
                    <ProgressBar
                      now={registrations.confirmed}
                      max={Math.max(1, registrations.capacity)}
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: '#006b35',
                        borderRadius: '9px',
                      }}
                      aria-label="Cupo ocupado"
                    />
                  </ProgressBar>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {/* =========================
          RFID, SINCRONIZACIÓN Y ACTIVIDAD
      ========================= */}
      <section aria-label="Estado y actividad" className="mb-4">
        <Row className="g-3 align-items-stretch">
          {/* Columna Izquierda: RFID y Sincronización */}
          <Col xs={12} lg={7}>
            <div className="d-flex flex-column gap-3 h-100">
              {/* Panel RFID */}
              <Card
                as="article"
                className="border shadow-none"
                style={{
                  borderColor: '#e6e9f3',
                  borderRadius: '9px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 5px 13px rgba(24, 38, 65, 0.05)',
                  borderTop: '2px solid #007341',
                }}
              >
                <Card.Header
                  className="bg-transparent px-3 py-2 border-bottom"
                  style={{ borderColor: '#e1e6f4', height: '48px', display: 'flex', alignItems: 'center' }}
                >
                  <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                    Estado RFID:{' '}
                    <span style={{ color: rfid.connected ? '#006d38' : '#b34b40' }}>
                      ● {rfid.connected ? 'CONECTADO' : 'DESCONECTADO'}
                    </span>
                  </h2>
                </Card.Header>

                <Card.Body className="p-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                  <div style={{ fontSize: '12px', lineHeight: '23px', whiteSpace: 'nowrap' }}>
                    {rfid.antennas.map((antenna) => (
                      <div key={antenna.name}>
                        <span style={{ color: '#768078' }}>{antenna.name}:</span>{' '}
                        {antenna.working ? 'Funcionando' : 'Sin conexión'}
                      </div>
                    ))}
                  </div>

                  {/* TODO: navegar a la configuración de chips cuando exista la ruta */}
                  <Button
                    type="button"
                    size="sm"
                    className="border-0 fw-semibold"
                    onMouseEnter={() => setHoverChipBtn(true)}
                    onMouseLeave={() => setHoverChipBtn(false)}
                    style={{
                      minHeight: '34px',
                      padding: '7px 16px',
                      borderRadius: '5px',
                      backgroundColor: hoverChipBtn ? '#19a956' : '#1fba60',
                      color: '#123d2a',
                      fontSize: '11px',
                      transition: 'background-color 0.15s ease-in-out',
                    }}
                  >
                    Ir a Configuración de chips
                  </Button>
                </Card.Body>
              </Card>

              {/* Panel Sincronización */}
              <Card
                as="article"
                className="border shadow-none"
                style={{
                  borderColor: '#e6e9f3',
                  borderRadius: '9px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 5px 13px rgba(24, 38, 65, 0.05)',
                  borderTop: '2px solid #007341',
                }}
              >
                <Card.Body className="p-3 d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                      Estado de Sincronización
                    </h2>
                    <p style={{ margin: '4px 0 0', color: '#637069', fontSize: '10px' }}>
                      Última vez: {sincronizacion.ultimaVez}
                    </p>
                  </div>

                  <span
                    className="d-inline-flex align-items-center gap-1"
                    style={{
                      padding: '7px 13px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      ...syncPillStyles[sincronizacion.estado],
                    }}
                  >
                    <SyncIcon size={16} aria-hidden="true" />
                    {estadoSync.texto}
                  </span>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Columna Derecha: Actividad Reciente */}
          <Col xs={12} lg={5}>
            <Card
              as="article"
              className="h-100 border shadow-none d-flex flex-column"
              style={{
                borderColor: '#e6e9f3',
                borderRadius: '9px',
                backgroundColor: '#ffffff',
                boxShadow: '0 5px 13px rgba(24, 38, 65, 0.05)',
              }}
            >
              <Card.Header
                className="bg-transparent px-3 py-2 border-bottom d-flex align-items-center justify-content-between"
                style={{ borderColor: '#e1e6f4', height: '48px' }}
              >
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                  Actividad Reciente
                </h2>
                <Button
                  variant="link"
                  className="p-0 text-decoration-none border-0"
                  type="button"
                  aria-label="Más opciones de actividad"
                  style={{ color: '#a7c2a8' }}
                >
                  <MoreHorizontal size={17} aria-hidden="true" />
                </Button>
              </Card.Header>

              <div className="flex-grow-1 p-3 pt-2">
                <ul className="list-unstyled mb-0">
                  {activities.map((activity) => (
                    <ActivityRow  key={activity.id} activity={activity} />
                  ))}
                  {activities.length === 0 && (
                    <li style={{ color: '#65716b', fontSize: '12px' }}>
                      Todavía no hay actividad.
                    </li>
                  )}
                </ul>
              </div>

              {/* TODO: navegar al historial completo cuando exista la ruta */}
              <Button
                variant="link"
                className="w-100 text-decoration-none border-0 border-top"
                type="button"
                onMouseEnter={() => setHoverVerTodo(true)}
                onMouseLeave={() => setHoverVerTodo(false)}
                style={{
                  height: '34px',
                  borderTopColor: '#e1e6f4',
                  borderRadius: '0 0 9px 9px',
                  backgroundColor: hoverVerTodo ? '#f0f8f2' : '#ffffff',
                  color: '#006c35',
                  fontSize: '10px',
                  fontWeight: 700,
                  transition: 'background-color 0.15s ease-in-out',
                }}
              >
                VER TODO
              </Button>
            </Card>
          </Col>
        </Row>
      </section>

      {/* =========================
          ACCIONES RÁPIDAS
      ========================= */}
      <section aria-label="Acciones rápidas" className="mt-4">
        <h2 style={{ margin: '0 0 11px', fontSize: '14px', fontWeight: 700, color: '#172033' }}>
          Acciones Rápidas
        </h2>
        <Row className="g-3">
          {quickActions.map(({ label, icon: Icon, path }) => {
            const isHovered = hoveredQuickAction === label

            return (
              <Col xs={6} sm={4} md={2} key={label}>
                <Button
                  type="button"
                  variant="light"
                  className="w-100 d-flex flex-column align-items-center justify-content-center gap-1 border"
                  onClick={() => navigate(path)}
                  onMouseEnter={() => setHoveredQuickAction(label)}
                  onMouseLeave={() => setHoveredQuickAction(null)}
                  style={{
                    minHeight: '68px',
                    padding: '9px 5px',
                    borderColor: '#cddbd1',
                    borderRadius: '9px',
                    backgroundColor: isHovered ? '#f0f8f2' : '#ffffff',
                    color: '#243044',
                    fontSize: '10px',
                    fontWeight: 600,
                    transition: 'background-color 0.15s ease-in-out',
                  }}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </Button>
              </Col>
            )
          })}
        </Row>
      </section>
    </Container>
  )
}

export default Dashboard
