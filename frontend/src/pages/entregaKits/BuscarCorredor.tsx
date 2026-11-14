//frontend/src/pages/entregaKits/BuscarCorredor.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, PackageCheck, Flag } from 'lucide-react'
import { Container, Card, Button, Form, Badge, Spinner } from 'react-bootstrap'

import CorredorNoEncontrado from './CorredorNoEncontrado'
import { useSeleccionarCarrera } from '../../context/SeleccionarCarreraContext'
import { ApiError } from '../../services/apiService'
import { buscarCorredorPorDni, obtenerEntregasRecientes,} from '../../services/entregaKitService'
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
  const [hoverInscripcionesBtn, setHoverInscripcionesBtn] = useState(false)
  const [hoverBuscarBtn, setHoverBuscarBtn] = useState(false)

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
        const entregas = await obtenerEntregasRecientes(
          carreraSeleccionada!.id,
          3
        )

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

      navigate(
        `/clasificador/entrega-kits/${nombreCarrera}/${encodeURIComponent(dniIngresado)}`
      )
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

  return (
    <Container
      fluid
      as="main"
      className="px-3 px-md-4 py-3"
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* =========================
          CABECERA DE CARRERA
      ========================= */}
      <Card
        className="border shadow-none mb-4"
        style={{
          minHeight: '78px',
          padding: '14px 16px',
          backgroundColor: '#ffffff',
          borderColor: '#dce1de',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#e7f7ed',
                color: '#087f3f',
              }}
            >
              <Flag size={20} />
            </div>

            <div className="flex-grow-1 min-w-0">
              {carreraSeleccionada && (
                <>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#172033' }}>
                      {carreraSeleccionada.nombre}
                    </span>

                    <span style={{ color: '#59635e', fontSize: '12px' }}>
                      {[...new Map(
                        carreraSeleccionada.distancias.map((distancia) => [
                          `${distancia.kilometraje}-${distancia.tipoDistancia}`,
                          distancia,
                        ])
                      ).values()]
                        .map((distancia) =>
                          `${distancia.kilometraje}K ${distancia.tipoDistancia}`
                        )
                        .join(' / ')}
                    </span>

                    <Badge
                      pill
                      bg="success"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#d1fae5',
                        color: '#087f3f',
                        fontSize: '9px',
                        fontWeight: 600,
                        border: 'none',
                      }}
                    >
                      <span className="me-1">●</span> {carreraSeleccionada.estado}
                    </Badge>
                  </div>

                  <small style={{ color: '#68736d', fontSize: '11px' }}>
                    {new Date(carreraSeleccionada.fechaHoraCarrera).toLocaleDateString('es-AR')}
                  </small>
                </>
              )}
            </div>
          </div>

          <Button
            type="button"
            className="border-0 fw-bold text-white flex-shrink-0"
            onClick={() =>
              navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)
            }
            onMouseEnter={() => setHoverInscripcionesBtn(true)}
            onMouseLeave={() => setHoverInscripcionesBtn(false)}
            style={{
              padding: '10px 16px',
              borderRadius: '7px',
              backgroundColor: hoverInscripcionesBtn ? '#066b35' : '#087f3f',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s ease-in-out',
            }}
          >
            Ingresar a lista de inscripciones
          </Button>
        </div>
      </Card>

      {/* =========================
          CONTENIDO: BUSCADOR
      ========================= */}
      <Card
        className="border shadow-none text-center mx-auto"
        style={{
          width: '100%',
          maxWidth: '416px',
          marginTop: '42px',
          padding: '26px 28px',
          backgroundColor: '#ffffff',
          borderColor: '#dce1de',
          borderRadius: '8px',
          boxShadow: '0 2px 7px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-2"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#e7f7ed',
            color: '#087f3f',
          }}
        >
          <PackageCheck size={24} />
        </div>

        <h1
          style={{
            margin: '8px 0 0',
            fontSize: '23px',
            lineHeight: 1.3,
            fontWeight: 700,
            color: '#172033',
          }}
        >
          Buscar corredor
        </h1>

        <p
          style={{
            margin: '8px 0 21px',
            fontSize: '10px',
            lineHeight: 1.5,
            color: '#59635e',
          }}
        >
          Ingrese el DNI del participante para asignar su kit de carrera.
        </p>

        <Form
          onSubmit={(event) => {
            event.preventDefault()
            if (!buscando) {
              void buscarCorredor()
            }
          }}
          style={{
            width: '100%',
            height: '46px',
            display: 'flex',
            border: '1px solid #00a651',
            borderRadius: '7px',
            overflow: 'hidden',
          }}
        >
          <Form.Control
            type="text"
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
            style={{
              height: '100%',
              padding: '0 13px',
              border: 'none',
              borderRadius: 0,
              boxShadow: 'none',
              fontSize: '11px',
              color: '#172033',
            }}
          />

          <Button
            type="submit"
            aria-label="Buscar corredor"
            disabled={buscando}
            onMouseEnter={() => setHoverBuscarBtn(true)}
            onMouseLeave={() => setHoverBuscarBtn(false)}
            style={{
              width: '52px',
              height: '100%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: 'none',
              borderRadius: 0,
              backgroundColor: hoverBuscarBtn ? '#066b35' : '#087f3f',
              color: '#ffffff',
              transition: 'background-color 0.15s ease-in-out',
            }}
          >
            {buscando ? <Spinner animation="border" size="sm" /> : <Search size={18} />}
          </Button>
        </Form>

        {errorBusqueda && (
          <p
            className="text-start mb-0 mt-2"
            style={{
              color: '#c62828',
              fontSize: '9px',
            }}
          >
            {errorBusqueda}
          </p>
        )}
      </Card>

      {mostrarNoEncontrado && (
        <div className="mx-auto" style={{ width: '100%', maxWidth: '416px' }}>
          <CorredorNoEncontrado
            dni={dni}
            onInscribir={() => {
              navigate(
                `/clasificador/entrega-kits/${nombreCarrera}/inscripciones/nueva?dni=${encodeURIComponent(
                  dni.trim()
                )}`
              )
            }}
            onVolver={() => {
              setMostrarNoEncontrado(false)
              setDni('')
            }}
          />
        </div>
      )}

      {/* =========================
          ÚLTIMAS ENTREGAS
      ========================= */}
      <section
        className="mx-auto mt-4"
        style={{
          width: '100%',
          maxWidth: '416px',
        }}
      >
        <span
          className="d-block mb-2"
          style={{
            fontSize: '8px',
            fontWeight: 600,
            color: '#68736d',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}
        >
          Últimas entregas
        </span>

        {cargandoEntregas ? (
          <div className="text-center py-2">
            <Spinner animation="border" size="sm" variant="success" />
          </div>
        ) : errorEntregas ? (
          <p style={{ color: '#c62828', fontSize: '9px' }}>{errorEntregas}</p>
        ) : ultimasEntregas.length === 0 ? (
          <p style={{ color: '#68736d', fontSize: '11px' }}>
            No hay entregas registradas todavía.
          </p>
        ) : (
          ultimasEntregas.map((entrega) => (
            <Card
              key={entrega.id}
              className="border shadow-none mb-2"
              style={{
                minHeight: '34px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderColor: '#dce1de',
                borderRadius: '6px',
              }}
            >
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong style={{ fontSize: '9px', fontWeight: 700, color: '#172033' }}>
                  {entrega.corredor.nombre} {entrega.corredor.apellido}
                </strong>

                <small style={{ fontSize: '8px', color: '#68736d' }}>
                  Kit #{entrega.dorsal.numero} · {entrega.distancia.kilometraje}K
                </small>

                <small style={{ fontSize: '8px', color: '#68736d' }}>
                  {new Date(entrega.fechaHoraEntrega).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </div>
            </Card>
          ))
        )}
      </section>
    </Container>
  )
}

export default BuscarCorredor
