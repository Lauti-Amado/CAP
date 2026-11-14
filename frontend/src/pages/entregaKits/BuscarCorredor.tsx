//frontend/src/pages/entregaKits/BuscarCorredor.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, PackageCheck, Flag } from 'lucide-react'
import { Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, Row, Spinner } from 'react-bootstrap'

import CorredorNoEncontrado from './CorredorNoEncontrado'
import { useSeleccionarCarrera } from '../../context/SeleccionarCarreraContext'
import { ApiError } from '../../services/apiService'
import { buscarCorredorPorDni, obtenerEntregasRecientes } from '../../services/entregaKitService'
import type { EntregaRecienteDTO } from '../../types/entregaKits'

import { dniBusquedaSchema } from '../../schemas/kitSchema'
import { validar } from '../../utils/validar'

function BuscarCorredor() {
  const [dni, setDni] = useState('')
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [errorEntregas, setErrorEntregas] = useState<string | null>(null)
  const [mostrarNoEncontrado, setMostrarNoEncontrado] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [cargandoEntregas, setCargandoEntregas] = useState(true)
  const [ultimasEntregas, setUltimasEntregas] = useState<EntregaRecienteDTO[]>([])

  const navigate = useNavigate()
  const { nombreCarrera } = useParams()
  const { carreraSeleccionada } = useSeleccionarCarrera()

  useEffect(() => {
    if (!carreraSeleccionada) return

    let cancelado = false

    async function cargarEntregas() {
      setCargandoEntregas(true)
      setErrorEntregas(null)

      try {
        const entregas = await obtenerEntregasRecientes(carreraSeleccionada!.id, 3)

        if (!cancelado) {
          setUltimasEntregas(entregas)
        }
      } catch (error) {
        console.error('Error al obtener las últimas entregas:', error)

        if (!cancelado) {
          setErrorEntregas('No se pudieron cargar las últimas entregas.')
        }
      } finally {
        if (!cancelado) {
          setCargandoEntregas(false)
        }
      }
    }

    void cargarEntregas()

    return () => {
      cancelado = true
    }
  }, [carreraSeleccionada])

  const buscarCorredor = async () => {
    const validacion = validar(dniBusquedaSchema, { dni })

    if (!validacion.ok) {
      setErrorBusqueda(validacion.errores.dni)
      return
    }

    const dniIngresado = validacion.datos.dni

    if (!carreraSeleccionada) {
      setErrorBusqueda('No hay una carrera seleccionada.')
      return
    }

    setErrorBusqueda(null)
    setMostrarNoEncontrado(false)
    setBuscando(true)

    try {
      await buscarCorredorPorDni(carreraSeleccionada.id, dniIngresado)

      navigate(`/clasificador/entrega-kits/${nombreCarrera}/${encodeURIComponent(dniIngresado)}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setMostrarNoEncontrado(true)
        return
      }

      console.error('Error al buscar el corredor:', error)
      setErrorBusqueda('No se pudo consultar el corredor. Intente nuevamente.')
    } finally {
      setBuscando(false)
    }
  }

  const distanciasUnicas = carreraSeleccionada
    ? [
        ...new Map(
          carreraSeleccionada.distancias.map((distancia) => [
            `${distancia.kilometraje}-${distancia.tipoDistancia}`,
            distancia,
          ]),
        ).values(),
      ]
    : []

  return (
    <Container fluid as="main" className="px-3 px-md-4 py-3 min-vh-100">
      {/* =========================
          CABECERA DE CARRERA
      ========================= */}
      <Card className="mb-4">
        <Card.Body className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="d-inline-flex p-2 rounded bg-success-subtle text-success">
              <Flag size={20} aria-hidden="true" />
            </span>

            {carreraSeleccionada && (
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <strong>{carreraSeleccionada.nombre}</strong>

                  <span className="small text-secondary">
                    {distanciasUnicas
                      .map((distancia) => `${distancia.kilometraje}K ${distancia.tipoDistancia}`)
                      .join(' / ')}
                  </span>

                  <Badge pill bg="success-subtle" text="success-emphasis">
                    ● {carreraSeleccionada.estado}
                  </Badge>
                </div>

                <small className="text-secondary">
                  {new Date(carreraSeleccionada.fechaHoraCarrera).toLocaleDateString('es-AR')}
                </small>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="success"
            className="fw-semibold text-nowrap"
            onClick={() => navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)}
          >
            Ingresar a lista de inscripciones
          </Button>
        </Card.Body>
      </Card>

      {/* =========================
          BUSCADOR
      ========================= */}
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={8} lg={6} xl={4}>
          <Card className="text-center">
            <Card.Body className="p-4">
              <span className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-2">
                <PackageCheck size={24} aria-hidden="true" />
              </span>

              <h1 className="h4 fw-bold">Buscar corredor</h1>

              <p className="text-secondary small mb-4">
                Ingrese el DNI del participante para asignar su kit de carrera.
              </p>

              <Form
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!buscando) {
                    void buscarCorredor()
                  }
                }}
              >
                <InputGroup hasValidation>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    value={dni}
                    onChange={(event) => {
                      setDni(event.target.value)
                      setErrorBusqueda(null)
                      setMostrarNoEncontrado(false)
                    }}
                    placeholder="Ej. 35123456"
                    aria-label="DNI del corredor"
                    isInvalid={Boolean(errorBusqueda)}
                    disabled={buscando}
                  />

                  <Button type="submit" variant="success" aria-label="Buscar corredor" disabled={buscando}>
                    {buscando ? <Spinner animation="border" size="sm" /> : <Search size={18} aria-hidden="true" />}
                  </Button>

                  <Form.Control.Feedback type="invalid" className="text-start">
                    {errorBusqueda}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>

          {mostrarNoEncontrado && (
            <CorredorNoEncontrado
              dni={dni}
              onInscribir={() => {
                navigate(
                  `/clasificador/entrega-kits/${nombreCarrera}/inscripciones/nueva?dni=${encodeURIComponent(dni.trim())}`,
                )
              }}
              onVolver={() => {
                setMostrarNoEncontrado(false)
                setDni('')
              }}
            />
          )}

          {/* =========================
              ÚLTIMAS ENTREGAS
          ========================= */}
          <section className="mt-4">
            <h2 className="small fw-semibold text-uppercase text-secondary mb-2">Últimas entregas</h2>

            {cargandoEntregas ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" variant="success" />
              </div>
            ) : errorEntregas ? (
              <p className="small text-danger">{errorEntregas}</p>
            ) : ultimasEntregas.length === 0 ? (
              <p className="small text-secondary">No hay entregas registradas todavía.</p>
            ) : (
              <ListGroup>
                {ultimasEntregas.map((entrega) => (
                  <ListGroup.Item
                    key={entrega.id}
                    className="d-flex align-items-center justify-content-between gap-2 small"
                  >
                    <strong>
                      {entrega.corredor.nombre} {entrega.corredor.apellido}
                    </strong>

                    <span className="text-secondary">
                      Kit #{entrega.dorsal.numero} · {entrega.distancia.kilometraje}K
                    </span>

                    <span className="text-secondary">
                      {new Date(entrega.fechaHoraEntrega).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </section>
        </Col>
      </Row>
    </Container>
  )
}

export default BuscarCorredor