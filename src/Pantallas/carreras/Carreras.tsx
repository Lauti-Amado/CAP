import { useEffect, useState } from 'react'
import CarreraCard from '../../components/carreras/CarreraCard'
import './Carreras.css'

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

function Carreras() {

  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    const obtenerCarreras = async () => {

      try {

        // aca va a ir el get al back despues

      } catch (error) {

        console.error(error)
        setError('No se pudieron cargar las carreras')

      } finally {

        setCargando(false)

      }
    }

    obtenerCarreras()

  }, [])

  return (
    <main className="carreras">

      <header className="carreras-header">
        <div>
          <h1>Listado de Carreras</h1>

          <p>
            Consulta las carreras disponibles y configura sus clasificaciones.
          </p>
        </div>

        <button type="button">
          + Nueva carrera
        </button>
      </header>


      <section className="carreras-filtros">

        <select>
          <option value="todos">
            Todos los años
          </option>
        </select>

        <select>
          <option value="todos">
            Todos los estados
          </option>
        </select>

        <div className="carreras-vistas">
          <button type="button">
            ▦
          </button>

          <button type="button">
            ▤
          </button>
        </div>

      </section>


      <section>

        {cargando && (
          <p>Cargando carreras...</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        {!cargando && !error && carreras.length === 0 && (
          <p>No hay carreras disponibles.</p>
        )}

        {!cargando && !error && carreras.length > 0 && (

          <div className="carreras-grid">

            {carreras.map((carrera) => (

              <CarreraCard
                key={carrera.id}
                carrera={carrera}
                //la cantidad de inscriptos se obtiene con un count
                //despues se agregara
              />

            ))}

          </div>

        )}

      </section>

    </main>
  )
}

export default Carreras