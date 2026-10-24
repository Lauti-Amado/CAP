import './AccionesNavbar.css'
import { Bell, CircleHelp, UserRound, Cloud } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

type EstadoSincronizacion = 'conectado' | 'sincronizando' | 'sin-conexion';

const estadosSincronizacion: Record<
    EstadoSincronizacion,
    { color: string; texto: string }
> = {
    conectado: { color: '#22C55E', texto: 'Sincronizado' },
    sincronizando: { color: '#F59E0B', texto: 'Sincronizando...' },
    'sin-conexion': { color: '#EF4444', texto: 'Sin conexión: guardando localmente' },
};

export default function AccionesNavbar() {
    // Por ahora está fijo en rojo, hasta conectar PowerSync.
    const estadoSync: EstadoSincronizacion = 'sincronizando'; // Los otros valores son conectado  y sin-conexion (rojo)
    const { color, texto } = estadosSincronizacion[estadoSync];

    const { usuario } = useAuth();

    return (
        <div className="cap-navbar-actions">

            <button type="button" className="cap-navbar-sync" aria-label={texto} title={texto}>
                <Cloud size={20} /> <span className="cap-navbar-sync-dot" style={{ backgroundColor: color }} />
            </button>

            <button type="button" aria-label="Notificaciones"><Bell size={20} /></button>

            <button type="button" aria-label="Ayuda"><CircleHelp size={20} /></button>

            <div className='d-flex justify-content-between align-items-center'>
                <button type="button" aria-label="Perfil"><UserRound size={20} /></button>
                <span>Hola, {usuario?.persona.nombre}!</span>
            </div>
        </div>
    )

}