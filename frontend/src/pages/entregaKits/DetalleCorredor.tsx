//frontend/src/pages/entregaKits/DetalleCorredor.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { PackageCheck, Info, CircleCheck } from 'lucide-react'
import { Alert, Container, Row, Col, Card, Form, Button, InputGroup, Spinner} from 'react-bootstrap'
import TarjetasCorredor from '../../components/corredor/TarjetasCorredor'
import { useCarreraActual } from '../../hooks/useCarreraActual'
import { ApiError } from '../../services/apiService'
import { buscarCorredorPorDni, registrarEntregaKit,} from '../../services/entregaKitService'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CorredorEntregaKitDTO } from '../../types/entregaKits'
import { dorsalSchema } from '../../schemas/kitSchema'
import type { DorsalForm } from '../../schemas/kitSchema'

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
  const carreraSeleccionada = useCarreraActual()
  const [corredor, setCorredor] = useState<CorredorEntregaKitDTO | null>(null)
  const [cargando, setCargando] = useState(true)
  const [entregando, setEntregando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entregaConfirmada, setEntregaConfirmada] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DorsalForm>({
    resolver: zodResolver(dorsalSchema),
    mode: 'onChange',
    defaultValues: { dorsal: '' },
  })

  const dorsalRegistro = register('dorsal')

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

  const puedeEntregar =
    Boolean(corredor?.habilitadoParaRetirarKit) && isValid && !entregando

  async function entregarKit(datos: DorsalForm) {
    if (!corredor || !puedeEntregar) return

    setEntregando(true)
    setError(null)

    try {
      const entrega = await registrarEntregaKit(
        corredor.inscripcionId,
        datos.dorsal
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
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Buscando corredor...</p>
        </div>
      </Container>
    )
  }

  if (error && !corredor) {
    return (
      <Container fluid as="main" className="p-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-success" size="sm" onClick={volverAlBuscador}>
          {textoVolver}
        </Button>
      </Container>
    )
  }

  if (!corredor) {
    return (
      <Container fluid as="main" className="p-4">
        <div className="d-flex flex-column align-items-start gap-3">
          <h1 className="h3 fw-bold">Corredor no encontrado</h1>
          <Button type="button" variant="outline-success" size="sm" onClick={volverAlBuscador}>
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
    <Container fluid as="main" className="p-4">
      <header className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Detalle de Corredor</h1>
          <p className="small text-secondary mb-0">Verificando datos para entrega de material.</p>
        </div>

        <Button
          type="button"
          variant="outline-success"
          size="sm"
          className="align-self-end align-self-md-start text-nowrap"
          onClick={volverAlBuscador}
        >
          {textoVolver}
        </Button>
      </header>

      <Row className="g-3">
        <Col xs={12} md={5} lg={4} xl={3}>
          <TarjetasCorredor
            nombre={nombreCompleto}
            dni={corredor.corredor.dni}
            categoria="—"
            distancia={`${corredor.distancia.kilometraje}K`}
            talleRemera={corredor.talleRemera ?? undefined}
            clubTeam={corredor.equipo?.nombre ?? undefined}
            estadoInscripcion={corredor.inscripcion.pagada ? 'pagado' : 'pendiente'}
            estadoAptoMedico={estadoAptoMedico}
          />
        </Col>

        <Col xs={12} md={7} lg={8} xl={9}>
          <Card className="h-100 shadow-sm overflow-hidden">
            <Card.Header
              className={`d-flex align-items-center justify-content-center gap-2 fw-bold text-center ${
                corredor.habilitadoParaRetirarKit ? 'bg-success text-white' : 'bg-warning text-dark'
              }`}
            >
              {corredor.habilitadoParaRetirarKit ? (
                <>
                  <CircleCheck size={15} />
                  HABILITADO PARA RETIRAR KIT
                </>
              ) : (
                'NO HABILITADO PARA RETIRAR KIT'
              )}
            </Card.Header>

            <Card.Body
              as="form"
              onSubmit={handleSubmit(entregarKit)}
              noValidate
              className="d-flex flex-column p-4"
            >
              <Card.Subtitle className="text-center text-secondary small fw-semibold mb-3">
                DATOS DEL KIT ASIGNADO
              </Card.Subtitle>

              {corredor.entregaKit ? (
                <Alert variant="success" className="d-flex align-items-start gap-2 mb-0" role="status">
                  <CircleCheck size={17} className="flex-shrink-0 mt-1" />
                  <span>
                    Kit entregado. Dorsal #{corredor.entregaKit.dorsal.numero}
                    {corredor.entregaKit.dorsal.chip && <> · Chip #{corredor.entregaKit.dorsal.chip.numero}</>}
                  </span>
                </Alert>
              ) : (
                <>
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <div className="h-100 border rounded bg-body-tertiary p-3 d-flex flex-column align-items-center justify-content-center">
                        <Form.Label htmlFor="dorsal" className="small fw-medium text-secondary">
                          DORSAL A ASIGNAR
                        </Form.Label>

                        <InputGroup size="lg">
                          <InputGroup.Text aria-hidden="true">#</InputGroup.Text>
                          <Form.Control
                            id="dorsal"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            {...dorsalRegistro}
                            onChange={(event) => {
                              event.target.value = event.target.value.replace(/\D/g, '')
                              void dorsalRegistro.onChange(event)
                              setEntregaConfirmada(false)
                            }}
                            placeholder="125"
                            disabled={!corredor.habilitadoParaRetirarKit}
                            readOnly={entregando}
                            isInvalid={!!errors.dorsal}
                            aria-label="Número de dorsal a asignar"
                            className="fw-bold"
                          />
                        </InputGroup>

                        {errors.dorsal && (
                          <div className="text-danger small mt-1">{errors.dorsal.message}</div>
                        )}
                      </div>
                    </Col>

                    <Col xs={12} sm={6}>
                      <div className="h-100 border rounded bg-body-tertiary p-3 d-flex flex-column align-items-center justify-content-center">
                        <Form.Label className="small fw-medium text-secondary">CHIP RFID</Form.Label>
                        <strong className="fs-3">—</strong>
                      </div>
                    </Col>
                  </Row>

                  <Alert variant="info" className="d-flex align-items-start gap-2 mt-3 mb-0 small">
                    <Info size={19} className="flex-shrink-0" />
                    <p className="mb-0">
                      Verifique que el número de dorsal físico coincida con el ingresado. El sistema
                      registrará la fecha y hora de la entrega.
                    </p>
                  </Alert>
                </>
              )}

              {!corredor.habilitadoParaRetirarKit && corredor.motivosNoHabilitado.length > 0 && (
                <Alert variant="warning" className="mt-3 mb-0">
                  <ul className="mb-0 ps-3">
                    {corredor.motivosNoHabilitado.map((motivo) => (
                      <li key={motivo}>{motivo}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mt-3 mb-0" role="alert">
                  {error}
                </Alert>
              )}

              <div className="text-center mt-auto pt-4">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="d-inline-flex align-items-center gap-2 rounded-pill px-4"
                  disabled={!puedeEntregar}
                >
                  <PackageCheck size={17} />
                  {entregando ? 'Registrando entrega...' : entregaConfirmada ? 'Kit entregado' : 'Entregar kit'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default DetalleCorredor
