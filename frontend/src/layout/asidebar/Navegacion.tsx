import { Archive, BarChart3, BadgeCheck, Footprints, LayoutDashboard, Settings, Timer, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';

import './Navegacion.css'

export default function Navegacion() {
    const navigate = useNavigate();
    const location = useLocation();

    const navigation = [
        {
            label: 'HOME',
            items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
        },
        {
            label: 'CLASIFICACIÓN',
            items: [
                { label: 'Entrega de Kits', icon: Archive, path: '/entrega-kits' },
                { label: 'Clasificación', icon: Timer, path: '/dashboard-clasificacion' },
                { label: 'Resultados', icon: BarChart3, path: '/resultados' },
                { label: 'Grand Prix', icon: Trophy, path: '/grand-prix' }
            ],
        },
        {
            label: 'ADMINISTRACIÓN',
            items: [
                { label: 'Carreras', icon: Footprints, path: '/carreras' },
                { label: 'Certificados', icon: BadgeCheck, path: '/certificados' },
                { label: 'Administración', icon: Settings, path: '/administracion' },
            ],
        },
    ];

    return (
        <Nav className="flex-column w-100 pb-4" aria-label="Secciones">
            {navigation.map((section, index) => (
                <div className="nav-section" key={section.label}>
                    
                    <div className={`section-divider mb-2 ${index === 0 ? 'mt-2' : 'mt-2'}`}>
                        <span>{section.label}</span>
                    </div>

                    {section.items.map(({ label, icon: Icon, path }) => {
                        const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
                        return (
                            <Button
                                variant="link"
                                className={`nav-button w-100 d-flex align-items-center gap-3 rounded-0 ${isActive ? 'active' : ''}`}
                                key={label}
                                onClick={() => navigate(path)}
                            >
                                <Icon size={19} strokeWidth={2} aria-hidden="true" />
                                <span>{label}</span>
                            </Button>
                        );
                    })}
                </div>
            ))}
        </Nav>
    )
}