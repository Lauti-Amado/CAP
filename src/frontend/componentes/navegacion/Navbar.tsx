import { Bell, CircleHelp, UserRound } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="cap-navbar">
      <Breadcrumbs />
      <div className="cap-navbar-actions">
        <button type="button" aria-label="Notificaciones"><Bell size={20} /></button>
        <button type="button" aria-label="Ayuda"><CircleHelp size={20} /></button>
        <button type="button" aria-label="Perfil"><UserRound size={20} /></button>
      </div>
    </header>
  );
}
