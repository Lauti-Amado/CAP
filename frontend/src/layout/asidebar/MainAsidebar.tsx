import './MainAsidebar.css'

import { Container } from 'react-bootstrap';

import LogoCap from '../../components/logo-cap/LogoCap';
import CerrarSesion from './../asidebar/CerrarSesion';
import Navegacion from './Navegacion';

export default function MainAsidebar() {

    return (
        <Container fluid className="asidebar h-100 d-flex flex-column g-0">

            {/*Logo*/}
            <LogoCap />

            {/*Navegacion (paginas)*/}
            <div className="flex-grow-1 overflow-y-auto mt-3">
                <Navegacion />
            </div>

            {/*Logout*/}
            <CerrarSesion />

        </Container>
    )
}