import { Outlet } from 'react-router-dom';

import MainNavbar from './navbar/MainNavbar';
import MainAsidebar from './asidebar/MainAsidebar';
import { Col, Container, Row } from 'react-bootstrap';

export default function MainLayout() {
  return (
      <Container fluid className='vh-100 overflow-hidden p-0'>
        <Row className="h-100">
          
          {/*Asidebar izquierda*/}
          <Col xs={12} md={2} className="p-0">
            <MainAsidebar />
          </Col>

          {/*Contenido principal derecha*/}
          <Col xs={12} md={10} className="p-0 d-flex flex-column h-100">

            {/*Navbar*/}
            <Row className="flex-shrink-0 g-0">
              <MainNavbar />
            </Row>

            {/*Contenido principal*/}
            <Row className="flex-grow-1 overflow-y-auto g-0">
              <Outlet />
            </Row>
            
          </Col>

        </Row>
      </Container>
  );
}