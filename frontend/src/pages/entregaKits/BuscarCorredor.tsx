import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, PackageCheck, Flag } from 'lucide-react'
import { Container, Card, Button, Form, Badge, Spinner } from 'react-bootstrap'

import './BuscarCorredor.css'
import CorredorNoEncontrado from './CorredorNoEncontrado'
import { useSeleccionarCarrera } from '../../context/SeleccionarCarreraContext'
import { ApiError } from '../../services/apiService'
import {
  buscarCorredorPorDni,
  obtenerEntregasRecientes,
} from '../../services/entregaKitService'
import type { EntregaRecienteDTO } from '../../types/entregaKits'

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
    const dniIngresado = dni.trim()

    if (dniIngresado === '') {
      setErrorBusqueda('Por favor, ingrese un DNI válido.')
      return
    }

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
    <Container fluid as="main" className="buscar-corredor">
      <Card className="buscar-corredor__cabecera">
        <div className="buscar-corredor__carrera-icono">
          <Flag size={20} />
        </div>

        <div className="buscar-corredor__info-carrera">
          {carreraSeleccionada && (
            <>
              <div className="buscar-corredor__carrera-nombre">
                <span>{carreraSeleccionada.nombre} </span>

                <span>
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

                <Badge bg="success" className="buscar-corredor__estado">
                  <span>●</span> {carreraSeleccionada.estado}
                </Badge>
              </div>

              <small>
                {new Date(
                  carreraSeleccionada.fechaHoraCarrera
                ).toLocaleDateString('es-AR')}
              </small>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="success"
          onClick={() =>
            navigate(
              `/clasificador/entrega-kits/${nombreCarrera}/inscripciones`
            )
          }
        >
          Ingresar a lista de inscripciones
        </Button>
      </Card>

      <Card className="buscar-corredor__contenido">
        <div className="buscar-corredor__icono">
          <PackageCheck size={24} />
        </div>

        <h1>Buscar corredor</h1>

        <p>
          Ingrese el DNI del participante para asignar su kit de carrera.
        </p>

        <Form
          className="buscar-corredor__busqueda"
          onSubmit={(event) => {
            event.preventDefault()

            if (!buscando) {
              void buscarCorredor()
            }
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
          />

          <Button
            type="submit"
            variant="success"
            aria-label="Buscar corredor"
            disabled={buscando}
          >
            {buscando ? <Spinner size="sm" /> : <Search size={18} />}
          </Button>
        </Form>

        {errorBusqueda && (
          <p className="buscar-corredor__error">
            {errorBusqueda}
          </p>
        )}
      </Card>

      {mostrarNoEncontrado && (
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
      )}

      <section className="buscar-corredor__ultimas">
        <span>Últimas entregas</span>

        {cargandoEntregas ? (
          <div className="text-center">
            <Spinner animation="border" size="sm" />
          </div>
        ) : errorEntregas ? (
          <p className="buscar-corredor__error">{errorEntregas}</p>
        ) : ultimasEntregas.length === 0 ? (
          <p>No hay entregas registradas todavía.</p>
        ) : (
          ultimasEntregas.map((entrega) => (
            <Card key={entrega.id} className="buscar-corredor__entrega">
              <strong>
                {entrega.corredor.nombre} {entrega.corredor.apellido}
              </strong>

              <small>
                Kit #{entrega.dorsal.numero} ·{' '}
                {entrega.distancia.kilometraje}K
              </small>

              <small>
                {new Date(entrega.fechaHoraEntrega).toLocaleTimeString(
                  'es-AR',
                  { hour: '2-digit', minute: '2-digit' }
                )}
              </small>
            </Card>
          ))
        )}
      </section>
    </Container>
  )
}

export default BuscarCorredor