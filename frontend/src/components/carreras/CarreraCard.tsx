
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Pencil,
  BarChart3,
  CalendarDays,
  MapPin,
  Route,
} from 'lucide-react'
import { Card, Badge } from 'react-bootstrap'
import type { Carrera } from '../../types/carrera'
import './CarreraCard.css'

type CarreraCardProps = {
  carrera: Carrera
}

function CarreraCard({ carrera }: CarreraCardProps) {
  const navigate = useNavigate()

  const fecha = new Date(carrera.fechaHora)
  const esFinalizada = carrera.estado === 'Finalizada'

  const distancias = carrera.distanciaCarrera
    .map((item) => `${item.distancia.kilometraje}K`)
    .join(', ')

  const estadoClase = carrera.estado
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

  const handleVerDetalle = () => {
    navigate(`/carreras/${carrera.id}`)
  }

  const handleModificar = () => {
    navigate(`/dashboard-clasificacion-modificar/${carrera.id}`)
  }

  const handleVerResultados = () => {
    navigate(`/resultados?carreraId=${carrera.id}`)
  }

  return (
    <Card className="carrera-card">
      <div className="carrera-card__imagen-container">
        <Card.Img
          variant="top"
          src={carrera.imagenUrl}
          alt={`Imagen de ${carrera.nombre}`}
          className="carrera-card__imagen"
        />

        <Badge
          pill
          className={`carrera-card__estado carrera-card__estado--${estadoClase}`}
        >
          <span className="carrera-card__estado-dot" />
          {carrera.estado}
        </Badge>
      </div>

      <Card.Body className="carrera-card__contenido">
        <div className="carrera-card__titulo">
          <Card.Title as="h2">{carrera.nombre}</Card.Title>
        </div>

        <div className="carrera-card__datos">
          <p>
            <CalendarDays size={15} />
            <span>
              {fecha.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>

          <p>
            <MapPin size={15} />
            <span>
              {carrera.lugar.nombre}, {carrera.lugar.localidad.nombre}
            </span>
          </p>

          <p>
            <Route size={15} />
            <span>{distancias}</span>
          </p>
        </div>

        <div className="carrera-card__footer">
          <div className="carrera-card__inscriptos">
            <span>{esFinalizada ? 'PARTICIPANTES' : 'INSCRIPTOS'}</span>
            <strong>—</strong>
          </div>

          <div className="carrera-card__acciones">
            <button
              type="button"
              className="carrera-card__accion"
              aria-label="Ver detalle de la carrera"
              title="Ver detalle"
              onClick={handleVerDetalle}
            >
              <Eye size={17} />
            </button>

            {esFinalizada ? (
              <button
                type="button"
                className="carrera-card__accion"
                aria-label="Ver resultados"
                title="Ver resultados"
                onClick={handleVerResultados}
              >
                <BarChart3 size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="carrera-card__accion"
                aria-label="Modificar clasificación"
                title="Modificar clasificación"
                onClick={handleModificar}
              >
                <Pencil size={17} />
              </button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CarreraCard
