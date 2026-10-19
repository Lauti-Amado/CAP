
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  UserRound,
  Flag,
  CreditCard,
  PackageCheck,
  Stethoscope,
  Shirt,
} from 'lucide-react'
import { Button, Badge, Card, Container, Row, Col } from 'react-bootstrap'

import type { InscripcionDetalle } from '../../types/inscripcion'
import './DetalleInscripcion.css'

// MOCK TEMPORAL
// Borrar cuando se conecte con el backend.
import { inscripcionDetalleMock } from './detalleInscripcionMock'

function DetalleInscripcion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // MOCK TEMPORAL
  // TODO BACKEND: reemplazar por GET /api/inscripciones/{id}
  const inscripcion: InscripcionDetalle | undefined =
    inscripcionDetalleMock.find(
      (inscripcion) => inscripcion.id === Number(id),
    )

  const volverAInscripciones = () => {
    navigate('/entrega-kits/inscripciones')
  }

  if (!inscripcion) {
    return (
      <Container fluid className="detalle-inscripcion">
        <Button
          type="button"
          variant="link"
          className="detalle-inscripcion__volver"
          onClick={volverAInscripciones}
        >
          <ArrowLeft size={16} />
          <span>Volver a inscripciones</span>
        </Button>

        <Card className="detalle-inscripcion__no-encontrada">
          <Card.Body>
            <Card.Title>Inscripción no encontrada</Card.Title>
            <Card.Text>
              No se encontró una inscripción asociada al identificador indicado.
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  const kitEntregado =
    inscripcion.entrega.estadoKit.toLowerCase() === 'entregado'

  const pagoPagado =
    inscripcion.pago.estado.toLowerCase() === 'pagado'

  const estadoConfirmado =
    inscripcion.estado.toLowerCase() === 'confirmada'

  const aptoVerificado =
    inscripcion.entrega.aptoMedico.toLowerCase() === 'verificado'

  return (
    <Container fluid className="detalle-inscripcion">
      <Button
        type="button"
        variant="link"
        className="detalle-inscripcion__volver"
        onClick={volverAInscripciones}
      >
        <ArrowLeft size={16} />
        <span>Volver a inscripciones</span>
      </Button>

      <header className="detalle-inscripcion__encabezado">
        <div className="detalle-inscripcion__titulo">
          <div className="detalle-inscripcion__titulo-principal">
            <h1>Inscripción #{inscripcion.numero}</h1>

            <Badge
              className={`detalle-inscripcion__estado ${
                estadoConfirmado
                  ? 'detalle-inscripcion__estado--confirmada'
                  : ''
              }`}
            >
              {inscripcion.estado}
            </Badge>
          </div>

          <p className="detalle-inscripcion__info">
            <Flag size={13} />
            <span>{inscripcion.carrera}</span>
            <span className="detalle-inscripcion__separador">·</span>
            <span>Fecha de inscripción: {inscripcion.fechaInscripcion}</span>
          </p>
        </div>
      </header>

      <Row className="detalle-inscripcion__contenido">
        {/* COLUMNA PRINCIPAL */}
        <Col xs={12} lg={8}>
          <div className="detalle-inscripcion__principal">
            {/* DATOS DEL CORREDOR */}
            <Card className="detalle-inscripcion__tarjeta">
              <Card.Header className="detalle-inscripcion__tarjeta-header">
                <h2>
                  <UserRound size={17} />
                  <span>Datos del corredor</span>
                </h2>
              </Card.Header>

              <Card.Body className="detalle-inscripcion__tarjeta-contenido">
                <div className="detalle-inscripcion__datos-corredor">
                  <div>
                    <span>NOMBRE COMPLETO</span>
                    <strong>{inscripcion.corredor.nombreCompleto}</strong>
                  </div>

                  <div>
                    <span>DNI</span>
                    <strong>{inscripcion.corredor.dni}</strong>
                  </div>

                  <div>
                    <span>FECHA DE NACIMIENTO</span>
                    <strong>{inscripcion.corredor.fechaNacimiento}</strong>
                  </div>

                  <div>
                    <span>GÉNERO</span>
                    <strong>{inscripcion.corredor.genero}</strong>
                  </div>

                  <div>
                    <span>TELÉFONO</span>
                    <strong>{inscripcion.corredor.telefono}</strong>
                  </div>

                  <div>
                    <span>EMAIL</span>
                    <strong>{inscripcion.corredor.email}</strong>
                  </div>

                  <div>
                    <span>DISCAPACIDAD</span>
                    <strong>{inscripcion.corredor.discapacidad}</strong>
                  </div>

                  <div>
                    <span>EQUIPO / CLUB</span>
                    <strong>{inscripcion.corredor.equipoClub}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* DATOS DE PARTICIPACIÓN */}
            <Card className="detalle-inscripcion__tarjeta">
              <Card.Header className="detalle-inscripcion__tarjeta-header">
                <h2>
                  <Flag size={17} />
                  <span>Datos de participación</span>
                </h2>
              </Card.Header>

              <Card.Body className="detalle-inscripcion__tarjeta-contenido">
                <div className="detalle-inscripcion__participacion">
                  <div>
                    <span>CARRERA</span>
                    <strong>{inscripcion.carrera}</strong>
                  </div>

                  <div>
                    <span>DISTANCIA</span>
                    <strong>{inscripcion.participacion.distancia}</strong>
                  </div>

                  <div>
                    <span>TIPO</span>
                    <strong>{inscripcion.participacion.tipo}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>

        {/* COLUMNA LATERAL */}
        <Col xs={12} lg={4}>
          <div className="detalle-inscripcion__lateral">
            {/* PAGO */}
            <Card className="detalle-inscripcion__tarjeta">
              <Card.Header className="detalle-inscripcion__tarjeta-header">
                <h2>
                  <CreditCard size={17} />
                  <span>Pago</span>
                </h2>
              </Card.Header>

              <Card.Body className="detalle-inscripcion__tarjeta-contenido">
                <div className="detalle-inscripcion__pago">
                  <div className="detalle-inscripcion__fila-pago">
                    <span>Estado</span>

                    <Badge
                      className={`detalle-inscripcion__badge ${
                        pagoPagado
                          ? 'detalle-inscripcion__badge--pagado'
                          : 'detalle-inscripcion__badge--pendiente'
                      }`}
                    >
                      {inscripcion.pago.estado}
                    </Badge>
                  </div>

                  <div className="detalle-inscripcion__fila-pago">
                    <span>Método</span>
                    <strong>{inscripcion.pago.metodo}</strong>
                  </div>

                  <div className="detalle-inscripcion__total">
                    <span>Total</span>
                    <strong>{inscripcion.pago.total}</strong>
                  </div>
                </div>

                <div className="detalle-inscripcion__adicionales">
                  <span>ADICIONALES ADQUIRIDOS</span>

                  <div className="detalle-inscripcion__adicional">
                    <Shirt size={15} />
                    <strong>{inscripcion.pago.adicionales}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* ENTREGA Y REQUISITOS */}
            <Card className="detalle-inscripcion__tarjeta">
              <Card.Header className="detalle-inscripcion__tarjeta-header">
                <h2>
                  <PackageCheck size={17} />
                  <span>Entrega y requisitos</span>
                </h2>
              </Card.Header>

              <Card.Body className="detalle-inscripcion__tarjeta-contenido">
                <div className="detalle-inscripcion__kit-header">
                  <span>KIT Y DORSAL</span>

                  <Badge
                    className={`detalle-inscripcion__badge ${
                      kitEntregado
                        ? 'detalle-inscripcion__badge--kit-entregado'
                        : 'detalle-inscripcion__badge--kit-pendiente'
                    }`}
                  >
                    {inscripcion.entrega.estadoKit}
                  </Badge>
                </div>

                {kitEntregado && (
                  <>
                    <div className="detalle-inscripcion__kit">
                      <div>
                        <span>Dorsal</span>
                        <strong>#{inscripcion.entrega.dorsal}</strong>
                      </div>

                      <div>
                        <span>Chip RFID</span>
                        <strong>{inscripcion.entrega.chipRfid}</strong>
                      </div>
                    </div>

                    <small className="detalle-inscripcion__fecha-entrega">
                      Entregado: {inscripcion.entrega.fechaEntrega}
                    </small>
                  </>
                )}

                <div className="detalle-inscripcion__apto">
                  <span className="detalle-inscripcion__apto-label">
                    <Stethoscope size={13} />
                    APTO MÉDICO
                  </span>

                  <Badge
                    className={`detalle-inscripcion__badge ${
                      aptoVerificado
                        ? 'detalle-inscripcion__badge--verificado'
                        : 'detalle-inscripcion__badge--pendiente'
                    }`}
                  >
                    {inscripcion.entrega.aptoMedico}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleInscripcion
