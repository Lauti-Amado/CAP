//frontend/src/layout/asidebar/CerrarSesion.tsx
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

export default function CerrarSesion() {
    const { logout } = useAuth();
    const navigate = useNavigate()
    
    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    }

    return (
        <div className="w-100 py-2 border-top border-light border-opacity-25">
            <Button
                variant="success"
                className="w-100 d-flex align-items-center gap-2 rounded-0 border-0 px-3 py-2 small fw-semibold text-start text-nowrap"
                onClick={handleLogout}
            >
                <LogOut size={18} strokeWidth={2} aria-hidden="true" />
                <span>Cerrar Sesión</span>
            </Button>
        </div>
    )
}
