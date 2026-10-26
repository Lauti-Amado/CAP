import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PackageCheck, Info, CircleCheck } from 'lucide-react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import TarjetasCorredor from '../../components/corredor/TarjetasCorredor'
import '../../components/corredor/DetalleCorredor.css'

// MOCK TEMPORAL
// Reemplazar por GET /api/corredores/{dni} al conectar el backend.
import { corredoresMock } from './entregaKitsMock'

function DetalleCorredor() {
  const { dni } = useParams<{ dni: string }>()
  const navigate = useNavigate()
  const [dorsal, setDorsal] = useState('')
  const [entregaConfirmada, setEntregaConfirmada] = useState(false)

  const corredor = corredoresMock.find(
    (corredor) => corredor.dni === dni
  )

  if (!corredor) {
    return (
      <Container fluid as="main" className="detalle-corredor">
        <div className="detalle-corredor__no-encontrado">
          <h1>Corredor no encontrado</h1>
          <Button
            type="button"
            variant="link"
            className="detalle-corredor__volver"
            onClick={() => navigate('/entrega-kits')}
          >
            ← Volver al buscador
          </Button>
        </div>
      </Container>
    )
  }

  const puedeEntregar =
    corredor.habilitadoParaRetirarKit &&
    /^\d+$/.test(dorsal.trim()) &&
    Number(dorsal) > 0 &&
    !entregaConfirmada

  const entregarKit = () => {
    if (!puedeEntregar) return

    // MOCK TEMPORAL:
    // Simula la confirmación visual de la entrega.
    // TODO BACKEND: registrar la entrega y su fecha/hora.
    console.log('Entregar kit', {
      dni: corredor.dni,
      dorsal: dorsal.trim(),
    })

    setEntregaConfirmada(true)
  }

  return (
    <Container fluid as="main" className="detalle-corredor">
      {/* ENCABEZADO */}
      <header className="detalle-corredor__encabezado">
        <div>
          <h1>Detalle de Corredor</h1>
          <p>Verificando datos para entrega de material.</p>
        </div>

        <Button
          type="button"
          variant="link"
          className="detalle-corredor__volver"
          onClick={() => navigate('/entrega-kits')}
        >
          ← Volver al buscador
        </Button>
      </header>

      {/* CONTENIDO */}
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
            estadoInscripcion={corredor.inscripcion.estado}
            estadoAptoMedico={corredor.aptoMedico?.estado}
          />
        </Col>

        {/* COLUMNA DERECHA */}
        <Col xs={12} md={7} lg={8} xl={9}>
          <Card className="detalle-corredor__kit">
            <div
              className={`detalle-corredor__kit-header ${
                corredor.habilitadoParaRetirarKit
                  ? 'habilitado'
                  : 'no-habilitado'
              }`}
            >
              {corredor.habilitadoParaRetirarKit ? (
                <>
                  <CircleCheck size={15} />
                  HABILITADO PARA RETIRAR KIT
                </>
              ) : (
                <>NO HABILITADO PARA RETIRAR KIT</>
              )}
            </div>

            <Card.Body className="detalle-corredor__kit-contenido">
              <span className="detalle-corredor__kit-titulo">
                DATOS DEL KIT ASIGNADO
              </span>

              <div className="detalle-corredor__kit-datos">
                {/* DORSAL */}
                <div className="detalle-corredor__kit-dato">
                  <Form.Label htmlFor="dorsal">
                    DORSAL A ASIGNAR
                  </Form.Label>

                  <div className="detalle-corredor__dorsal">
                    <span aria-hidden="true">#</span>

                    <Form.Control
                      id="dorsal"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={dorsal}
                      onChange={(event) => {
                        setDorsal(
                          event.target.value.replace(/\D/g, '')
                        )
                        setEntregaConfirmada(false)
                      }}
                      placeholder="125"
                      disabled={
                        !corredor.habilitadoParaRetirarKit ||
                        entregaConfirmada
                      }
                      aria-label="Número de dorsal a asignar"
                      className="detalle-corredor__dorsal-input"
                    />
                  </div>
                </div>

                {/* CHIP RFID */}
                <div className="detalle-corredor__kit-dato">
                  <Form.Label>CHIP RFID</Form.Label>
                  <strong className="detalle-corredor__chip">
                    —
                  </strong>
                  {/*
                    TODO: obtener el chip RFID correspondiente
                    al dorsal desde el backend.
                  */}
                </div>
              </div>

              {/* AVISO */}
              <div className="detalle-corredor__aviso">
                <Info size={19} />

                <p>
                  Asegúrese de verificar que el número de dorsal
                  físico coincida con el número mostrado en pantalla
                  antes de confirmar la entrega. El sistema registrará
                  la fecha y hora exacta de esta acción.
                </p>
              </div>

              {entregaConfirmada && (
                <div
                  className="detalle-corredor__confirmacion"
                  role="status"
                >
                  <CircleCheck size={17} />
                  Entrega simulada correctamente para el dorsal #
                  {dorsal}.
                </div>
              )}

              {/* ENTREGAR KIT */}
              <Button
                type="button"
                variant="success"
                className="detalle-corredor__entregar"
                disabled={!puedeEntregar}
                onClick={entregarKit}
              >
                <PackageCheck size={17} />
                {entregaConfirmada ? 'Kit entregado' : 'Entregar kit'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleCorredor
