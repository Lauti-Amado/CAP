import { Container, Row, Col } from 'react-bootstrap'

import './LogoCap.css'

export default function LogoCap() {
    return (
        <Container className='p-3 mt-2'>
            <Row className="g-0 align-items-center">
                {/*Imagen*/}
                <Col md={4} className="text-center">
                    <img className="brand-logo img-fluid w-75" src={'./images/logo-cap.png'} alt="Logo de CAP"/>
                </Col>

                {/*Texto*/}
                <Col md={8} className="d-flex flex-column justify-content-center">
                    <div className='brand-title'>Sistema CAP</div>
                    <div className='brand-subtitle'>Clasificaciones</div>
                </Col>
            </Row>
        </Container>
    )
}