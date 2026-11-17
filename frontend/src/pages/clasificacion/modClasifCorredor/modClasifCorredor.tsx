//frontend/src/pages/clasificacion/modClasifCorredor/modClasifCorredor.tsx
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from 'react-bootstrap'
import { Clock, Lock, Pencil, Save, User } from 'lucide-react'

import { useRutasClasificacion } from '../../../hooks/useRutasClasificacion'
import { useCarreraActual } from '../../../hooks/useCarreraActual'
import {
  obtenerClasificaciones,
  registrarResultadoClasificacion,
  type ClasificacionDTO,
} from '../../../services/clasificacionService'
import { resultadoClasificacionSchema } from '../../../schemas/clasificacionSchema'
import { validar, type ErroresFormulario } from '../../../utils/validar'

const tiempoAMilisegundos = (tiempo: string): number | null => {
  const coincidencia = tiempo.match(/^(\d{2,}):([0-5]\d):([0-5]\d)\.(\d{3})$/)

  if (!coincidencia) return null

  const [, horas, minutos, segundos, milisegundos] = coincidencia

  return (
    Number(horas) * 3600000 +
    Number(minutos) * 60000 +
    Number(segundos) * 1000 +
    Number(milisegundos)
  )
}

const milisegundosATiempo = (valor: number | null): string => {
  if (valor === null) return ''

  const horas = Math.floor(valor / 3600000)
  const minutos = Math.floor((valor % 3600000) / 60000)
  const segundos = Math.floor((valor % 60000) / 1000)
  const milisegundos = valor % 1000

  return [
    String(horas).padStart(2, '0'),
    String(minutos).padStart(2, '0'),
    `${String(segundos).padStart(2, '0')}.${String(milisegundos).padStart(3, '0')}`,
  ].join(':')
}

const CampoBloqueado: React.FC<{
  id: string
  etiqueta: string
  valor: string
}> = ({ id, etiqueta, valor }) => (
  <Form.Group controlId={id}>
    <Form.Label className="small fw-semibold text-secondary">
      {etiqueta}
    </Form.Label>
    <Form.Control type="text" value={valor} disabled readOnly />
  </Form.Group>
)

const ModClasifCorredor: React.FC = () => {
  const { id, corredorId } = useParams()
  const llegadaId = corredorId ?? id

  return <FormularioModificacion key={llegadaId} id={llegadaId} />
}

const FormularioModificacion: React.FC<{ id?: string }> = ({ id }) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const rutas = useRutasClasificacion()
  const carrera = useCarreraActual()

  const [clasificacion, setClasificacion] = useState<ClasificacionDTO | null>(null)
  const [tiempoOficial, setTiempoOficial] = useState('')
  const [puestoGeneral, setPuestoGeneral] = useState('')
  const [errores, setErrores] = useState<ErroresFormulario>({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!carrera?.id || !id) {
      setCargando(false)
      setError('No se pudo identificar la carrera o la clasificación.')
      return
    }

    let activo = true

    const cargarClasificacion = async () => {
      try {
        setCargando(true)
        setError('')

        const clasificaciones = await obtenerClasificaciones(carrera.id)
        const encontrada = clasificaciones.find((item) => item.id === id)

        if (!encontrada) {
          throw new Error('No se encontró la clasificación solicitada.')
        }

        if (!activo) return

        setClasificacion(encontrada)
        setTiempoOficial(
          milisegundosATiempo(encontrada.resultado?.tiempoLlegada ?? null)
        )
        setPuestoGeneral(
          encontrada.resultado?.puestoGeneral
            ? String(encontrada.resultado.puestoGeneral)
            : ''
        )
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la clasificación.'
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarClasificacion()

    return () => {
      activo = false
    }
  }, [carrera?.id, id])

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!clasificacion) return

    const validacion = validar(resultadoClasificacionSchema, {
      tiempoOficial,
      puestoGeneral,
    })

    if (!validacion.ok) {
      setErrores(validacion.errores)
      return
    }

    const tiempoEnMs = tiempoAMilisegundos(tiempoOficial)

    if (tiempoEnMs === null) {
      setErrores({
        tiempoOficial: 'Ingresá un tiempo con formato HH:MM:SS.mmm.',
      })
      return
    }

    try {
      setGuardando(true)
      setError('')

      await registrarResultadoClasificacion(clasificacion.id, {
        puestoGeneral: Number(puestoGeneral),
        tiempoLlegada: tiempoEnMs,
      })

      navigate(rutas.trasGuardar(search), { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la modificación.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleCancelar = () => {
    navigate(rutas.listado, { replace: true })
  }

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="text-secondary mt-3">Cargando clasificación...</p>
      </Container>
    )
  }

  if (!clasificacion) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error || 'No se encontró la clasificación.'}
        </Alert>
        <Button variant="outline-secondary" onClick={handleCancelar}>
          Volver
        </Button>
      </Container>
    )
  }

  const corredor = clasificacion.corredor
  const categoria =
    clasificacion.resultado?.categorias
      .map((item) => item.nombre)
      .join(', ') || 'Sin categoría asignada'

  return (
    <Container as="main" className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          <header className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1">
                Modificar Clasificación del corredor
              </h1>
              <p className="small text-secondary mb-0">
                ID Registro: {clasificacion.id}
              </p>
            </div>

            <div className="d-flex gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={handleCancelar}
                disabled={guardando}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                form="form-clasificacion"
                variant="success"
                className="d-inline-flex align-items-center gap-2"
                disabled={guardando}
              >
                {guardando ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <Save size={16} aria-hidden="true" />
                )}
                {guardando ? 'Guardando...' : 'Guardar modificación'}
              </Button>
            </div>
          </header>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form
            id="form-clasificacion"
            onSubmit={handleGuardar}
            noValidate
          >
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
                  <User size={18} aria-hidden="true" />
                  Información del Corredor
                </h2>

                <Badge
                  bg="secondary-subtle"
                  text="secondary-emphasis"
                  className="d-inline-flex align-items-center gap-1"
                >
                  <Lock size={12} aria-hidden="true" />
                  Datos de Inscripción
                </Badge>
              </Card.Header>

              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <CampoBloqueado
                      id="infoNombre"
                      etiqueta="Nombre y apellido"
                      valor={`${corredor.nombre} ${corredor.apellido}`}
                    />
                  </Col>

                  <Col md={4}>
                    <CampoBloqueado
                      id="infoDni"
                      etiqueta="DNI"
                      valor={corredor.dni}
                    />
                  </Col>

                  <Col md={4}>
                    <CampoBloqueado
                      id="infoSexo"
                      etiqueta="Sexo"
                      valor={corredor.sexo}
                    />
                  </Col>

                  <Col md={4}>
                    <CampoBloqueado
                      id="infoDorsal"
                      etiqueta="Dorsal"
                      valor={clasificacion.dorsal ?? 'Sin dorsal'}
                    />
                  </Col>

                  <Col md={4}>
                    <CampoBloqueado
                      id="infoEquipo"
                      etiqueta="Equipo"
                      valor={clasificacion.equipo ?? 'Sin equipo'}
                    />
                  </Col>

                  <Col md={4}>
                    <CampoBloqueado
                      id="infoDistancia"
                      etiqueta="Distancia"
                      valor={`${clasificacion.distancia.kilometraje} km`}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-start border-success border-4">
              <Card.Body>
                <h2 className="h6 fw-bold d-flex align-items-center gap-2 mb-1">
                  <Pencil
                    size={18}
                    className="text-success"
                    aria-hidden="true"
                  />
                  Datos de Clasificación
                </h2>

                <p className="small text-secondary">
                  Modificá los resultados oficiales de carrera.
                </p>

                <div className="bg-body-tertiary border rounded p-3">
                  <Row className="g-3">
                    <Col md={4}>
                      <CampoBloqueado
                        id="tipoClasificacion"
                        etiqueta="Tipo de clasificación"
                        valor="General"
                      />
                    </Col>

                    <Col md={4}>
                      <CampoBloqueado
                        id="categoria"
                        etiqueta="Categoría"
                        valor={categoria}
                      />
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="puestoGeneral">
                        <Form.Label className="small fw-semibold text-secondary">
                          Puesto General
                        </Form.Label>

                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          value={puestoGeneral}
                          isInvalid={!!errores.puestoGeneral}
                          onChange={(e) => {
                            setPuestoGeneral(e.target.value)
                            setErrores({})
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errores.puestoGeneral}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="tiempoOficial">
                        <Form.Label className="small fw-semibold text-secondary">
                          Tiempo Oficial
                        </Form.Label>

                        <InputGroup hasValidation>
                          <Form.Control
                            type="text"
                            value={tiempoOficial}
                            placeholder="HH:MM:SS.mmm"
                            isInvalid={!!errores.tiempoOficial}
                            onChange={(e) => {
                              setTiempoOficial(e.target.value)
                              setErrores({})
                            }}
                          />

                          <InputGroup.Text>
                            <Clock size={16} aria-hidden="true" />
                          </InputGroup.Text>

                          <Form.Control.Feedback type="invalid">
                            {errores.tiempoOficial}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default ModClasifCorredor
