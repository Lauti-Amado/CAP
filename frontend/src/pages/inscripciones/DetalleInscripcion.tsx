//frontend/src/pages/inscripciones/DetalleInscripcion.tsx
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserRound, Flag, CreditCard, PackageCheck, Stethoscope, Shirt } from 'lucide-react'
import { Badge, Button, Card, Col, Container, ListGroup, Row } from 'react-bootstrap'

import type { InscripcionDetalle } from '../../types/inscripcion'

// MOCK TEMPORAL
// Borrar cuando se conecte con el backend.
import { inscripcionDetalleMock } from './detalleInscripcionMock'

function EncabezadoTarjeta({ icono, titulo }: { icono: ReactNode; titulo: string }) {
  return (
    <Card.Header className="bg-body-tertiary">
      <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
        <span className="d-inline-flex rounded-circle bg-success-subtle text-success p-2">{icono}</span>
        {titulo}
      </h2>
    </Card.Header>
  )
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <small className="d-block text-secondary">{etiqueta}</small>
      <strong className="text-break">{children}</strong>
    </div>
  )
}

function EstadoBadge({ texto, color }: { texto: string; color: string }) {
  return (
    <Badge pill bg={`${color}-subtle`} text={`${color}-emphasis`}>
      {texto}
    </Badge>
  )
}

function DetalleInscripcion() {
  const { id, nombreCarrera } = useParams<{ id: string; nombreCarrera: string }>()
  const navigate = useNavigate()

  // MOCK TEMPORAL
  // TODO BACKEND: reemplazar por GET /api/inscripciones/{id}
  const inscripcion: InscripcionDetalle | undefined = inscripcionDetalleMock.find(
    (inscripcion) => inscripcion.id === id,
  )

  const volverAInscripciones = () => {
    navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)
  }

  const botonVolver = (
    <Button
      type="button"
      variant="link"
      className="d-inline-flex align-items-center gap-1 p-0 mb-3 small text-success text-decoration-none"
      onClick={volverAInscripciones}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Volver a inscripciones
    </Button>
  )

  if (!inscripcion) {
    return (
      <Container fluid className="p-4">
        {botonVolver}

        <Row>
          <Col xs={12} md={8} lg={6}>
            <Card>
              <Card.Body>
                <Card.Title as="h1" className="h5 fw-bold">Inscripción no encontrada</Card.Title>
                <Card.Text className="text-secondary mb-0">
                  No se encontró una inscripción asociada al identificador indicado.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  const kitEntregado = inscripcion.entrega.estadoKit.toLowerCase() === 'entregado'
  const pagoPagado = inscripcion.pago.estado.toLowerCase() === 'pagado'
  const estadoConfirmado = inscripcion.estado.toLowerCase() === 'confirmada'
  const aptoVerificado = inscripcion.entrega.aptoMedico.toLowerCase() === 'verificado'

  const { corredor, participacion, pago, entrega } = inscripcion

  const datosCorredor: [string, string][] = [
    ['NOMBRE COMPLETO', corredor.nombreCompleto],
    ['DNI', corredor.dni],
    ['FECHA DE NACIMIENTO', corredor.fechaNacimiento],
    ['GÉNERO', corredor.genero],
    ['TELÉFONO', corredor.telefono],
    ['EMAIL', corredor.email],
    ['DISCAPACIDAD', corredor.discapacidad],
    ['EQUIPO / CLUB', corredor.equipoClub],
  ]

  const datosParticipacion: [string, string][] = [
    ['CARRERA', inscripcion.carrera],
    ['DISTANCIA', participacion.distancia],
    ['TIPO', participacion.tipo],
  ]

  return (
    <Container fluid className="p-4">
      {botonVolver}

      <header className="mb-4">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h1 className="h2 fw-bold mb-0">Inscripción #{inscripcion.numero}</h1>
          <EstadoBadge texto={inscripcion.estado} color={estadoConfirmado ? 'success' : 'secondary'} />
        </div>

        <p className="d-flex flex-wrap align-items-center gap-2 small text-secondary mb-0">
          <Flag size={13} aria-hidden="true" />
          <span>{inscripcion.carrera}</span>
          <span>·</span>
          <span>Fecha de inscripción: {inscripcion.fechaInscripcion}</span>
        </p>
      </header>

      <Row className="g-3">
        {/* COLUMNA PRINCIPAL */}
        <Col xs={12} lg={8} className="d-flex flex-column gap-3">
          <Card>
            <EncabezadoTarjeta icono={<UserRound size={14} />} titulo="Datos del corredor" />
            <Card.Body>
              <Row xs={1} sm={2} className="g-3">
                {datosCorredor.map(([etiqueta, valor]) => (
                  <Col key={etiqueta}>
                    <Dato etiqueta={etiqueta}>{valor}</Dato>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <EncabezadoTarjeta icono={<Flag size={14} />} titulo="Datos de participación" />
            <Card.Body>
              <Row xs={1} sm={3} className="g-2">
                {datosParticipacion.map(([etiqueta, valor]) => (
                  <Col key={etiqueta}>
                    <div className="h-100 bg-body-tertiary border rounded p-3">
                      <Dato etiqueta={etiqueta}>{valor}</Dato>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA LATERAL */}
        <Col xs={12} lg={4} className="d-flex flex-column gap-3">
          <Card>
            <EncabezadoTarjeta icono={<CreditCard size={14} />} titulo="Pago" />
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span className="small text-secondary">Estado</span>
                  <EstadoBadge texto={pago.estado} color={pagoPagado ? 'success' : 'danger'} />
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span className="small text-secondary">Método</span>
                  <strong className="small">{pago.metodo}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span className="fw-semibold">Total</span>
                  <strong className="fs-5 text-success">{pago.total}</strong>
                </ListGroup.Item>
              </ListGroup>

              <small className="d-block text-secondary mt-3 mb-2">ADICIONALES ADQUIRIDOS</small>
              <div className="d-flex align-items-center gap-2 bg-body-tertiary border rounded p-2 small">
                <Shirt size={15} aria-hidden="true" />
                <strong className="fw-medium">{pago.adicionales}</strong>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <EncabezadoTarjeta icono={<PackageCheck size={14} />} titulo="Entrega y requisitos" />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                <small className="text-secondary">KIT Y DORSAL</small>
                <EstadoBadge texto={entrega.estadoKit} color={kitEntregado ? 'success' : 'danger'} />
              </div>

              {kitEntregado && (
                <>
                  <Row xs={2} className="g-2 mt-1">
                    <Col>
                      <div className="bg-body-tertiary border rounded p-2 text-center">
                        <small className="d-block text-secondary">Dorsal</small>
                        <strong>#{entrega.dorsal}</strong>
                      </div>
                    </Col>
                    <Col>
                      <div className="bg-body-tertiary border rounded p-2 text-center">
                        <small className="d-block text-secondary">Chip RFID</small>
                        <strong className="text-break">{entrega.chipRfid}</strong>
                      </div>
                    </Col>
                  </Row>

                  <small className="d-block text-secondary text-end mt-2">
                    Entregado: {entrega.fechaEntrega}
                  </small>
                </>
              )}

              <div className="d-flex justify-content-between align-items-center border-top mt-3 pt-3">
                <small className="d-inline-flex align-items-center gap-1 text-secondary">
                  <Stethoscope size={13} aria-hidden="true" />
                  APTO MÉDICO
                </small>
                <EstadoBadge texto={entrega.aptoMedico} color={aptoVerificado ? 'info' : 'danger'} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleInscripcion