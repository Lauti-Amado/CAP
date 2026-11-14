//frontend/src/pages/entregaKits/DetalleCorredor.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { PackageCheck, Info, CircleCheck } from 'lucide-react'
import { Container, Row, Col, Card, Form, Button, Spinner,} from 'react-bootstrap'

import TarjetasCorredor from '../../components/corredor/TarjetasCorredor'
import '../../components/corredor/DetalleCorredor.css'

import { useSeleccionarCarrera } from '../../context/SeleccionarCarreraContext'
import { ApiError } from '../../services/apiService'
import { buscarCorredorPorDni, registrarEntregaKit,} from '../../services/entregaKitService'

import type { CorredorEntregaKitDTO } from '../../types/entregaKits'

import { dorsalSchema } from '../../schemas/kitSchema'
import { validar } from '../../utils/validar'

function DetalleCorredor() {
  const { dni, nombreCarrera } = useParams<{
    dni: string
    nombreCarrera: string
  }>()

  const navigate = useNavigate()
  const location = useLocation()
  const vieneDeInscripciones =
    (location.state as { desde?: string } | null)?.desde === 'inscripciones'
  const textoVolver = vieneDeInscripciones
    ? '← Volver a inscripciones'
    : '← Volver al buscador'
  const { carreraSeleccionada } = useSeleccionarCarrera()

  const [corredor, setCorredor] = useState<CorredorEntregaKitDTO | null>(null)
  const [dorsal, setDorsal] = useState('')
  const [cargando, setCargando] = useState(true)
  const [entregando, setEntregando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entregaConfirmada, setEntregaConfirmada] = useState(false)

  useEffect(() => {
    if (!dni || !carreraSeleccionada) return

    let cancelado = false

    async function cargarCorredor() {
      setCargando(true)
      setError(null)

      try {
        const resultado = await buscarCorredorPorDni(
          carreraSeleccionada!.id,
          dni!
        )

        if (!cancelado) {
          setCorredor(resultado)
        }
      } catch (error) {
        if (cancelado) return

        if (error instanceof ApiError && error.status === 404) {
          setCorredor(null)
        } else {
          console.error('Error al consultar el corredor:', error)
          setError('No se pudieron cargar los datos del corredor.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    void cargarCorredor()

    return () => {
      cancelado = true
    }
  }, [dni, carreraSeleccionada])

    const volverAlBuscador = () => {
      navigate(
        vieneDeInscripciones
          ? `/clasificador/entrega-kits/${nombreCarrera}/inscripciones`
          : `/clasificador/entrega-kits/${nombreCarrera}`
      )
    }

  const validacionDorsal = validar(dorsalSchema, { dorsal })

  const puedeEntregar =
    Boolean(corredor?.habilitadoParaRetirarKit) &&
    validacionDorsal.ok &&
    !entregando

  async function entregarKit() {
    if (!corredor || !puedeEntregar) return

    setEntregando(true)
    setError(null)

    try {
      const entrega = await registrarEntregaKit(
        corredor.inscripcionId,
        dorsal.trim()
      )

      setCorredor((actual) =>
        actual
          ? {
              ...actual,
              habilitadoParaRetirarKit: false,
              inscripcion: {
                ...actual.inscripcion,
                estado: 'Confirmada',
              },
              entregaKit: entrega,
            }
          : actual
      )

      setEntregaConfirmada(true)
    } catch (error) {
      console.error('Error al registrar la entrega:', error)

      setError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo registrar la entrega del kit.'
      )
    } finally {
      setEntregando(false)
    }
  }

  if (cargando) {
    return (
      <Container fluid className="detalle-corredor">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Buscando corredor...</p>
        </div>
      </Container>
    )
  }

  if (error && !corredor) {
    return (
      <Container fluid className="detalle-corredor">
        <p className="buscar-corredor__error">{error}</p>
        <Button variant="link" onClick={volverAlBuscador}>
          {textoVolver}
        </Button>
      </Container>
    )
  }

  if (!corredor) {
    return (
      <Container fluid as="main" className="detalle-corredor">
        <div className="detalle-corredor__no-encontrado">
          <h1>Corredor no encontrado</h1>
          <Button
            type="button"
            variant="link"
            className="detalle-corredor__volver"
            onClick={volverAlBuscador}
          >
            {textoVolver}
          </Button>
        </div>
      </Container>
    )
  }

  const nombreCompleto =
    `${corredor.corredor.nombre} ${corredor.corredor.apellido}`

  const estadoAptoMedico =
    corredor.aptoMedico?.aprobado ? 'verificado' : 'pendiente'

  return (
    <Container fluid as="main" className="detalle-corredor">
      <header className="detalle-corredor__encabezado">
        <div>
          <h1>Detalle de Corredor</h1>
          <p>Verificando datos para entrega de material.</p>
        </div>

        <Button
          type="button"
          variant="link"
          className="detalle-corredor__volver"
          onClick={volverAlBuscador}
        >
          {textoVolver}
        </Button>
      </header>

      <Row className="detalle-corredor__contenido g-3">
        <Col xs={12} md={5} lg={4} xl={3}>
          <TarjetasCorredor
            nombre={nombreCompleto}
            dni={corredor.corredor.dni}
            categoria="—"
            distancia={`${corredor.distancia.kilometraje}K`}
            talleRemera={corredor.talleRemera ?? undefined}
            clubTeam={corredor.equipo?.nombre ?? undefined}
            estadoInscripcion={
              corredor.inscripcion.pagada ? 'pagado' : 'pendiente'
            }
            estadoAptoMedico={estadoAptoMedico}
          />
        </Col>

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

              {corredor.entregaKit ? (
                <div className="detalle-corredor__confirmacion">
                  <CircleCheck size={17} />
                  Kit entregado. Dorsal #{corredor.entregaKit.dorsal.numero}
                  {corredor.entregaKit.dorsal.chip && (
                    <> · Chip #{corredor.entregaKit.dorsal.chip.numero}</>
                  )}
                </div>
              ) : (
                <>
                  <div className="detalle-corredor__kit-datos">
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
                            setDorsal(event.target.value.replace(/\D/g, ''))
                            setEntregaConfirmada(false)
                          }}
                          placeholder="125"
                          disabled={
                            !corredor.habilitadoParaRetirarKit || entregando
                          }
                          aria-label="Número de dorsal a asignar"
                          className="detalle-corredor__dorsal-input"
                        />
                      </div>
                      {dorsal !== '' && !validacionDorsal.ok && (
                        <div className="text-danger small mt-1">
                          {validacionDorsal.errores.dorsal}
                        </div>
                      )}
                    </div>

                    <div className="detalle-corredor__kit-dato">
                      <Form.Label>CHIP RFID</Form.Label>
                      <strong className="detalle-corredor__chip">—</strong>
                    </div>
                  </div>

                  <div className="detalle-corredor__aviso">
                    <Info size={19} />
                    <p>
                      Verifique que el número de dorsal físico coincida con
                      el ingresado. El sistema registrará la fecha y hora
                      de la entrega.
                    </p>
                  </div>
                </>
              )}

              {!corredor.habilitadoParaRetirarKit &&
                corredor.motivosNoHabilitado.length > 0 && (
                  <ul>
                    {corredor.motivosNoHabilitado.map((motivo) => (
                      <li key={motivo}>{motivo}</li>
                    ))}
                  </ul>
                )}

              {error && (
                <p className="buscar-corredor__error" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="button"
                variant="success"
                className="detalle-corredor__entregar"
                disabled={!puedeEntregar}
                onClick={() => void entregarKit()}
              >
                <PackageCheck size={17} />
                {entregando
                  ? 'Registrando entrega...'
                  : entregaConfirmada
                    ? 'Kit entregado'
                    : 'Entregar kit'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleCorredor
