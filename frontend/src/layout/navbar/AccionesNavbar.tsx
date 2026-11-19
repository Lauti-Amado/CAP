//frontend/src/layout/navbar/AccionesNavbar.tsx
import { Bell, CircleHelp, UserRound, Cloud } from 'lucide-react';
import { Button } from 'react-bootstrap';
import type { EstadoSincronizacion } from '../../types/sincronizacion';
import { useAuth } from '../../context/AuthContext';

const estadosSincronizacion: Record<
    EstadoSincronizacion,
    { color: string; texto: string }
> = {
    conectado: { color: 'success', texto: 'Sincronizado' },
    sincronizando: { color: 'warning', texto: 'Sincronizando...' },
    'sin-conexion': { color: 'danger', texto: 'Sin conexión: guardando localmente' },
};

export default function AccionesNavbar() {
    // Por ahora está fijo, hasta conectar PowerSync.
    const estadoSync: EstadoSincronizacion = 'sincronizando'; // Los otros valores son conectado y sin-conexion (rojo)
    const { color, texto } = estadosSincronizacion[estadoSync];

    const { usuario } = useAuth();

    return (
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <Button
                variant="link"
                className="link-secondary position-relative p-1 d-inline-flex"
                aria-label={texto}
                title={texto}
            >
                <Cloud size={20} />
                <span className={`position-absolute top-0 end-0 p-1 rounded-circle pe-none bg-${color}`} />
            </Button>

            <Button variant="link" className="link-secondary p-1 d-inline-flex" aria-label="Notificaciones">
                <Bell size={20} />
            </Button>

            <Button variant="link" className="link-secondary p-1 d-inline-flex" aria-label="Ayuda">
                <CircleHelp size={20} />
            </Button>

            <div className="d-flex align-items-center gap-1">
                <Button variant="link" className="link-secondary p-1 d-inline-flex" aria-label="Perfil">
                    <UserRound size={20} />
                </Button>
                <span>Hola, {usuario?.persona.nombre}!</span>
            </div>
        </div>
    )
}