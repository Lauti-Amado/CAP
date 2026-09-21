import { useState } from 'react'
import {
  Archive,
  BarChart3,
  Bell,
  BadgeCheck,
  CalendarDays,
  CircleHelp,
  Footprints,
  LayoutDashboard,
  LogOut,
  MapPin,
  MoreHorizontal,
  Settings,
  Timer,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react'
import capLogo from './assets/CAP Logo.png'
import { dashboardData, type DashboardActivity, type DashboardData } from './dashboardData'
import Certificates from './Certificates'
import GrandPrix from './GrandPrix'
import './App.css'

const navigation = [
  {
    label: 'HOME',
    items: [{ label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'CLASIFICADOR',
    items: [
      { label: 'Clasificación', icon: Timer },
      { label: 'Resultados', icon: BarChart3 },
      { label: 'Grand Prix', icon: Trophy },
    ],
  },
  {
    label: 'ENTREGA DE KITS',
    items: [{ label: 'Entrega de Kits', icon: Archive }],
  },
  {
    label: 'ADMINISTRADOR',
    items: [
      { label: 'Carreras', icon: Footprints },
      { label: 'Corredores', icon: UsersRound },
      { label: 'Certificados', icon: BadgeCheck },
      { label: 'Administración', icon: Settings },
    ],
  },
]

const quickActions = [
  { label: 'Ver carreras', icon: Footprints },
  { label: 'Ver corredores', icon: UsersRound },
  { label: 'Ver Resultados', icon: BarChart3 },
  { label: 'Configurar clasificación', icon: Settings },
  { label: 'Grand Prix', icon: Trophy },
]

const activityIcons = {
  reading: Timer,
  kit: Archive,
  registration: UsersRound,
}

function formatRaceDate(value: string) {
  const date = new Date(value)
  const day = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' }).format(date)
  const time = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' }).format(date)
  const hour = Number(time.slice(0, 2))
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}, ${String(hour % 12 || 12).padStart(2, '0')}${time.slice(2)} ${hour < 12 ? 'AM' : 'PM'}`
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
      <span className={`activity-icon activity-icon--${activity.kind}`}><Icon size={13} aria-hidden="true" /></span>
      <span className="activity-copy">
        <span className="activity-description">{activity.description}</span>
        <span className="activity-time">{formatActivityTime(activity.occurredAt)}</span>
      </span>
    </li>
  )
}

function Dashboard({ data }: { data: DashboardData }) {
  const { nextRace, registrations, rfid, activities, unreadNotifications } = data
  const fillPercent = registrations.capacity > 0
    ? Math.min(100, Math.max(0, registrations.confirmed / registrations.capacity * 100))
    : 0
  const occupancy = Math.round(fillPercent)

  return (
    <main className="main-content" aria-label="Dashboard de inicio">
      <header className="topbar">
        <div className="page-heading">
          <div className="breadcrumb">CAP Gestión ›</div>
          <h1>Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="icon-button notification-button" type="button" aria-label={`Notificaciones: ${unreadNotifications} sin leer`}>
            <Bell size={17} aria-hidden="true" />
            {unreadNotifications > 0 && <span className="notification-dot" />}
          </button>
          <button className="icon-button" type="button" aria-label="Ayuda"><CircleHelp size={17} aria-hidden="true" /></button>
          <button className="profile-button" type="button" aria-label="Perfil"><UserRound size={14} aria-hidden="true" /></button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="summary-grid" aria-label="Resumen">
          <article className="summary-card race-card">
            <div className="card-topline">
              <span className="summary-icon"><CalendarDays size={18} aria-hidden="true" /></span>
              {nextRace && <span className="next-badge">● PRÓXIMA</span>}
            </div>
            <div className="eyebrow">PRÓXIMA CARRERA</div>
            {nextRace ? (
              <>
                <h2>{nextRace.name}</h2>
                <div className="race-detail"><CalendarDays size={11} aria-hidden="true" />{formatRaceDate(nextRace.startsAt)}</div>
                <div className="race-detail"><MapPin size={11} aria-hidden="true" />{nextRace.location}</div>
              </>
            ) : <p className="empty-note">No hay carreras programadas</p>}
          </article>

          <article className="summary-card registrations-card">
            <div className="card-topline">
              <span className="summary-icon"><UsersRound size={18} aria-hidden="true" /></span>
              <span className="capacity-label">Cupo: {occupancy}%</span>
            </div>
            <div className="eyebrow">INSCRIPTOS CONFIRMADOS</div>
            <div className="registration-total"><strong>{registrations.confirmed.toLocaleString('es-AR')}</strong><span>/ {registrations.capacity.toLocaleString('es-AR')}</span></div>
            <div className="progress-track" role="progressbar" aria-label="Cupo ocupado" aria-valuenow={registrations.confirmed} aria-valuemin={0} aria-valuemax={Math.max(1, registrations.capacity)}>
              <span style={{ width: `${fillPercent}%` }} />
            </div>
          </article>
        </section>

        <section className="details-grid" aria-label="Estado y actividad">
          <article className="panel rfid-panel">
            <div className="panel-heading rfid-heading"><h2>Estado RFID: <span className={rfid.connected ? 'connected' : 'disconnected'}>● {rfid.connected ? 'CONECTADO' : 'DESCONECTADO'}</span></h2></div>
            <div className="rfid-body">
              <div className="antenna-list">
                {rfid.antennas.map((antenna) => <div key={antenna.name}><span>{antenna.name}:</span> {antenna.working ? 'Funcionando' : 'Sin conexión'}</div>)}
              </div>
              <button className="primary-button" type="button">Ir a Configuración de chips</button>
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-heading activity-heading"><h2>Actividad Reciente</h2><button className="more-button" type="button" aria-label="Más opciones de actividad"><MoreHorizontal size={17} aria-hidden="true" /></button></div>
            <ul className="activity-list">{activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)}{activities.length === 0 && <li className="empty-note">Todavía no hay actividad.</li>}</ul>
            <button className="view-all-button" type="button">VER TODO</button>
          </article>
        </section>

        <section className="quick-actions" aria-label="Acciones rápidas">
          <h2>Acciones Rápidas</h2>
          <div className="quick-action-grid">
            {quickActions.map(({ label, icon: Icon }) => <button className="quick-action" type="button" key={label}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>)}
          </div>
        </section>
      </div>
    </main>
  )
}

function App() {
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [certificateEditor, setCertificateEditor] = useState(false)

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand">
          <img className="brand-logo" src={capLogo} alt="Logo de CAP" />
          <div className="brand-copy">
            <div className="brand-title">CAP Gestión</div>
            <div className="brand-subtitle">Sistema de administración de carreras</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones">
          {navigation.map((section) => (
            <div className="nav-section" key={section.label}>
              <div className="section-label">{section.label}</div>
              {section.items.map(({ label, icon: Icon }) => (
                <button
                  className={`nav-item${activeItem === label ? ' is-active' : ''}`}
                  type="button"
                  key={label}
                  aria-current={activeItem === label ? 'page' : undefined}
                  onClick={() => { setActiveItem(label); if (label !== 'Certificados') setCertificateEditor(false) }}
                >
                  <Icon size={17} strokeWidth={2} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" type="button">
            <LogOut size={17} strokeWidth={2} aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      {activeItem === 'Certificados' || activeItem === 'Grand Prix' ? (
        <main className="main-content" aria-label={activeItem}>
          <header className="topbar">
            <div className="page-heading"><div className="breadcrumb">CAP Gestión › {activeItem === 'Certificados' ? `Administración${certificateEditor ? ' › Plantilla' : ''}` : 'Clasificador'}</div><h1>{activeItem === 'Certificados' ? (certificateEditor ? 'Editar Plantilla' : 'Plantillas de Certificados') : 'Grand Prix'}</h1></div>
            <div className="header-actions"><button className="icon-button" type="button" aria-label="Notificaciones"><Bell size={17} /></button><button className="icon-button" type="button" aria-label="Ayuda"><CircleHelp size={17} /></button><button className="profile-button" type="button" aria-label="Perfil"><UserRound size={14} /></button></div>
          </header>
          {activeItem === 'Certificados' ? <Certificates onEditorChange={setCertificateEditor} /> : <GrandPrix />}
        </main>
      ) : <Dashboard data={dashboardData} />}
    </div>
  )
}

export default App
