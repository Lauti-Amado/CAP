//frontend/src/layout/asidebar/MainAsidebar.tsx
import LogoCap from './LogoCap';
import CerrarSesion from './CerrarSesion';
import Navegacion from './Navegacion';

export default function MainAsidebar() {
    return (
        <aside className="w-100 h-100 d-flex flex-column p-0 overflow-hidden bg-success" aria-label="Navegación principal">
            {/*Logo*/}
            <LogoCap />

            {/*Navegacion (paginas)*/}
            <div className="flex-grow-1 overflow-y-auto overflow-x-hidden mt-1">
                <Navegacion />
            </div>

            {/*Logout*/}
            <CerrarSesion />
        </aside>
    )
}