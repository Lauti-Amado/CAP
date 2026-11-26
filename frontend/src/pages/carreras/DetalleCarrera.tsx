//frontend/src/pages/carreras/DetalleCarrera.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Badge, Button, Card, Col, Container, ProgressBar, Row, Spinner } from 'react-bootstrap'
import { ArrowLeft, UsersRound, PackageCheck, Timer } from 'lucide-react'
import { useDetalleCarrera } from '../../hooks/useDetalleCarrera'

function DetalleCarrera() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { carrera, cargando, error } = useDetalleCarrera(id)

  const volverAlListado = () => navigate('/administrador/carreras')

  if (cargando) {
    return (
      <Container fluid className="px-4 py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-2 text-secondary">Cargando carrera...</p>
      </Container>
    )
  }

  if (error || !carrera) {
    return (
      <Container fluid className="px-4 py-4">
        <Alert variant={error ? 'danger' : 'warning'}>{error ?? 'No se encontró la carrera.'}</Alert>

        <Button type="button" variant="outline-secondary" size="sm" onClick={volverAlListado}>
          ← Volver al listado de carreras
        </Button>
      </Container>
    )
  }

  const fecha = new Date(carrera.fechaHoraCarrera)

  const inscripcionesAbiertas = carrera.estado === 'Publicada' || carrera.estado === 'Activa'

  const porcentajeCupo =
    carrera.participantesMax > 0
      ? Math.min(100, Math.round((carrera.cantidadInscriptos / carrera.participantesMax) * 100))
      : 0

  const estadisticas = [
    { titulo: 'Inscriptos totales', valor: carrera.cantidadInscriptos, icono: UsersRound },
    { titulo: 'Kits entregados', valor: carrera.cantidadKitsEntregados, icono: PackageCheck },
    { titulo: 'Clasificados', valor: carrera.cantidadClasificados, icono: Timer },
  ]

  return (
    <Container fluid as="main" className="px-3 px-md-4 py-3 min-vh-100">
      {/* Botón volver */}
      <Button
        type="button"
        variant="link"
        className="d-inline-flex align-items-center gap-2 p-0 mb-3 text-decoration-none text-secondary"
        onClick={volverAlListado}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al listado de carreras
      </Button>

      {/* Cabecera */}
      <header className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h1 className="h3 fw-bold mb-0">{carrera.nombre}</h1>

        <div className="d-flex align-items-center gap-2">
          {inscripcionesAbiertas && (
            <Badge pill bg="success" className="px-3 py-2 text-uppercase">
              Inscripciones abiertas
            </Badge>
          )}

          {carrera.estado === 'Finalizada' && (
            <Button
              type="button"
              variant="warning"
              className="rounded-pill fw-semibold px-3"
              onClick={() => navigate(`/administrador/carreras/${carrera.id}/clasificacion`)}
            >
              Modificar clasificación
            </Button>
          )}
        </div>
      </header>

      <Row className="g-3 align-items-start">
        {/* Columna izquierda: detalles del evento */}
        <Col xs={12} lg={4} xl={3}>
          <Card className="overflow-hidden">
            <Card.Header as="h2" className="h6 fw-semibold bg-transparent border-0 pt-3 pb-2 mb-0">
              Detalles del Evento
            </Card.Header>

            <div className="ratio ratio-21x9">
              <img
                src={carrera.imagenUrl}
                alt={`Imagen de ${carrera.nombre}`}
                className="object-fit-cover"
              />
            </div>

            <Card.Body>
              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div className="small text-uppercase text-secondary">Fecha</div>
                  <strong>{fecha.toLocaleDateString('es-AR')}</strong>
                </Col>

                <Col xs={6}>
                  <div className="small text-uppercase text-secondary">Hora de llegada</div>
                  <strong>{fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</strong>
                </Col>
              </Row>

              <div className="mb-3">
                <div className="small text-uppercase text-secondary mb-2">Distancias oficiales</div>

                <div className="d-flex flex-wrap gap-1">
                  {carrera.distancias.map((distancia, indice) => (
                    <Badge key={`${distancia.kilometraje}-${indice}`} bg="light" text="dark" className="border">
                      {distancia.kilometraje}K
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-uppercase text-secondary">Cupo de corredores</span>
                  <strong className="small text-success">
                    {carrera.cantidadInscriptos} / {carrera.participantesMax}
                  </strong>
                </div>

                <ProgressBar now={porcentajeCupo} variant="success" aria-label={`Cupo: ${porcentajeCupo}%`} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna derecha: estadísticas y descripción */}
        <Col xs={12} lg={8} xl={9}>
          <Row className="g-3 mb-3">
            {estadisticas.map(({ titulo, valor, icono: Icono }) => (
              <Col xs={12} sm={4} key={titulo}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <span className="small fw-semibold text-uppercase text-secondary">{titulo}</span>

                      <span className="d-inline-flex p-2 rounded bg-primary-subtle text-primary">
                        <Icono size={16} aria-hidden="true" />
                      </span>
                    </div>

                    <strong className="fs-1 lh-1 mt-3">{valor}</strong>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card>
            <Card.Body>
              <h2 className="h6 fw-semibold mb-2">Descripción General</h2>
              <p className="small mb-0">{carrera.descripcion}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleCarrera