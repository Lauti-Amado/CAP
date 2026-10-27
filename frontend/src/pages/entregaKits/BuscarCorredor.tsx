
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PackageCheck, Flag } from 'lucide-react'
import { Container, Card, Button, Form, Badge } from 'react-bootstrap'
import './BuscarCorredor.css'
import CorredorNoEncontrado from './CorredorNoEncontrado'
import type { CorredorDetalle } from '../../types/entregaKits'

// MOCK TEMPORAL
// Borrar cuando el backend esté conectado.
import {
  carreraActivaMock,
  corredoresMock,
  ultimasEntregasMock,
} from './entregaKitsMock'

function BuscarCorredor() {
  const [dni, setDni] = useState('')
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [mostrarNoEncontrado, setMostrarNoEncontrado] = useState(false)

  const carreraActiva = carreraActivaMock
  const ultimasEntregas = ultimasEntregasMock
  const navigate = useNavigate()

  const buscarCorredor = () => {
    const dniIngresado = dni.trim()

    if (dniIngresado === '') {
      setErrorBusqueda('Por favor, ingrese un DNI válido.')
      return
    }

    setErrorBusqueda(null)

    // MOCK TEMPORAL:
    // TODO BACKEND: GET /api/corredores/{dni}
    const corredor: CorredorDetalle | undefined = corredoresMock.find(
      (corredor) => corredor.dni === dniIngresado
    )

    if (corredor) {
      navigate(`/clasificador/entrega-kits/corredor/${corredor.dni}`)
      return
    }

    setMostrarNoEncontrado(true)
  }

  return (
    <Container fluid as="main" className="buscar-corredor">
      <Card className="buscar-corredor__cabecera">
        <div className="buscar-corredor__carrera-icono">
          <Flag size={20} />
        </div>

        <div className="buscar-corredor__info-carrera">
          {carreraActiva && (
            <>
              <div className="buscar-corredor__carrera-nombre">
                <span>{carreraActiva.nombre}</span>
                <span>{carreraActiva.distancias.join(' / ')}</span>

                <Badge bg="success" className="buscar-corredor__estado">
                  <span>●</span> {carreraActiva.estado}
                </Badge>
              </div>

              <small>Edición {carreraActiva.edicion}</small>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="success"
          onClick={() => navigate('/clasificador/entrega-kits/inscripciones')}
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
            buscarCorredor()
          }}
        >
          <Form.Control
            type="text"
            value={dni}
            onChange={(event) => {
              setDni(event.target.value)
              setErrorBusqueda(null)
            }}
            placeholder="Ej. 35123456"
            aria-label="DNI del corredor"
            isInvalid={Boolean(errorBusqueda)}
          />

          <Button
            type="submit"
            variant="success"
            aria-label="Buscar corredor"
          >
            <Search size={18} />
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
              `/clasificador/entrega-kits/inscripciones/nueva?dni=${encodeURIComponent(
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

      {ultimasEntregas.length > 0 && (
        <section className="buscar-corredor__ultimas">
          <span>Últimas entregas</span>

          {ultimasEntregas.map((entrega) => (
            <Card key={entrega.id} className="buscar-corredor__entrega">
              <strong>{entrega.nombreCorredor}</strong>

              <small>
                Kit #{entrega.numeroKit} · {entrega.distancia}
              </small>
            </Card>
          ))}
        </section>
      )}
    </Container>
  )
}

export default BuscarCorredor
