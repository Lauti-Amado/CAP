//frontend/src/pages/clasificacion/ClasificacionManualDetalle.tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import TarjetasCorredor from '../../components/corredor/TarjetasCorredor'
import '../../components/corredor/DetalleCorredor.css'
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
      <Container fluid as="main" className="detalle-corredor">
        <div className="detalle-corredor__no-encontrado">
          <h1>Corredor no encontrado</h1>
          <Button
            type="button"
            variant="link"
            className="detalle-corredor__volver"
            onClick={volverATiempoReal}
          >
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
    <Container fluid as="main" className="detalle-corredor">
      {/* ENCABEZADO */}
      <header className="detalle-corredor__encabezado">
        <h1>Detalle de Corredor</h1>

        <Button
          type="button"
          variant="link"
          className="detalle-corredor__volver"
          onClick={volverATiempoReal}
        >
          ← Volver a clasificación en tiempo real
        </Button>
      </header>

      <Row className="detalle-corredor__contenido g-3">
        {/* COLUMNA IZQUIERDA */}
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

        {/* COLUMNA DERECHA */}
        <Col xs={12} md={7} lg={8} xl={9}>
          <Card className="detalle-corredor__kit">
            <div
              className={`detalle-corredor__kit-header ${habilitado ? 'habilitado' : 'no-habilitado'}`}
            >
              {habilitado ? (
                <>
                  <CircleCheck size={15} />
                  HABILITADO PARA CLASIFICAR
                </>
              ) : (
                <>NO HABILITADO PARA CLASIFICAR</>
              )}
            </div>

            <Card.Body className="detalle-corredor__kit-contenido">
              <span className="detalle-corredor__kit-titulo">DATOS DE LA CLASIFICACIÓN</span>

              <div className="detalle-corredor__kit-datos">
                <div className="detalle-corredor__kit-dato">
                  <Form.Label>DORSAL</Form.Label>
                  <strong className="detalle-corredor__valor-grande">{corredor.dorsal}</strong>
                </div>

                <div className="detalle-corredor__kit-dato">
                  <Form.Label>CHIP RFID</Form.Label>
                  <strong className="detalle-corredor__chip">{corredor.chipRfid}</strong>
                </div>

                <div className="detalle-corredor__kit-dato detalle-corredor__kit-dato--editable">
                  <Form.Label htmlFor="puesto-general">Puesto General</Form.Label>

                  <Form.Control
                    id="puesto-general"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    className="detalle-corredor__puesto"
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
                    <div className="text-danger small mt-1">
                      {validacionPuesto.errores.puesto}
                    </div>
                  )}
                </div>
              </div>

              {guardado && (
                <div className="detalle-corredor__confirmacion" role="status">
                  <CircleCheck size={17} />
                  Clasificación simulada correctamente para el dorsal {corredor.dorsal} en el puesto{' '}
                  {puestoNumero}.
                </div>
              )}

              <Button
                type="button"
                variant="success"
                className="detalle-corredor__entregar"
                disabled={!puedeGuardar}
                onClick={guardarClasificacion}
              >
                {guardado ? 'Clasificación guardada' : 'Guardar clasificación'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ClasificacionManualDetalle