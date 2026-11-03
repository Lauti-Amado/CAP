//frontend/src/pages/clasificacion/ModificarClasificacionCarrera.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, Col, Row } from 'react-bootstrap'
import { ArrowLeft, CalendarDays, ListOrdered, MapPin, Ruler } from 'lucide-react'
import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge'
import ParticipantesCard from '../../components/clasificacion/ParticipantesCard'
import EstadisticasClasificacion from '../../components/clasificacion/EstadisticasClasificacion'
import { participantesMock } from './participanteMock'

// Borrar cuando se conecte con el backend
import { carrerasDetalleMock } from '../carreras/detalleCarreraMock'

const estiloPagina = { minHeight: '100vh', backgroundColor: '#f8f9ff' }

function ModificarClasificacionCarrera() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // TODO BACKEND: GET /api/carreras/{id} (incluye cantidadInscriptos y cantidadClasificados)
  const carrera = carrerasDetalleMock.find((c) => c.id === id)

  const volverAlDetalle = () => navigate(`/administrador/carreras/${id}`)

  if (!carrera) {
    return (
      <main className="p-4" style={estiloPagina}>
        <Alert variant="warning">No se encontró la carrera.</Alert>
        <Button variant="outline-secondary" onClick={() => navigate('/administrador/carreras')}>
          Volver al listado de carreras
        </Button>
      </main>
    )
  }

  if (carrera.estado !== 'Finalizada') {
    return (
      <main className="p-4" style={estiloPagina}>
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
    <main className="p-4" style={estiloPagina}>
      <Button
        variant="link"
        className="p-0 mb-2 d-inline-flex align-items-center gap-1 text-decoration-none"
        onClick={volverAlDetalle}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al detalle de la carrera
      </Button>

      <header className="mb-3">
        <h1 className="mb-2 text-dark" style={{ fontSize: '2rem', fontWeight: 800 }}>Dashboard de Clasificación</h1>
        <p className="mb-0 d-flex flex-wrap align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
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
      <Card className="mb-4 shadow-sm" style={{ borderLeft: '4px solid #92400e', borderRadius: '8px' }}>
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
          <Card className="h-100 shadow-sm border" style={{ borderRadius: '8px' }}>
            <Card.Body className="d-flex flex-column p-4">
              <h3 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                ACCIONES RÁPIDAS
              </h3>

              <Button
                className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center gap-2 p-4 text-white border-0"
                style={{ backgroundColor: '#16a34a', borderRadius: '8px', minHeight: '180px' }}
                onClick={() => navigate(`/administrador/carreras/${carrera.id}/clasificacion/completa`)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <ListOrdered size={28} aria-hidden="true" />
                </span>
                <strong className="fs-5">Ver clasificación completa</strong>
                <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Revisar y modificar posiciones</span>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </main>
  )
}

export default ModificarClasificacionCarrera