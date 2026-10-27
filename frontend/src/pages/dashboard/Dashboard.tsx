import { Button, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  Archive, BarChart3, CalendarDays, CloudCheck, Footprints, MapPin, MoreHorizontal, RefreshCw, Timer, Trophy, UsersRound, WifiOff, 
  type LucideIcon
} from 'lucide-react';
import type { DashboardActivity, DashboardData } from '../../types/dashboard';
import type { EstadoSincronizacion } from '../../types/sincronizacion';
import './Dashboard.css'
// MOCK TEMPORAL
import { dashboardMock } from './dashboardMock'

const quickActions = [
  { label: 'Ver carreras', icon: Footprints, path: '/carreras' },
  { label: 'Ver Resultados', icon: BarChart3, path: '/resultados' },
  { label: 'Grand Prix', icon: Trophy, path: '/grand-prix' },
]

const activityIcons = {
  reading: Timer,
  kit: Archive,
  registration: UsersRound,
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
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 día'
  if (days < 7) return `Hace ${days} días`
  const weeks = Math.floor(days / 7)
  return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
}

function ActivityRow({ activity }: { activity: DashboardActivity }) {
  const Icon = activityIcons[activity.kind]
  return (
    <li className="activity-row">
      <span className={`activity-icon activity-icon--${activity.kind}`}>
        <Icon size={13} aria-hidden="true" />
      </span>
      <span className="activity-copy">
        <span className="activity-description">{activity.description}</span>
        <span className="activity-time">{formatActivityTime(activity.occurredAt)}</span>
      </span>
    </li>
  )
}

function Dashboard() {
  const navigate = useNavigate()

  // MOCK TEMPORAL
  // TODO BACKEND: reemplazar por la consulta real al backend.
  const data: DashboardData = dashboardMock

  const { nextRace, registrations, rfid, activities, sincronizacion } = data

  const estadoSync = estadosSincronizacion[sincronizacion.estado]
  const SyncIcon = estadoSync.icon 

  const fillPercent =
    registrations.capacity > 0
      ? Math.min(100, Math.max(0, (registrations.confirmed / registrations.capacity) * 100))
      : 0
  const occupancy = Math.round(fillPercent)

  return (
    <main className="main-content" aria-label="Dashboard de inicio">
      <div className="dashboard-content">
        {/* =========================
            RESUMEN
        ========================= */}
        <section className="summary-grid" aria-label="Resumen">
          <Card as="article" className="summary-card race-card">
            <div className="card-topline">
              <span className="summary-icon">
                <CalendarDays size={18} aria-hidden="true" />
              </span>
              {nextRace && <span className="next-badge">● PRÓXIMA</span>}
            </div>
            <div className="eyebrow">PRÓXIMA CARRERA</div>
            {nextRace ? (
              <>
                <h2>{nextRace.name}</h2>
                <div className="race-detail">
                  <CalendarDays size={11} aria-hidden="true" />
                  {formatRaceDate(nextRace.startsAt)}
                </div>
                <div className="race-detail">
                  <MapPin size={11} aria-hidden="true" />
                  {nextRace.location}
                </div>
              </>
            ) : (
              <p className="empty-note">No hay carreras programadas</p>
            )}
          </Card>

          <Card as="article" className="summary-card registrations-card">
            <div className="card-topline">
              <span className="summary-icon">
                <UsersRound size={18} aria-hidden="true" />
              </span>
              <span className="capacity-label">Cupo: {occupancy}%</span>
            </div>
            <div className="eyebrow">INSCRIPTOS CONFIRMADOS</div>
            <div className="registration-total">
              <strong>{registrations.confirmed.toLocaleString('es-AR')}</strong>
              <span>/ {registrations.capacity.toLocaleString('es-AR')}</span>
            </div>
            <ProgressBar className="progress-track">
              <ProgressBar
                now={registrations.confirmed}
                max={Math.max(1, registrations.capacity)}
                style={{ width: `${fillPercent}%` }}
                aria-label="Cupo ocupado"
              />
            </ProgressBar>
          </Card>
        </section>

        {/* =========================
            RFID Y ACTIVIDAD
        ========================= */}
        <section className="details-grid" aria-label="Estado y actividad">
          <div className="details-main">
          <Card as="article" className="panel rfid-panel">
            <div className="panel-heading rfid-heading">
              <h2>
                Estado RFID:{' '}
                <span className={rfid.connected ? 'connected' : 'disconnected'}>
                  ● {rfid.connected ? 'CONECTADO' : 'DESCONECTADO'}
                </span>
              </h2>
            </div>
            <div className="rfid-body">
              <div className="antenna-list">
                {rfid.antennas.map((antenna) => (
                  <div key={antenna.name}>
                    <span>{antenna.name}:</span> {antenna.working ? 'Funcionando' : 'Sin conexión'}
                  </div>
                ))}
              </div>
              {/* TODO: navegar a la configuración de chips cuando exista la ruta */}
              <Button variant="" className="primary-button" type="button">
                Ir a Configuración de chips
              </Button>
            </div>
          </Card>

          <Card as="article" className="panel sync-panel">
            <div className="sync-body">
              <div className="sync-info">
                <h2>Estado de Sincronización</h2>
                <p>Última vez: {sincronizacion.ultimaVez}</p>
              </div>
              <span className={`sync-pill sync-pill--${sincronizacion.estado}`}>
                <SyncIcon size={16} aria-hidden="true" />
                {estadoSync.texto}
              </span>
            </div>
          </Card>
        </div>    

          <Card as="article" className="panel activity-panel">
            <div className="panel-heading activity-heading">
              <h2>Actividad Reciente</h2>
              <Button variant="" className="more-button" type="button" aria-label="Más opciones de actividad">
                <MoreHorizontal size={17} aria-hidden="true" />
              </Button>
            </div>
            <ul className="activity-list">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
              {activities.length === 0 && <li className="empty-note">Todavía no hay actividad.</li>}
            </ul>
            {/* TODO: navegar al historial completo cuando exista la ruta */}
            <Button variant="" className="view-all-button" type="button">
              VER TODO
            </Button>
          </Card>
        </section>

        {/* =========================
            ACCIONES RÁPIDAS
        ========================= */}
        <section className="quick-actions" aria-label="Acciones rápidas">
          <h2>Acciones Rápidas</h2>
          <div className="quick-action-grid">
            {quickActions.map(({ label, icon: Icon, path }) => (
              <Button variant=""
                className="quick-action"
                type="button"
                key={label}
                onClick={() => navigate(path)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Dashboard