import './DetalleCarrera.css'
import { useEffect, useState } from 'react'
import './DetalleCarrera.css'

type Distancia = {
  kilometraje: number
  tipoDistancia: string
}

type DistanciaCarrera = {
  id: number
  precioDistancia: number
  distancia: Distancia
}

type CarreraDetalle = {
  id: number
  nombre: string
  estado: string
  cupoMax: number
  fechaHora: string
  imagenUrl: string
  descripcion: string

  lugar: {
    nombre: string
    localidad: {
      nombre: string
    }
  }

  distanciaCarrera: DistanciaCarrera[]

  // Estos datos vendrán calculados desde el backend
  cantidadInscriptos: number
  cantidadKitsEntregados: number
  cantidadClasificados: number
}

function DetalleCarrera() {
  const [carrera, setCarrera] = useState<CarreraDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const obtenerCarrera = async () => {
      try {
        // Acá después irá el GET de una carrera por ID.
      } catch (error) {
        console.error(error)
        setError('No se pudo cargar la carrera')
      } finally {
        setCargando(false)
      }
    }

    obtenerCarrera()
  }, [])

  if (cargando) {
    return <p>Cargando carrera...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!carrera) {
    return <p>No se encontró la carrera.</p>
  }

  const fecha = new Date(carrera.fechaHora)

  const distancias = carrera.distanciaCarrera.map(
    (item) => `${item.distancia.kilometraje}K`
  )

  const inscripcionesAbiertas =
    carrera.estado === 'Publicada' ||
    carrera.estado === 'Activa'

  return (
    <main className="detalle-carrera">

      <button
        type="button"
        className="detalle-carrera__volver"
      >
        ← Volver al listado de carreras
      </button>

      <header className="detalle-carrera__header">

        <div>
          <h1>{carrera.nombre}</h1>
        </div>

        <div className="detalle-carrera__acciones">

          {inscripcionesAbiertas && (
            <span className="detalle-carrera__inscripciones">
              INSCRIPCIONES
              <br />
              ABIERTAS
            </span>
          )}

          <button
            type="button"
            className="detalle-carrera__clasificacion"
          >
            MODIFICAR
            <br />
            CLASIFICACIÓN
          </button>

        </div>

      </header>

      <section className="detalle-carrera__contenido">

        <article className="detalle-carrera__evento">

          <h2>Detalles del Evento</h2>

          <div className="detalle-carrera__imagen">
            <img
              src={carrera.imagenUrl}
              alt={`Imagen de ${carrera.nombre}`}
            />
          </div>

          <div className="detalle-carrera__datos">

            <div>
              <span>FECHA</span>
              <strong>
                {fecha.toLocaleDateString('es-AR')}
              </strong>
            </div>

            <div>
              <span>HORA DE LLEGADA</span>
              <strong>
                {fecha.toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </div>

          </div>

          <div className="detalle-carrera__distancias">

            <span>DISTANCIAS OFICIALES</span>

            <div>
              {distancias.map((distancia) => (
                <span key={distancia}>
                  {distancia}
                </span>
              ))}
            </div>

          </div>

          <div className="detalle-carrera__cupo">

            <div>
              <span>CUPO DE CORREDORES</span>

              <strong>
                {carrera.cantidadInscriptos} / {carrera.cupoMax}
              </strong>
            </div>

            <progress
              value={carrera.cantidadInscriptos}
              max={carrera.cupoMax}
            />

          </div>

        </article>

        <div className="detalle-carrera__derecha">

          <section className="detalle-carrera__estadisticas">

            <article>
              <span>INSCRIPTOS<br />TOTALES</span>
              <strong>{carrera.cantidadInscriptos}</strong>
            </article>

            <article>
              <span>KITS<br />ENTREGADOS</span>
              <strong>{carrera.cantidadKitsEntregados}</strong>
            </article>

            <article>
              <span>CLASIFICADOS</span>
              <strong>{carrera.cantidadClasificados}</strong>
            </article>

          </section>

          <section className="detalle-carrera__descripcion">

            <h2>Descripción General</h2>

            <p>
              {carrera.descripcion}
            </p>

          </section>

        </div>

      </section>

    </main>
  )
}

export default DetalleCarrera