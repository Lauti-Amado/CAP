import { Bell, CircleHelp, UserRound, Cloud } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import './Navbar.css';

type EstadoSincronizacion = 'conectado' | 'sincronizando' | 'sin-conexion';

const estadosSincronizacion: Record<
  EstadoSincronizacion,
  { color: string; texto: string }
> = {
  conectado: { color: '#22C55E', texto: 'Sincronizado' },
  sincronizando: { color: '#F59E0B', texto: 'Sincronizando...' },
  'sin-conexion': { color: '#EF4444', texto: 'Sin conexión: guardando localmente' },
};

export default function Navbar() {
  // Por ahora está fijo en rojo, hasta conectar PowerSync.
  const estadoSync: EstadoSincronizacion = 'sin-conexion';
  const { color, texto } = estadosSincronizacion[estadoSync];

  return (
    <header className="cap-navbar">
      <Breadcrumbs />
      <div className="cap-navbar-actions">
        <button type="button" aria-label={texto} title={texto}>
          <Cloud size={20} color={color} />
        </button>
        <button type="button" aria-label="Notificaciones"><Bell size={20} /></button>
        <button type="button" aria-label="Ayuda"><CircleHelp size={20} /></button>
        <button type="button" aria-label="Perfil"><UserRound size={20} /></button>
      </div>
    </header>
  );
}