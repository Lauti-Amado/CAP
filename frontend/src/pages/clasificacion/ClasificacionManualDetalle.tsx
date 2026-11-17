import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import TarjetasCorredor from '../../components/corredor/TarjetasCorredor'
import { useRutasClasificacion } from '../../hooks/useRutasClasificacion'
import { useCarreraActual } from '../../hooks/useCarreraActual'
import {
  obtenerClasificaciones,
  registrarResultadoClasificacion,
  type ClasificacionDTO,
} from '../../services/clasificacionService'
import { puestoManualSchema } from '../../schemas/clasificacionSchema'
import type { PuestoManualForm } from '../../schemas/clasificacionSchema'
import { ApiError } from '../../services/apiService'

function ClasificacionManualDetalle() {
  const { dni } = useParams<{ dni: string }>()
  const navigate = useNavigate()
  const rutas = useRutasClasificacion()
  const carrera = useCarreraActual()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<PuestoManualForm>({
    resolver: zodResolver(puestoManualSchema),
    mode: 'onChange',
    defaultValues: { puesto: '' },
  })

  const puestoRegistro = register('puesto')
  const puesto = watch('puesto')

  const [clasificacion, setClasificacion] = useState<ClasificacionDTO | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      if (!carrera || !dni) {
        setError('No se pudo identificar la carrera o el corredor.')
        setCargando(false)
        return
      }

      setCargando(true)
      setError(null)

      try {
        const dniBuscado = dni.replace(/\D/g, '')

        const clasificaciones = await obtenerClasificaciones(carrera.id, {
          busqueda: dniBuscado,
        })

        if (cancelado) return

        const encontrada = clasificaciones.find(
          (item) => item.corredor.dni.replace(/\D/g, '') === dniBuscado,
        )

        if (!encontrada) {
          setError('No se encontró una clasificación para ese corredor.')
          return
        }

        setClasificacion(encontrada)

        if (encontrada.resultado) {
          reset({ puesto: String(encontrada.resultado.puestoGeneral) })
        }
      } catch (e) {
        if (cancelado) return

        setError(
          e instanceof ApiError
            ? e.message
            : 'No se pudo cargar la información del corredor.',
        )
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    void cargar()

    return () => {
      cancelado = true
    }
  }, [carrera?.id, dni, reset])

  const volverATiempoReal = () => {
    navigate(rutas.listado, { replace: true })
  }

  if (cargando) {
    return (
      <Container fluid as="main" className="p-4">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      </Container>
    )
  }

  if (error && !clasificacion) {
    return (
      <Container fluid as="main" className="p-4">
        <div className="d-flex flex-column align-items-start gap-3">
          <Alert variant="danger">{error}</Alert>
          <Button variant="outline-success" onClick={volverATiempoReal}>
            ← Volver a clasificación
          </Button>
        </div>
      </Container>
    )
  }

  if (!clasificacion) {
    return (
      <Container fluid as="main" className="p-4">
        <div className="d-flex flex-column align-items-start gap-3">
          <Alert variant="danger">Corredor no encontrado.</Alert>
          <Button variant="outline-success" onClick={volverATiempoReal}>
            ← Volver a clasificación
          </Button>
        </div>
      </Container>
    )
  }

  const habilitado = clasificacion.estado !== 'Descalificado'
  const mostrarErrorPuesto = puesto !== '' && !!errors.puesto
  const puedeGuardar = habilitado && isValid && !guardando

  const guardarClasificacion = async ({ puesto: puestoIngresado }: PuestoManualForm) => {
    if (!puedeGuardar || !carrera) return

    setGuardando(true)
    setError(null)
    setMensaje(null)

    try {
      const datos =
        carrera.estado === 'Finalizada'
          ? { puestoGeneral: Number(puestoIngresado), tiempoLlegada: null }
          : { puestoGeneral: Number(puestoIngresado) }

      await registrarResultadoClasificacion(clasificacion.id, datos)

      setMensaje(
        `Clasificación guardada correctamente para el dorsal ${clasificacion.dorsal}.`,
      )

      // Al guardar vuelve directo a tiempo real
      navigate(rutas.listado, { replace: true })
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'No se pudo guardar la clasificación.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const categoria =
    clasificacion.resultado?.categorias.map((item) => item.nombre).join(', ') ||
    'Sin categoría asignada'

  return (
    <Container fluid as="main" className="p-4">
      <header className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">Detalle de Corredor</h1>

        <Button variant="outline-success" size="sm" onClick={volverATiempoReal}>
          ← Volver a clasificación
        </Button>
      </header>

      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Row className="g-3">
        <Col xs={12} md={5} lg={4} xl={3}>
          <TarjetasCorredor
            nombre={`${clasificacion.corredor.nombre} ${clasificacion.corredor.apellido}`}
            dni={clasificacion.corredor.dni}
            categoria={categoria}
            distancia={`${clasificacion.distancia.kilometraje} km`}
            clubTeam={clasificacion.equipo ?? undefined}
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

            <Card.Body
              as="form"
              onSubmit={handleSubmit(guardarClasificacion)}
              noValidate
              className="d-flex flex-column p-4"
            >
              <Card.Subtitle className="text-center text-secondary small fw-semibold mb-3">
                DATOS DE LA CLASIFICACIÓN
              </Card.Subtitle>

              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <div className="h-100 border rounded bg-body-tertiary p-3 d-flex flex-column align-items-center justify-content-center">
                    <Form.Label className="small fw-medium text-secondary">
                      DORSAL
                    </Form.Label>
                    <strong className="fs-2 text-success">
                      {clasificacion.dorsal ?? '—'}
                    </strong>
                  </div>
                </Col>

                <Col xs={12} sm={6}>
                  <div className="h-100 border rounded bg-body-tertiary p-3 d-flex flex-column align-items-center justify-content-center">
                    <Form.Label className="small fw-medium text-secondary">
                      EQUIPO
                    </Form.Label>
                    <strong className="fs-4">{clasificacion.equipo ?? '—'}</strong>
                  </div>
                </Col>

                <Col xs={12} sm={6}>
                  <div className="h-100 border border-primary-subtle rounded bg-primary-subtle p-3">
                    <Form.Label
                      htmlFor="puesto-general"
                      className="small fw-medium text-secondary"
                    >
                      Puesto General
                    </Form.Label>

                    <Form.Control
                      id="puesto-general"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      size="lg"
                      className="fw-bold"
                      {...puestoRegistro}
                      onChange={(event) => {
                        event.target.value = event.target.value.replace(/\D/g, '')
                        void puestoRegistro.onChange(event)
                      }}
                      placeholder="Ej. 42"
                      disabled={!habilitado || guardando}
                      isInvalid={mostrarErrorPuesto}
                    />

                    {mostrarErrorPuesto && (
                      <div className="text-danger small mt-1">
                        {errors.puesto?.message}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <div className="text-center mt-auto pt-4">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="rounded-pill px-4"
                  disabled={!puedeGuardar}
                >
                  {guardando ? 'Guardando...' : 'Guardar clasificación'}
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