//frontend/src/pages/clasificacion/ModificarClasificacionCarrera.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, Col, Row } from 'react-bootstrap'
import { ArrowLeft, CalendarDays, ListOrdered, MapPin, Ruler } from 'lucide-react'
import './DashboardClasificacion.css'
import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge'
import ParticipantesCard from '../../components/clasificacion/ParticipantesCard'
import EstadisticasClasificacion from '../../components/clasificacion/EstadisticasClasificacion'
import { participantesMock } from './participanteMock'

// Borrar cuando se conecte con el backend
import { carrerasDetalleMock } from '../carreras/detalleCarreraMock'

function ModificarClasificacionCarrera() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // TODO BACKEND: GET /api/carreras/{id} (incluye cantidadInscriptos y cantidadClasificados)
  const carrera = carrerasDetalleMock.find((c) => c.id === id)

  const volverAlDetalle = () => navigate(`/administrador/carreras/${id}`)

  if (!carrera) {
    return (
      <main className="dc-pagina p-4">
        <Alert variant="warning">No se encontró la carrera.</Alert>
        <Button variant="outline-secondary" onClick={() => navigate('/administrador/carreras')}>
          Volver al listado de carreras
        </Button>
      </main>
    )
  }

  if (carrera.estado !== 'Finalizada') {
    return (
      <main className="dc-pagina p-4">
        <Alert variant="info">Solo se puede modificar la clasificación de carreras finalizadas.</Alert>
        <Button variant="outline-secondary" onClick={volverAlDetalle}>
          Volver al detalle
        </Button>
      </main>
    )
  }

  const fecha = new Date(carrera.fechaHoraCarrera).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const distancias = carrera.distancias.map((item) => `${item.kilometraje}K`).join(', ')

  const participantes = carrera.cantidadInscriptos
  const llegados = carrera.cantidadClasificados
  const pendientes = participantes - llegados
  const progreso = participantes === 0 ? 0 : Math.round((llegados / participantes) * 100)

  return (
    <main className="dc-pagina p-4">
      <Button
        variant="link"
        className="p-0 mb-2 d-inline-flex align-items-center gap-1 text-decoration-none"
        onClick={volverAlDetalle}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al detalle de la carrera
      </Button>

      <header className="mb-3">
        <h1 className="dc-titulo mb-2">Dashboard de Clasificación</h1>
        <p className="dc-subtitulo mb-0">
          <strong>{carrera.nombre}</strong>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <Ruler size={14} aria-hidden="true" /> {distancias}
          </span>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <CalendarDays size={14} aria-hidden="true" /> {fecha}
          </span>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <MapPin size={14} aria-hidden="true" /> {carrera.lugar.nombre}, {carrera.lugar.localidad}
          </span>
        </p>
      </header>

      {/* La carrera ya terminó: solo se muestra el estado, sin cronómetro ni botones de iniciar/detener */}
      <Card className="dc-timer dc-timer--finalizada mb-3">
        <Card.Body>
          <EstadoCarreraBadge estado="finalizada" />
          <p className="small text-secondary mt-2 mb-0">
            La carrera finalizó. Podés revisar y modificar la clasificación de cada corredor.
          </p>
        </Card.Body>
      </Card>

      <EstadisticasClasificacion
        participantes={participantes}
        llegados={llegados}
        pendientes={pendientes}
        progreso={progreso}
      />

      <Row className="g-3">
        <Col xs={12} lg={8}>
          <ParticipantesCard
            participantes={participantesMock}
            textoAccion="Modificar clasificación"
            onVerClasificacion={(p) =>
              navigate(`/administrador/carreras/${carrera.id}/clasificacion/${p.id}`)   // ← antes /clasificador/...
            }
          />
        </Col>

        <Col xs={12} lg={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <h3 className="dc-etiqueta mb-3">ACCIONES RÁPIDAS</h3>

              <Button
                variant="success"
                className="dc-accion-principal dc-accion-principal--tile flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center gap-2"
                onClick={() => navigate(`/administrador/carreras/${carrera.id}/clasificacion/completa`)}   // ← antes tiempo-real; sin el TODO
              >
                <span className="dc-accion-icono">
                  <ListOrdered size={28} aria-hidden="true" />
                </span>
                <strong className="fs-5">Ver clasificación completa</strong>
                <span className="dc-accion-sub">Revisar y modificar posiciones</span>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </main>
  )
}

export default ModificarClasificacionCarrera