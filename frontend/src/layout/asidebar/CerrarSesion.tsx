import './CerrarSesion.css'
import { useNavigate } from 'react-router-dom';

import { LogOut } from 'lucide-react';
import { Button } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';


export default function CerrarSesion() {
    const { logout } = useAuth();
    const navigate = useNavigate()
    
    const handleLogout = () => {
        logout;
        navigate('/', { replace: true });
    }

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