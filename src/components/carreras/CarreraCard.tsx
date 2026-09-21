import './CarreraCard.css'
import { useNavigate } from 'react-router-dom'
type Distancia = {
  kilometraje: number
  tipoDistancia: string
}

type DistanciaCarrera = {
  distancia: Distancia
}

type Carrera = {
  id: number
  nombre: string
  fechaHora: string
  imagenUrl: string
  descripcion: string
  participantesMax: number
  estado: string
  lugar: {
    nombre: string
    localidad: {
      nombre: string
    }
  }
  distanciaCarrera: DistanciaCarrera[]
}

type CarreraCardProps = {
  carrera: Carrera
}

function IconoOjo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconoEditar() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  )
}

function IconoResultados() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="13" width="4" height="7" />
      <rect x="10" y="9" width="4" height="11" />
      <rect x="16" y="5" width="4" height="15" />
    </svg>
  )
}

function IconoCalendario() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconoUbicacion() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function IconoDistancia() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 17c4-1 4-7 8-8" />
    </svg>
  )
}

function CarreraCard({ carrera }: CarreraCardProps) {

  const navigate = useNavigate()

  const fecha = new Date(carrera.fechaHora)

  const esFinalizada = carrera.estado === 'Finalizada'

  const distancias = carrera.distanciaCarrera
    .map((item) => `${item.distancia.kilometraje}K`)
    .join(', ')

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
            <IconoCalendario />

            {fecha.toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <p>
            <IconoUbicacion />

            {carrera.lugar.nombre}, {carrera.lugar.localidad.nombre}
          </p>

          <p>
            <IconoDistancia />

            {distancias}
          </p>

        </div>


        <div className="carrera-card__footer">

          <div className="carrera-card__inscriptos">

            <span>
              {esFinalizada ? 'PARTICIPANTES' : 'INSCRIPTOS'}
            </span>

            <strong>
              {/* Después se reemplaza por el count real */}
              —
            </strong>

          </div>


          <div className="carrera-card__acciones">

            <button
              type="button"
              className="carrera-card__accion"
              aria-label="Ver detalle de la carrera"
              onClick={() => navigate(`/carreras/${carrera.id}`)}
            >
              <IconoOjo />
            </button>


            {esFinalizada ? (

              <button
                type="button"
                className="carrera-card__accion"
                aria-label="Ver resultados"
              >
                <IconoResultados />
              </button>

            ) : (

              <button
                type="button"
                className="carrera-card__accion"
                aria-label="Editar clasificación"
              >
                <IconoEditar />
              </button>

            )}

          </div>

        </div>

      </div>

    </article>
  )
}

export default CarreraCard