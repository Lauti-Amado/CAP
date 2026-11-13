//frontend/src/pages/carreras/DetalleCarrera.tsx
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  ProgressBar,
  Row,
  Spinner,
} from 'react-bootstrap'
import { ArrowLeft, UsersRound, PackageCheck, Timer } from 'lucide-react'
import { useState } from 'react'
import { useDetalleCarrera } from '../../hooks/useDetalleCarrera'

function DetalleCarrera() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { carrera, cargando, error } = useDetalleCarrera(id)
  const [hoverVolver, setHoverVolver] = useState(false)
  const [hoverModificar, setHoverModificar] = useState(false)

  if (cargando) {
    return (
      <Container fluid className="px-4 py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-2 text-secondary">Cargando carrera...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container fluid className="px-4 py-4">
        <Alert variant="danger">{error}</Alert>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate('/administrador/carreras')}
        >
          ← Volver al listado de carreras
        </Button>
      </Container>
    )
  }

  if (!carrera) {
    return (
      <Container fluid className="px-4 py-4">
        <Alert variant="warning">No se encontró la carrera.</Alert>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate('/administrador/carreras')}
        >
          ← Volver al listado de carreras
        </Button>
      </Container>
    )
  }

  const fecha = new Date(carrera.fechaHoraCarrera)

  const distancias = carrera.distancias.map(
    (item) => `${item.kilometraje}K`
  )

  const inscripcionesAbiertas =
    carrera.estado === 'Publicada' ||
    carrera.estado === 'Activa'

  const porcentajeCupo =
    carrera.participantesMax > 0
      ? Math.min(100, Math.round((carrera.cantidadInscriptos / carrera.participantesMax) * 100))
      : 0

  return (
    <Container
      fluid
      as="main"
      className="px-3 px-md-4 py-3"
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Botón volver */}
      <Button
        type="button"
        variant="link"
        className="d-inline-flex align-items-center gap-2 p-0 mb-3 text-decoration-none"
        onClick={() => navigate('/administrador/carreras')}
        onMouseEnter={() => setHoverVolver(true)}
        onMouseLeave={() => setHoverVolver(false)}
        style={{
          color: hoverVolver ? '#15803d' : '#374151',
          fontSize: '13px',
          transition: 'color 0.15s ease-in-out',
        }}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al listado de carreras
      </Button>

      {/* Cabecera */}
      <header className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <h1
          style={{
            margin: 0,
            maxWidth: '550px',
            fontSize: '25px',
            lineHeight: 1.15,
            fontWeight: 700,
            color: '#172033',
          }}
        >
          {carrera.nombre}
        </h1>

        <div className="d-flex align-items-center gap-2">
          {inscripcionesAbiertas && (
            <div
              className="d-inline-flex align-items-center justify-content-center text-center"
              style={{
                minWidth: '95px',
                minHeight: '38px',
                padding: '5px 12px',
                backgroundColor: '#22c55e',
                color: '#14532d',
                borderRadius: '18px',
                fontSize: '9px',
                lineHeight: 1.15,
                fontWeight: 600,
                letterSpacing: '0.2px',
              }}
            >
              INSCRIPCIONES
              <br />
              ABIERTAS
            </div>
          )}

          {carrera.estado === 'Finalizada' && (
            <Button
              type="button"
              className="fw-semibold border-0 text-white"
              onClick={() => navigate(`/administrador/carreras/${carrera.id}/clasificacion`)}
              onMouseEnter={() => setHoverModificar(true)}
              onMouseLeave={() => setHoverModificar(false)}
              style={{
                minWidth: '120px',
                minHeight: '34px',
                padding: '6px 14px',
                borderRadius: '18px',
                backgroundColor: hoverModificar ? '#ea580c' : '#f97316',
                fontSize: '11px',
                transition: 'background-color 0.15s ease-in-out',
              }}
            >
              Modificar clasificación
            </Button>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <Row className="g-3 align-items-start">
        {/* Columna Izquierda: Detalles del Evento */}
        <Col xs={12} lg={4} xl={3}>
          <Card
            className="border shadow-none"
            style={{
              borderColor: '#d8ddd9',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
          >
            <Card.Header
              className="bg-transparent border-0 px-3 pt-3 pb-2"
              style={{ padding: '16px 14px 10px' }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#172033',
                }}
              >
                Detalles del Evento
              </h2>
            </Card.Header>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '135px',
                overflow: 'hidden',
              }}
            >
              <img
                src={carrera.imagenUrl}
                alt={`Imagen de ${carrera.nombre}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <Card.Body className="p-3">
              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div className="d-flex flex-column gap-1">
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                      }}
                    >
                      FECHA
                    </span>
                    <strong
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#172033',
                      }}
                    >
                      {fecha.toLocaleDateString('es-AR')}
                    </strong>
                  </div>
                </Col>

                <Col xs={6}>
                  <div className="d-flex flex-column gap-1">
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                      }}
                    >
                      HORA DE LLEGADA
                    </span>
                    <strong
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#172033',
                      }}
                    >
                      {fecha.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <span
                  className="d-block mb-2"
                  style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  DISTANCIAS OFICIALES
                </span>
                <div className="d-flex flex-wrap gap-1">
                  {distancias.map((distancia, index) => (
                    <Badge
                      key={`${distancia}-${index}`}
                      bg="light"
                      style={{
                        padding: '5px 8px',
                        backgroundColor: '#eef2f7',
                        border: '1px solid #d7dee8',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#374151',
                      }}
                    >
                      {distancia}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span
                    style={{
                      fontSize: '8px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                    }}
                  >
                    CUPO DE CORREDORES
                  </span>
                  <strong
                    style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      color: '#15803d',
                    }}
                  >
                    {carrera.cantidadInscriptos} / {carrera.participantesMax}
                  </strong>
                </div>

                <ProgressBar
                  now={porcentajeCupo}
                  style={{
                    height: '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '10px',
                  }}
                  className="mt-1"
                >
                  <ProgressBar
                    now={porcentajeCupo}
                    style={{
                      backgroundColor: '#15803d',
                      borderRadius: '10px',
                    }}
                    aria-label={`Cupo: ${porcentajeCupo}%`}
                  />
                </ProgressBar>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Estadísticas y Descripción */}
        <Col xs={12} lg={8} xl={9}>
          {/* Tarjetas de Estadísticas */}
          <Row className="g-3 mb-3">
            <Col xs={12} sm={4}>
              <Card
                className="h-100 border shadow-none"
                style={{
                  minHeight: '105px',
                  borderColor: '#d8ddd9',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span
                      style={{
                        fontSize: '9px',
                        lineHeight: 1.25,
                        fontWeight: 600,
                        color: '#4b5563',
                      }}
                    >
                      INSCRIPTOS
                      <br />
                      TOTALES
                    </span>
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '5px',
                        backgroundColor: '#eef2ff',
                        color: '#5265a8',
                      }}
                    >
                      <UsersRound size={16} />
                    </div>
                  </div>
                  <strong
                    className="mt-2"
                    style={{
                      fontSize: '28px',
                      lineHeight: 1,
                      fontWeight: 700,
                      color: '#172033',
                    }}
                  >
                    {carrera.cantidadInscriptos}
                  </strong>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={4}>
              <Card
                className="h-100 border shadow-none"
                style={{
                  minHeight: '105px',
                  borderColor: '#d8ddd9',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span
                      style={{
                        fontSize: '9px',
                        lineHeight: 1.25,
                        fontWeight: 600,
                        color: '#4b5563',
                      }}
                    >
                      KITS
                      <br />
                      ENTREGADOS
                    </span>
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '5px',
                        backgroundColor: '#eef2ff',
                        color: '#5265a8',
                      }}
                    >
                      <PackageCheck size={16} />
                    </div>
                  </div>
                  <strong
                    className="mt-2"
                    style={{
                      fontSize: '28px',
                      lineHeight: 1,
                      fontWeight: 700,
                      color: '#172033',
                    }}
                  >
                    {carrera.cantidadKitsEntregados}
                  </strong>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={4}>
              <Card
                className="h-100 border shadow-none"
                style={{
                  minHeight: '105px',
                  borderColor: '#d8ddd9',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span
                      style={{
                        fontSize: '9px',
                        lineHeight: 1.25,
                        fontWeight: 600,
                        color: '#4b5563',
                      }}
                    >
                      CLASIFICADOS
                    </span>
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '5px',
                        backgroundColor: '#eef2ff',
                        color: '#5265a8',
                      }}
                    >
                      <Timer size={16} />
                    </div>
                  </div>
                  <strong
                    className="mt-2"
                    style={{
                      fontSize: '28px',
                      lineHeight: 1,
                      fontWeight: 700,
                      color: '#172033',
                    }}
                  >
                    {carrera.cantidadClasificados}
                  </strong>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Descripción General */}
          <Card
            className="border shadow-none"
            style={{
              borderColor: '#d8ddd9',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
            }}
          >
            <Card.Body className="p-3">
              <h2
                className="mb-2"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#172033',
                }}
              >
                Descripción General
              </h2>
              <p
                className="mb-0"
                style={{
                  fontSize: '11px',
                  lineHeight: 1.55,
                  color: '#374151',
                }}
              >
                {carrera.descripcion}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleCarrera
