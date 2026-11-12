import { Archive, BarChart3, Footprints, LayoutDashboard, Settings, Timer, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import type { LucideIcon } from 'lucide-react';

import './Navegacion.css'

type ItemNavegacion = { label: string; icon: LucideIcon; path: string };
type SeccionNavegacion = { label: string; items: ItemNavegacion[] };

export default function Navegacion() {
    const navigate = useNavigate();
    const location = useLocation();

    const navigation: SeccionNavegacion[] = [
        {
            label: 'HOME',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/home' }
            ]
        },
        {
            label: 'CLASIFICADOR',
            items: [
                { label: 'Entrega de Kits', icon: Archive, path: '/clasificador/entrega-kits' },
                { label: 'Clasificaciones', icon: Timer, path: '/clasificador/clasificaciones' },
                { label: 'Resultados', icon: Trophy, path: '/clasificador/resultados' },
                { label: 'Grand Prix', icon: BarChart3, path: '/clasificador/grand-prix' }
            ]
        },
        {
            label: 'ADMINISTRADOR',
            items: [
                { label: 'Carreras', icon: Footprints, path: '/administrador/carreras' },
                { label: 'Configuraciones', icon: Settings, path: '/administrador/configuraciones' }
            ]
        },
    ];

    return (
        <Nav className="flex-column w-100 pb-3" aria-label="Secciones">
            {navigation.map((section, index) => (
                <div className="nav-section" key={section.label}>

                    <div className={`section-divider mb-1 ${index === 0 ? 'mt-1' : 'mt-3'}`}>
                        <span>{section.label}</span>
                    </div>

                    {section.items.map(({ label, icon: Icon, path }) => {
                        const isActive = location.pathname.startsWith(path);

                        return (
                            <Button
                                variant="link"
                                className={`nav-button w-100 d-flex align-items-center gap-2 rounded-0 ${isActive ? 'active' : ''}`}
                                key={label}
                                onClick={() => navigate(path)}
                            >
                                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                                <span>{label}</span>
                            </Button>
                        );
                    })}
                </div>
            ))}
        </Nav>
    )
}
