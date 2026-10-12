import './CarreraCard.css'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Pencil,
  BarChart3,
  CalendarDays,
  MapPin,
  Route,
} from 'lucide-react'
import type { Carrera } from '../../types/carrera'

type CarreraCardProps = {   carrera: Carrera }

function CarreraCard({ carrera }: CarreraCardProps) {
  const navigate = useNavigate()

  const fecha = new Date(carrera.fechaHora)

  const esFinalizada = carrera.estado === 'Finalizada'

  const distancias = carrera.distanciaCarrera
    .map((item) => `${item.distancia.kilometraje}K`)
    .join(', ')

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
    <article className="carrera-card">

      <div className="carrera-card__imagen-container">

        <img
          src={carrera.imagenUrl}
          alt={`Imagen de ${carrera.nombre}`}
          className="carrera-card__imagen"
        />

        <span
          className={`carrera-card__estado carrera-card__estado--${carrera.estado.toLowerCase()}`}
        >
          <span className="carrera-card__estado-dot" />
          {carrera.estado}
        </span>

      </div>

      <div className="carrera-card__contenido">

        <div className="carrera-card__titulo">
          <h2>{carrera.nombre}</h2>
        </div>

        <div className="carrera-card__datos">

          <p>
            <CalendarDays size={16} />
            {fecha.toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <p>
            <MapPin size={16} />
            {carrera.lugar.nombre},{' '}
            {carrera.lugar.localidad.nombre}
          </p>

          <p>
            <Route size={16} />
            {distancias}
          </p>

        </div>

        <div className="carrera-card__footer">

          <div className="carrera-card__inscriptos">

            <span>
              {esFinalizada
                ? 'PARTICIPANTES'
                : 'INSCRIPTOS'}
            </span>

            <strong>
              —
            </strong>

          </div>

          <div className="carrera-card__acciones">

            {/* Ver detalle */}
            <button
              type="button"
              className="carrera-card__accion"
              aria-label="Ver detalle de la carrera"
              title="Ver detalle"
              onClick={handleVerDetalle}
            >
              <Eye size={19} strokeWidth={2} />
            </button>

            {/* Finalizada → resultados */}
            {esFinalizada ? (

              <button
                type="button"
                className="carrera-card__accion"
                aria-label="Ver resultados"
                title="Ver resultados"
                onClick={handleVerResultados}
              >
                <BarChart3 size={19} strokeWidth={2} />
              </button>

            ) : (

              /* No finalizada → modificar */
              <button
                type="button"
                className="carrera-card__accion"
                aria-label="Modificar clasificación"
                title="Modificar clasificación"
                onClick={handleModificar}
              >
                <Pencil size={19} strokeWidth={2} />
              </button>

            )}

          </div>

        </div>

      </div>

    </article>
  )
}

export default CarreraCard