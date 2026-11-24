
import { useEffect, useState, type ReactNode } from 'react'
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
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Row,
  Spinner,
} from 'react-bootstrap'

import type { InscripcionDetalleDTO } from '../../types/inscripcion'
import {
  obtenerInscripcion,
  cargarAptoMedico,
} from '../../services/inscripcionService'

function EncabezadoTarjeta({
  icono,
  titulo,
}: {
  icono: ReactNode
  titulo: string
}) {
  return (
    <Card.Header className="bg-body-tertiary">
      <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
        <span className="d-inline-flex rounded-circle bg-success-subtle text-success p-2">
          {icono}
        </span>
        {titulo}
      </h2>
    </Card.Header>
  )
}

function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: ReactNode
}) {
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

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'No disponible'

  return new Date(fecha).toLocaleDateString('es-AR')
}

function formatearImporte(importe: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(importe)
}

function formatearTexto(texto: string) {
  return texto.replaceAll('_', ' ')
}

function DetalleInscripcion() {
  const { id, nombreCarrera } = useParams<{
    id: string
    nombreCarrera: string
  }>()

  const navigate = useNavigate()

  const [inscripcion, setInscripcion] =
    useState<InscripcionDetalleDTO | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para la carga de apto médico
  const [cargandoApto, setCargandoApto] = useState(false)
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [mensajeApto, setMensajeApto] = useState<string | null>(null)
  const [errorApto, setErrorApto] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function cargarDetalle() {
      if (!id) {
        setError('No se recibió el identificador de la inscripción.')
        setCargando(false)
        return
      }

      try {
        setCargando(true)
        setError(null)

        const resultado = await obtenerInscripcion(id)

        if (!cancelado) {
          setInscripcion(resultado)
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el detalle de la inscripción.'
          )
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    void cargarDetalle()

    return () => {
      cancelado = true
    }
  }, [id])

  // Registrar el apto médico de una inscripción existente
  async function handleCargarApto() {
    if (!id || !fechaVencimiento) return

    try {
      setCargandoApto(true)
      setErrorApto(null)
      setMensajeApto(null)

      const actualizado = await cargarAptoMedico(id, fechaVencimiento)

      setInscripcion(actualizado)
      setFechaVencimiento('')
      setMensajeApto('Apto médico cargado correctamente.')
    } catch (err) {
      setErrorApto(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el apto médico.'
      )
    } finally {
      setCargandoApto(false)
    }
  }

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

  if (cargando) {
    return (
      <Container fluid className="p-4">
        {botonVolver}
        <div className="d-flex align-items-center gap-2 text-secondary">
          <Spinner animation="border" size="sm" />
          <span>Cargando detalle de inscripción...</span>
        </div>
      </Container>
    )
  }

  if (error || !inscripcion) {
    return (
      <Container fluid className="p-4">
        {botonVolver}

        <Row>
          <Col xs={12} md={8} lg={6}>
            <Alert variant="danger">
              <Alert.Heading className="h5">
                No se pudo cargar la inscripción
              </Alert.Heading>
              {error ?? 'No se encontró la inscripción solicitada.'}
            </Alert>
          </Col>
        </Row>
      </Container>
    )
  }

  const { corredor, carrera, distancia, pago, entrega, aptoMedico } =
    inscripcion

  const kitEntregado = entrega !== null

  const nombreEstado = formatearTexto(inscripcion.estado)
  const pagoEstado = pago.pagado ? 'Pagado' : 'Pendiente'

  const colorEstado =
    inscripcion.estado === 'Anulada'
      ? 'danger'
      : inscripcion.estado === 'Pagada'
        ? 'success'
        : 'secondary'

  const colorApto = !aptoMedico.requerido
    ? 'secondary'
    : aptoMedico.vigente
      ? 'success'
      : 'danger'

  const textoApto = !aptoMedico.requerido
    ? 'No requerido'
    : aptoMedico.vigente
      ? 'Vigente'
      : 'No vigente'

  const datosCorredor: [string, string][] = [
    ['NOMBRE COMPLETO', `${corredor.nombre} ${corredor.apellido}`],
    ['DNI', corredor.dni],
    ['FECHA DE NACIMIENTO', formatearFecha(corredor.fechaNacimiento)],
    ['GÉNERO', formatearTexto(corredor.sexo)],
    ['TELÉFONO', corredor.telefono],
    ['EMAIL', corredor.email ?? 'No registrado'],
    [
      'DISCAPACIDAD',
      corredor.discapacidad
        ? formatearTexto(corredor.discapacidad)
        : 'No declara',
    ],
    ['EQUIPO / CLUB', corredor.equipo ?? 'Sin equipo'],
  ]

  const datosParticipacion: [string, string][] = [
    ['CARRERA', carrera.nombre],
    ['DISTANCIA', `${distancia.kilometraje}K`],
    ['TIPO', formatearTexto(distancia.tipoDistancia)],
  ]

  return (
    <Container fluid className="p-4">
      {botonVolver}

      <header className="mb-4">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h1 className="h2 fw-bold mb-0">Detalle de inscripción</h1>
          <EstadoBadge texto={nombreEstado} color={colorEstado} />
        </div>

        <p className="d-flex flex-wrap align-items-center gap-2 small text-secondary mb-0">
          <Flag size={13} aria-hidden="true" />
          <span>{carrera.nombre}</span>
          <span>·</span>
          <span>
            Fecha de inscripción: {formatearFecha(inscripcion.fechaHoraCreacion)}
          </span>
        </p>
      </header>

      <Row className="g-3">
        {/* COLUMNA PRINCIPAL */}
        <Col xs={12} lg={8} className="d-flex flex-column gap-3">
          <Card>
            <EncabezadoTarjeta
              icono={<UserRound size={14} />}
              titulo="Datos del corredor"
            />
            <Card.Body>
              <Row xs={1} sm={2} className="g-3">
                {datosCorredor.map(([etiqueta, valor]) => (
                  <Col key={etiqueta}>
                    <Dato etiqueta={etiqueta}>{valor}</Dato>
                  </Col>
                ))}
              </Row>

              <hr />

              <h3 className="h6 fw-bold mb-3">Contacto de emergencia</h3>
              <Row xs={1} sm={2} className="g-3">
                <Col>
                  <Dato etiqueta="NOMBRE">
                    {corredor.contactoEmergencia.nombre}{' '}
                    {corredor.contactoEmergencia.apellido}
                  </Dato>
                </Col>
                <Col>
                  <Dato etiqueta="DNI">
                    {corredor.contactoEmergencia.dni}
                  </Dato>
                </Col>
                <Col>
                  <Dato etiqueta="TELÉFONO">
                    {corredor.contactoEmergencia.telefono}
                  </Dato>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <EncabezadoTarjeta
              icono={<Flag size={14} />}
              titulo="Datos de participación"
            />
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
            <EncabezadoTarjeta
              icono={<CreditCard size={14} />}
              titulo="Pago"
            />
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span className="small text-secondary">Estado</span>
                  <EstadoBadge
                    texto={pagoEstado}
                    color={pago.pagado ? 'success' : 'danger'}
                  />
                </ListGroup.Item>

                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span className="small text-secondary">Método</span>
                  <strong className="small">
                    {formatearTexto(pago.metodo)}
                  </strong>
                </ListGroup.Item>

                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span className="fw-semibold">Total</span>
                  <strong className="fs-5 text-success">
                    {formatearImporte(pago.total)}
                  </strong>
                </ListGroup.Item>
              </ListGroup>

              <small className="d-block text-secondary mt-3 mb-2">
                ADICIONALES ADQUIRIDOS
              </small>

              {pago.productos.length > 0 ? (
                <ListGroup variant="flush">
                  {pago.productos.map((producto, index) => (
                    <ListGroup.Item
                      key={`${producto.nombre}-${producto.variante}-${index}`}
                      className="d-flex align-items-center justify-content-between px-0 small"
                    >
                      <span className="d-flex align-items-center gap-2">
                        <Shirt size={15} aria-hidden="true" />
                        {producto.nombre} ({producto.variante})
                      </span>
                      <strong>x{producto.cantidad}</strong>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="small text-secondary mb-0">
                  No adquirió productos adicionales.
                </p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <EncabezadoTarjeta
              icono={<PackageCheck size={14} />}
              titulo="Entrega y requisitos"
            />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                <small className="text-secondary">KIT Y DORSAL</small>
                <EstadoBadge
                  texto={kitEntregado ? 'Entregado' : 'Pendiente'}
                  color={kitEntregado ? 'success' : 'danger'}
                />
              </div>

              {entrega && (
                <>
                  <Row xs={2} className="g-2 mt-1">
                    <Col>
                      <div className="bg-body-tertiary border rounded p-2 text-center">
                        <small className="d-block text-secondary">Dorsal</small>
                        <strong>#{entrega.dorsal.numero}</strong>
                      </div>
                    </Col>
                    <Col>
                      <div className="bg-body-tertiary border rounded p-2 text-center">
                        <small className="d-block text-secondary">Chip RFID</small>
                        <strong className="text-break">
                          {entrega.dorsal.chip
                            ? entrega.dorsal.chip.numero
                            : 'Sin chip'}
                        </strong>
                      </div>
                    </Col>
                  </Row>

                  <small className="d-block text-secondary text-end mt-2">
                    Entregado: {formatearFecha(entrega.fechaHoraEntrega)}
                  </small>
                </>
              )}

              <div className="d-flex justify-content-between align-items-center border-top mt-3 pt-3">
                <small className="d-inline-flex align-items-center gap-1 text-secondary">
                  <Stethoscope size={13} aria-hidden="true" />
                  APTO MÉDICO
                </small>

                <EstadoBadge texto={textoApto} color={colorApto} />
              </div>

              {aptoMedico.requerido && aptoMedico.fechaVencimiento && (
                <small className="d-block text-secondary text-end mt-2">
                  Vencimiento: {formatearFecha(aptoMedico.fechaVencimiento)}
                </small>
              )}

              {/* Formulario para cargar un apto médico pendiente */}
              {aptoMedico.requerido && !aptoMedico.vigente && (
                <div className="mt-3">
                  <Form.Group>
                    <Form.Label className="small fw-semibold">
                      Fecha de vencimiento del nuevo apto
                    </Form.Label>

                    <Form.Control
                      type="date"
                      size="sm"
                      value={fechaVencimiento}
                      onChange={(event) => {
                        setFechaVencimiento(event.target.value)
                        setErrorApto(null)
                        setMensajeApto(null)
                      }}
                      disabled={cargandoApto}
                    />
                  </Form.Group>

                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    className="w-100 mt-2"
                    disabled={!fechaVencimiento || cargandoApto}
                    onClick={handleCargarApto}
                  >
                    {cargandoApto ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      'Registrar apto médico'
                    )}
                  </Button>
                </div>
              )}

              {mensajeApto && (
                <Alert variant="success" className="mt-3 mb-0">
                  {mensajeApto}
                </Alert>
              )}

              {errorApto && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {errorApto}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleInscripcion