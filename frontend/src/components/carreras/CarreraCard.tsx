//frontend/src/components/carreras/CarreraCard.tsx
import { useNavigate } from 'react-router-dom'
import { Eye, BarChart3, CalendarDays, MapPin, Route,} from 'lucide-react'
import { Card, Badge, Button } from 'react-bootstrap'
import type { Carrera } from '../../types/carrera'

type CarreraCardProps = {
  carrera: Carrera
}

const colorEstado: Record<string, string> = {
  Creada: 'secondary',
  Finalizada: 'dark',
}

function CarreraCard({ carrera }: CarreraCardProps) {
  const navigate = useNavigate()

  const fecha = new Date(carrera.fechaHoraCarrera)
  const esFinalizada = carrera.estado === 'Finalizada'

  const distancias = carrera.distancias
    .map((item) => `${item.kilometraje}K`)
    .join(', ')

  const handleVerDetalle = () => {
    navigate(`/administrador/carreras/${carrera.id}`)
  }

  const handleVerResultados = () => {
    navigate(`/administrador/carreras/${carrera.id}/clasificacion/completa`)
  }

  return (
    <Card className="h-100 shadow-sm overflow-hidden">
      <div className="position-relative">
        <div className="ratio ratio-21x9">
          <Card.Img
            variant="top"
            src={carrera.imagenUrl}
            alt={`Imagen de ${carrera.nombre}`}
            className="object-fit-cover rounded-0"
          />
        </div>

        <Badge
          pill
          bg="light"
          text="dark"
          className="position-absolute top-0 start-0 m-2 border d-inline-flex align-items-center gap-2"
        >
          <span
            className={`d-inline-block rounded-circle p-1 bg-${colorEstado[carrera.estado] ?? 'success'}`}
          />
          {carrera.estado}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <Card.Title as="h2" className="fs-6 fw-bold text-break">
          {carrera.nombre}
        </Card.Title>

        <div className="d-flex flex-column gap-2 small text-secondary">
          <p className="d-flex align-items-start gap-2 mb-0">
            <CalendarDays size={15} className="flex-shrink-0 mt-1" />
            <span>
              {fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </p>

          <p className="d-flex align-items-start gap-2 mb-0">
            <MapPin size={15} className="flex-shrink-0 mt-1" />
            <span>{carrera.lugar.nombre}, {carrera.lugar.localidad}</span>
          </p>

          <p className="d-flex align-items-start gap-2 mb-0">
            <Route size={15} className="flex-shrink-0 mt-1" />
            <span>{distancias}</span>
          </p>
        </div>

        <div className="d-flex justify-content-between align-items-center border-top mt-auto pt-3">
          <div className="d-flex flex-column">
            <small className="text-secondary text-uppercase">
              {esFinalizada ? 'Participantes' : 'Inscriptos'}
            </small>
            <strong className="fs-5">—</strong>
          </div>

          <div className="d-flex gap-2">
            <Button
              type="button"
              variant="outline-success"
              className="d-inline-flex p-2"
              aria-label="Ver detalle de la carrera"
              title="Ver detalle"
              onClick={handleVerDetalle}
            >
              <Eye size={17} />
            </Button>

            {esFinalizada && (
              <Button
                type="button"
                variant="outline-success"
                className="d-inline-flex p-2"
                aria-label="Ver resultados"
                title="Ver resultados"
                onClick={handleVerResultados}
              >
                <BarChart3 size={17} />
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CarreraCard
