//frontend/src/pages/clasificacion/ClasificacionManualDetalle.tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import TarjetasCorredor from '../../components/corredor/TarjetasCorredor'
import { corredoresClasificacionMock } from './corredoresClasificacionMock'
import { useRutasClasificacion } from '../../hooks/useRutasClasificacion'
import { puestoManualSchema } from '../../schemas/clasificacionSchema'
import { validar } from '../../utils/validar'

// MOCK TEMPORAL
// TODO BACKEND: cantidad real de participantes de la carrera
const TOTAL_PARTICIPANTES = 1248

function ClasificacionManualDetalle() {
  const { dni } = useParams<{ dni: string }>()
  const navigate = useNavigate()
  const rutas = useRutasClasificacion()
  const [puesto, setPuesto] = useState('')
  const [guardado, setGuardado] = useState(false)

  // MOCK TEMPORAL
  // TODO BACKEND: GET /api/corredores?dni={dni}
  const corredor = corredoresClasificacionMock.find(
    (c) => c.dni.replace(/\D/g, '') === dni
  )

  const volverATiempoReal = () => navigate(rutas.listado, { replace: true })

  if (!corredor) {
    return (
      <Container fluid as="main" className="p-4">
        <div className="d-flex flex-column align-items-start gap-3">
          <h1 className="h3 fw-bold">Corredor no encontrado</h1>
          <Button type="button" variant="outline-success" size="sm" onClick={volverATiempoReal}>
            ← Volver a clasificación en tiempo real
          </Button>
        </div>
      </Container>
    )
  }

  // Para clasificarlo tiene que tener la inscripción paga y el dorsal asignado
  const habilitado = corredor.estadoInscripcion === 'pagado' && corredor.dorsal !== ''

  const validacionPuesto = validar(puestoManualSchema(TOTAL_PARTICIPANTES), { puesto })
  const puestoNumero = Number(puesto)
  const puestoFueraDeRango = puesto !== '' && !validacionPuesto.ok
  const puedeGuardar = habilitado && validacionPuesto.ok && !guardado

  const guardarClasificacion = () => {
  if (!puedeGuardar) return

  // MOCK TEMPORAL: simula el guardado.
  // TODO BACKEND: PUT /api/clasificaciones/{id}/resultado con { puestoGeneral }
  // (responder 409 si el puesto ya fue tomado por otro corredor).
  console.log('Guardar clasificación', { dni: corredor.dni, puestoGeneral: puestoNumero })

  // Al guardar vuelve directo a tiempo real
  navigate(rutas.listado, { replace: true })
}

  return (
        <Container fluid as="main" className="p-4">
      <header className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">Detalle de Corredor</h1>

        <Button
          type="button"
          variant="outline-success"
          size="sm"
          className="align-self-end align-self-md-start text-nowrap"
          onClick={volverATiempoReal}
        >
          ← Volver a clasificación en tiempo real
        </Button>
      </header>

      <Row className="g-3">
        <Col xs={12} md={5} lg={4} xl={3}>
          <TarjetasCorredor
            nombre={corredor.nombre}
            dni={corredor.dni}
            categoria={corredor.categoria}
            distancia={corredor.distancia}
            talleRemera={corredor.talleRemera}
            clubTeam={corredor.clubTeam}
            estadoInscripcion={corredor.estadoInscripcion}
            estadoAptoMedico={corredor.estadoAptoMedico}
          />
        </Col>

        <Col xs={12} md={7} lg={8} xl={9}>
          <Card className="h-100 shadow-sm overflow-hidden">
            <Card.Header
              className={`d-flex align-items-center justify-content-center gap-2 fw-bold text-center ${
                habilitado ? 'bg-success text-white' : 'bg-warning text-dark'
              }`}
            >
              {habilitado ? (
                <>
                  <CircleCheck size={15} />
                  HABILITADO PARA CLASIFICAR
                </>
              ) : (
                'NO HABILITADO PARA CLASIFICAR'
              )}
            </Card.Header>

            <Card.Body className="d-flex flex-column p-4">
              <Card.Subtitle className="text-center text-secondary small fw-semibold mb-3">
                DATOS DE LA CLASIFICACIÓN
              </Card.Subtitle>

              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <div className="h-100 border rounded bg-body-tertiary p-3 d-flex flex-column align-items-center justify-content-center">
                    <Form.Label className="small fw-medium text-secondary">DORSAL</Form.Label>
                    <strong className="fs-2 text-success">{corredor.dorsal}</strong>
                  </div>
                </Col>

                <Col xs={12} sm={6}>
                  <div className="h-100 border rounded bg-body-tertiary p-3 d-flex flex-column align-items-center justify-content-center">
                    <Form.Label className="small fw-medium text-secondary">CHIP RFID</Form.Label>
                    <strong className="fs-3">{corredor.chipRfid}</strong>
                  </div>
                </Col>

                <Col xs={12} sm={6}>
                  <div className="h-100 border border-primary-subtle rounded bg-primary-subtle p-3">
                    <Form.Label htmlFor="puesto-general" className="small fw-medium text-secondary">
                      Puesto General
                    </Form.Label>

                    <Form.Control
                      id="puesto-general"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      size="lg"
                      className="fw-bold"
                      value={puesto}
                      placeholder="Ej. 42"
                      disabled={!habilitado || guardado}
                      isInvalid={puestoFueraDeRango}
                      onChange={(event) => {
                        setPuesto(event.target.value.replace(/\D/g, ''))
                        setGuardado(false)
                      }}
                    />

                    {puestoFueraDeRango && (
                      <div className="text-danger small mt-1">{validacionPuesto.errores.puesto}</div>
                    )}
                  </div>
                </Col>
              </Row>

              {guardado && (
                <Alert variant="success" className="d-flex align-items-start gap-2 mt-3 mb-0" role="status">
                  <CircleCheck size={17} className="flex-shrink-0 mt-1" />
                  <span>
                    Clasificación simulada correctamente para el dorsal {corredor.dorsal} en el puesto{' '}
                    {puestoNumero}.
                  </span>
                </Alert>
              )}

              <div className="text-center mt-auto pt-4">
                <Button
                  type="button"
                  variant="success"
                  size="lg"
                  className="rounded-pill px-4"
                  disabled={!puedeGuardar}
                  onClick={guardarClasificacion}
                >
                  {guardado ? 'Clasificación guardada' : 'Guardar clasificación'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ClasificacionManualDetalle