import { Outlet } from 'react-router-dom';

import MainNavbar from './navbar/MainNavbar';
import MainAsidebar from './asidebar/MainAsidebar';
import { Col, Container, Row } from 'react-bootstrap';

export default function MainLayout() {
  return (
      <Container fluid className='vh-100 overflow-hidden p-0'>
        <Row className="h-100 g-0 flex-nowrap">
          
          {/*Asidebar izquierda*/}
          <Col xs="auto" className="p-0 h-100 flex-shrink-0" style={{ width: '220px', minWidth: '200px' }}>
            <MainAsidebar />
          </Col>

          {/*Contenido principal derecha*/}
          <Col className="p-0 d-flex flex-column h-100 flex-grow-1" style={{ minWidth: 0 }}>

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
