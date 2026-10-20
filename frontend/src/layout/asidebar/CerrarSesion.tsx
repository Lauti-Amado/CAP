import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import './CerrarSesion.css'

export default function CerrarSesion() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        localStorage.removeItem('usuario');

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Error al notificar el cierre de sesión al servidor:', error);
        }

        navigate('/', { replace: true });
    };

    return (
        <div className="sidebar-footer w-100">
            <Button 
                variant="link" 
                className="logout-button w-100 d-flex align-items-center gap-3 rounded-0" 
                onClick={handleLogout}
            >
                <LogOut size={19} strokeWidth={2} aria-hidden="true" />
                <span>Cerrar Sesión</span>
            </Button>
        </div>
    )
}