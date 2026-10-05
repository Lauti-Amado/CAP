import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarreraCard from '../../componentes/carreras/CarreraCard'
import { Tabla } from '../../componentes/tabla/Tabla'
import type { Carrera } from '../../types/carrera'
import './Carreras.css'
//borrar con el mock
import { carrerasMock } from './carrerasMock'

function Carreras() {
  const navigate = useNavigate()

  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const [vista, setVista] = useState<'cards' | 'tabla'>('cards')

  const [paginaActual, setPaginaActual] = useState(1)

  const carrerasPorPagina = 3

  useEffect(() => {
    const obtenerCarreras = async () => {
      try {
        setCargando(true)

        //borrar despues del mock 
        setCarreras(carrerasMock)
        setError(null)
        
        // Endpoint a confirmar con backend, descomentar todo
        //const respuesta = await fetch('/api/carreras')

        //if (!respuesta.ok) {
          //throw new Error('No se pudieron obtener las carreras')
        //}

        //const datos: Carrera[] = await respuesta.json()
        //setCarreras(datos)
        //setError(null)
      } catch (error) {
        console.error(error)
        setError('No se pudieron cargar las carreras')
      } finally {
        setCargando(false)
      }
    }

    obtenerCarreras()
  }, [])

  const aniosDisponibles = useMemo(() => {
    const anios = carreras.map((carrera) =>
      new Date(carrera.fechaHora).getFullYear()
    )

    return [...new Set(anios)].sort((a, b) => b - a)
  }, [carreras])

  const estadosDisponibles = useMemo(() => {
    return [...new Set(carreras.map((carrera) => carrera.estado))]
  }, [carreras])

  const carrerasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim()

    return carreras.filter((carrera) => {
      const coincideBusqueda =
        texto === '' ||
        carrera.nombre.toLowerCase().includes(texto) ||
        carrera.lugar.nombre.toLowerCase().includes(texto) ||
        carrera.lugar.localidad.nombre.toLowerCase().includes(texto)
      
      const anioCarrera = new Date(carrera.fechaHora).getFullYear()

      const coincideAnio =
        filtroAnio === 'todos' ||
        anioCarrera.toString() === filtroAnio

      const coincideEstado =
        filtroEstado === 'todos' ||
        carrera.estado === filtroEstado

      return coincideBusqueda && coincideAnio && coincideEstado
    })
  }, [carreras, busqueda, filtroAnio, filtroEstado])

  const totalPaginas = Math.max(
    1,
    Math.ceil(carrerasFiltradas.length / carrerasPorPagina)
  )

  const carrerasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * carrerasPorPagina

    return carrerasFiltradas.slice(
      inicio,
      inicio + carrerasPorPagina
    )
  }, [carrerasFiltradas, paginaActual])

  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroAnio, filtroEstado])

  const verCarrera = (id: number) => {
    navigate(`/carreras/${id}`)
  }

  const modificarCarrera = (id: number) => {
    navigate(`/dashboard-clasificacion-modificar/${id}`)
  }

  const verRanking = (id: number) => {
    navigate(`/resultados?carreraId=${id}`)
  }

  return (
    <main className="carreras">

      <header className="carreras-header">
        <div>
          <h1>Listado de Carreras</h1>

          <p>
            Consulta las carreras disponibles y configura sus clasificaciones.
          </p>
        </div>

      </header>

      <section className="carreras-filtros">

        <input
          type="search"
          placeholder="Buscar carrera..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
        >
          <option value="todos">
            Todos los años
          </option>

          {aniosDisponibles.map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">
            Todos los estados
          </option>

          {estadosDisponibles.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <div className="carreras-vistas">
          <button
            type="button"
            className={vista === 'cards' ? 'activo' : ''}
            onClick={() => setVista('cards')}
            aria-label="Vista de tarjetas"
          >
            ▦
          </button>

          <button
            type="button"
            className={vista === 'tabla' ? 'activo' : ''}
            onClick={() => setVista('tabla')}
            aria-label="Vista de tabla"
          >
            ▤
          </button>
        </div>

      </section>

      <section className="carreras-contenido">

        {cargando && (
          <p>Cargando carreras...</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        {!cargando && !error && carrerasFiltradas.length === 0 && (
          <p>No se encontraron carreras.</p>
        )}

        {!cargando && !error && carrerasFiltradas.length > 0 && (
          <>
            {vista === 'cards' && (
              <>
                <div className="carreras-grid">
                  {carrerasPaginadas.map((carrera) => (
                    <CarreraCard
                      key={carrera.id}
                      carrera={carrera}
                    />
                  ))}
                </div>

                <div className="carreras-paginacion">
                  <button
                    type="button"
                    className="carreras-paginacion__flecha"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(paginaActual - 1)}
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPaginas }, (_, index) => {
                    const pagina = index + 1

                    return (
                      <button
                        key={pagina}
                        type="button"
                        className={
                          paginaActual === pagina
                            ? 'carreras-paginacion__pagina activa'
                            : 'carreras-paginacion__pagina'
                        }
                        onClick={() => setPaginaActual(pagina)}
                      >
                        {pagina}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    className="carreras-paginacion__flecha"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(paginaActual + 1)}
                  >
                    ›
                  </button>
                </div>
              </>
            )}

            {vista === 'tabla' && (
              <Tabla
                columnas={[
                  {
                    titulo: 'Carrera',
                    key: 'nombre',
                  },
                  {
                    titulo: 'Fecha',
                    key: 'fechaHora',
                    render: (carrera) =>
                      new Date(carrera.fechaHora).toLocaleDateString('es-AR'),
                  },
                  {
                    titulo: 'Lugar',
                    key: 'lugar',
                    render: (carrera) =>
                      `${carrera.lugar.nombre} - ${carrera.lugar.localidad.nombre}`
                  },
                  {
                    titulo: 'Estado',
                    key: 'estado',
                  },
                  {
                    titulo: 'Acciones',
                    key: 'acciones',
                    render: (carrera) => (
                      <div className="acciones-carrera">
                      <button
                        type="button"
                        onClick={() =>
                          verCarrera(carrera.id)
                        }
                        title="Ver detalle"
                      >
                      👁
                      </button>
                      {carrera.estado === 'Finalizada' ? (
                            <button
                              type="button"
                              onClick={() =>
                                verRanking(carrera.id)
                              }
                              title="Ver ranking"
                            >
                              🏆
                            </button>
                            ) : (
                            <button
                              type="button"
                              onClick={() =>
                                modificarCarrera(carrera.id)
                              }
                              title="Modificar clasificación"
                            >
                              ✏️
                            </button>
                          )}

                        </div>
                    ),
                  },
                ]}
                datos={carrerasPaginadas}
                mensajeVacio="No se encontraron carreras."
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambiarPagina={setPaginaActual}
                textoPaginacion={`${carrerasFiltradas.length} carreras`}
              />
            )}

          </>
        )}

      </section>

    </main>
  )
}

export default Carreras