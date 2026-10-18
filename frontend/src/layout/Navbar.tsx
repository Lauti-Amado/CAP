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
  const estadoSync: EstadoSincronizacion = 'sincronizando'; // Los otros valores son conectado  y sin-conexion (rojo)
  const { color, texto } = estadosSincronizacion[estadoSync];

  return (
    <header className="cap-navbar navbar bg-white border-bottom px-3 px-md-4 py-3 gap-3 flex-wrap">
      <Breadcrumbs />
      <div className="cap-navbar-actions d-flex gap-2 ms-auto">
        <button type="button" className="cap-navbar-sync btn btn-light position-relative" aria-label={texto} title={texto}>
          <Cloud size={20}/> <span className="cap-navbar-sync-dot" style={{ backgroundColor: color}}/>
        </button>
        <button type="button" className="btn btn-light" aria-label="Notificaciones"><Bell size={20} /></button>
        <button type="button" className="btn btn-light" aria-label="Ayuda"><CircleHelp size={20} /></button>
        <button type="button" className="btn btn-light" aria-label="Perfil"><UserRound size={20} /></button>
      </div>
    </header>
  );
}