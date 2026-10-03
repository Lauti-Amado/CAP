
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Archive,
  BarChart3,
  BadgeCheck,
  Footprints,
  LayoutDashboard,
  LogOut,
  Settings,
  Timer,
  Trophy,
} from 'lucide-react';
import capLogo from '../../assets/logoCAP.png';
import '../../App.css';
import Navbar from '../componentes/navegacion/Navbar';

const navigation = [
  {
    label: 'HOME',
    items: [{ label: 'Dashboard (arreglar)', icon: LayoutDashboard, path: '/' }],
  },
  {
    label: 'CLASIFICADOR',
    items: [
      { label: 'Clasificación', icon: Timer, path: '/dashboard-clasificacion' },
      { label: 'Resultados', icon: BarChart3, path: '/resultados' },
      { label: 'Grand Prix', icon: Trophy, path: '/grand-prix' },
      { label: 'Entrega de Kits', icon: Archive, path: '/entrega-kits' }
    ],
  },
  {
    label: 'ADMINISTRADOR',
    items: [
      { label: 'Carreras', icon: Footprints, path: '/carreras' },
      { label: 'Certificados', icon: BadgeCheck, path: '/certificados' },
      { label: 'Administración (no hecha)', icon: Settings, path: '/admin' },
    ],
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
              {section.items.map(({ label, icon: Icon, path }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    className={`nav-item${isActive ? ' is-active' : ''}`}
                    type="button"
                    key={label}
                    onClick={() => navigate(path)}
                  >
                    <Icon size={17} strokeWidth={2} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" type="button" onClick={() => navigate('/login')}>
            <LogOut size={17} strokeWidth={2} aria-hidden="true" />
            <span>Cerrar Sesión (arreglar)</span>
          </button>
        </div>
      </aside>

      {/* Aquí se renderizarán de forma dinámica las vistas hijas según la ruta de React Router */}
      <div className="app-content">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}
