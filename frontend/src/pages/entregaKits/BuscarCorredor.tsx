import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PackageCheck, Flag } from 'lucide-react'
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

  const [errorBusqueda, setErrorBusqueda] =
    useState<string | null>(null)

  const [mostrarNoEncontrado, setMostrarNoEncontrado] =
    useState(false)

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
    // búsqueda de corredor por DNI.
    //
    // TODO BACKEND:
    // GET /api/corredores/{dni}

    const corredor: CorredorDetalle | undefined =
      corredoresMock.find(
        (corredor) => corredor.dni === dniIngresado
      )

    if (corredor) {
      navigate(`/entrega-kits/corredor/${corredor.dni}`)
      return
    }

    setMostrarNoEncontrado(true)
  }


  return (
    <main className="buscar-corredor">

      <section className="buscar-corredor__cabecera">

        <div className="buscar-corredor__carrera-icono">
          <Flag size={20} />
        </div>

        <div>

          {carreraActiva && (
            <>
              <div className="buscar-corredor__carrera-nombre">

                <span>
                  {carreraActiva.nombre}
                </span>

                <span>
                  {carreraActiva.distancias.join(' / ')}
                </span>

                <span className="buscar-corredor__estado">
                  <span>●</span>
                  {carreraActiva.estado}
                </span>

              </div>

              <small>
                Edición {carreraActiva.edicion}
              </small>
            </>
          )}

        </div>


        <button
          type="button"
          onClick={() =>
            navigate('/entrega-kits/inscripciones')
          }
        >
          Ingresar a lista de inscripciones
        </button>

      </section>


      <section className="buscar-corredor__contenido">

        <div className="buscar-corredor__icono">
          <PackageCheck size={24} />
        </div>

        <h1>
          Buscar corredor
        </h1>

        <p>
          Ingrese el DNI del participante para asignar su kit de carrera.
        </p>


        <div className="buscar-corredor__busqueda">

          <input
            type="text"
            value={dni}
            onChange={(event) => {
              setDni(event.target.value)
              setErrorBusqueda(null)
            }}
            placeholder="Ej. 35123456"
          />

          <button
            type="button"
            onClick={buscarCorredor}
            aria-label="Buscar corredor"
          >
            <Search size={18} />
          </button>

        </div>


        {errorBusqueda && (
          <p className="buscar-corredor__error">
            {errorBusqueda}
          </p>
        )}

      </section>


      {mostrarNoEncontrado && (
        <CorredorNoEncontrado
          dni={dni}
          onInscribir={() => {
            // Lleva al formulario de nueva inscripción
            // con el DNI que se estaba buscando.
            navigate(
              `/entrega-kits/inscripciones/nueva?dni=${encodeURIComponent(
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

          <span>
            Últimas entregas
          </span>

          {ultimasEntregas.map((entrega) => (
            <div key={entrega.id}>

              <strong>
                {entrega.nombreCorredor}
              </strong>

              <small>
                Kit #{entrega.numeroKit} · {entrega.distancia}
              </small>

            </div>
          ))}

        </section>
      )}

    </main>
  )
}

export default BuscarCorredor