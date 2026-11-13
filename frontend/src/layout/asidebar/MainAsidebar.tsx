import './MainAsidebar.css'

import LogoCap from './LogoCap';
import CerrarSesion from './CerrarSesion';
import Navegacion from './Navegacion';

export default function MainAsidebar() {
    return (
        <aside className="asidebar h-100 d-flex flex-column p-0 overflow-hidden" aria-label="Navegación principal">
            {/*Logo*/}
            <LogoCap />

            {/*Navegacion (paginas)*/}
            <div className="flex-grow-1 asidebar-nav overflow-x-hidden mt-1">
                <Navegacion />
            </div>

            {/*Logout*/}
            <CerrarSesion />
        </aside>
    )
}
