import { useNavigate } from 'react-router-dom'
import './Inscripciones.css'
import { useState } from 'react'
import { Eye, Trash2, UserRoundPlus, Search } from 'lucide-react'
import { Tabla, type Columna } from '../../componentes/tabla/Tabla'
import type { Inscripcion, FiltrosInscripciones } from '../../types/inscripcion'
// MOCK TEMPORAL
import { inscripcionesMock } from './inscripcionesMock'

function Inscripciones() {
  const [dni, setDni] = useState('')
  const [carrera, setCarrera] = useState('')
  const [distancia, setDistancia] = useState('')
  const [pago, setPago] = useState('')
  const [estado, setEstado] = useState('')
  const [anio, setAnio] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const navigate = useNavigate()

  const filtros: FiltrosInscripciones = {
    dni,
    carrera,
    distancia,
    pago,
    estado,
    anio,
    pagina: paginaActual,
  }
  //const resultado = await obtenerInscripciones(filtros)
  //const inscripciones = resultado.datos
  //const totalPaginas = resultado.totalPaginas
  // GET /api/inscripciones
  //ACA MOCK
  const inscripciones: Inscripcion[] = inscripcionesMock

  //opciones filtros, CAMBIAR LUEGO PORQUE ESTAN CON EL MOCK
  const carreras = [
    ...new Set(
      inscripcionesMock.map((inscripcion) => inscripcion.carrera)
    ),
  ]
  const distancias = [
    ...new Set(inscripcionesMock.map((inscripcion) => inscripcion.distancia)),
  ]

  const pagos = [
    ...new Set(inscripcionesMock.map((inscripcion) => inscripcion.pago)),
  ]

  const estados = [
    ...new Set(inscripcionesMock.map((inscripcion) => inscripcion.estado)),
  ]

  const anios = [
    ...new Set(
      inscripcionesMock.map((inscripcion) =>
        inscripcion.fecha.slice(-4),
      ),
    ),
  ]
  const columnas: Columna<Inscripcion>[] = [
  {
    titulo: 'DNI',
    key: 'dni',
  },
  {
    titulo: 'Corredor',
    key: 'corredor',
  },
  {
    titulo: 'Carrera',
    key: 'carrera',
  },
  {
    titulo: 'Distancia',
    key: 'distancia',
  },
  {
    titulo: 'Fecha',
    key: 'fecha',
  },
  {
    titulo: 'Pago',
    key: 'pago',
    render: (inscripcion) => (
      <span
        className={`inscripciones__badge inscripciones__badge--pago-${inscripcion.pago.toLowerCase()}`}
      >
        {inscripcion.pago}
      </span>
    ),
  },
  {
    titulo: 'Estado',
    key: 'estado',
    render: (inscripcion) => (
      <span
        className={`inscripciones__badge inscripciones__badge--estado-${inscripcion.estado
          .toLowerCase()
          .replace(/\s+/g, '-')}`}
      >
        {inscripcion.estado}
      </span>
    ),
  },
  {
    titulo: 'Acciones',
    key: 'acciones',
    render: (inscripcion: Inscripcion) => (
      <div className="inscripciones__acciones">
        <div className="inscripciones__acciones-superiores">
          <button
            type="button"
            aria-label="Ver detalle de inscripción"
            onClick={() =>
              navigate(`/entrega-kits/inscripciones/${inscripcion.id}`)
            }
          >
            <Eye size={13} />
          </button>

          <button
            type="button"
            aria-label="Eliminar inscripción"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <button
          type="button"
          className="inscripciones__dar-kit"
          onClick={() => {
            navigate(`/entrega-kits/corredor/${inscripcion.dni}`)
          }}
        >
          Dar Kit
        </button>
      </div>
    ),
  },
]

  return (
    <main className="inscripciones">

      <header className="inscripciones__encabezado">
      <div>
        <h1>Inscripciones</h1>

        <p>
          Gestiona las inscripciones de todas las carreras activas y publicadas.
        </p>
      </div>

      <button
        type="button"
        className="inscripciones__nueva"
        onClick={() => {
          navigate('/entrega-kits/inscripciones/nueva')
        }}
      >
        <UserRoundPlus size={15} />
        <span>Nueva inscripción</span>
      </button>
    </header>


      <section className="inscripciones__filtros">

        <div className="inscripciones__buscador">
          <Search size={14} />

          <input
            type="text"
            value={dni}
            onChange={(event) => {
              setDni(event.target.value)
              setPaginaActual(1)
            }}
            placeholder="Buscar por DNI"
          />
        </div>

        <select 
          value={carrera}
          onChange={(event) => {
            setCarrera(event.target.value)
            setPaginaActual(1)
        }}
        >
          <option value="">
            Carrera
          </option>
          {carreras.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>

        <select
          value={distancia}
          onChange={(event) => {
            setDistancia(event.target.value)
            setPaginaActual(1)
          }}
        >
          <option value="">Distancia</option>

          {distancias.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>

        <select
          value={pago}
          onChange={(event) => {
            setPago(event.target.value)
            setPaginaActual(1)
          }}
        >
          <option value="">Pago</option>

          {pagos.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>

         <select
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value)
            setPaginaActual(1)
          }}
        >
          <option value="">Estado</option>

          {estados.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>

        <select
          value={anio}
          onChange={(event) => {
            setAnio(event.target.value)
            setPaginaActual(1)
          }}
        >
          <option value="">Año</option>

          {anios.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>

      </section>

      <section className="inscripciones__tabla">
        <Tabla
          columnas={columnas}
          datos={inscripciones}
          paginaActual={paginaActual}
          //UNA VEZ QUE SE HAGA EL BACK ESTO CAMBIA A
          //totalPaginas={resultado.totalPaginas}
          totalPaginas={1}
          onCambiarPagina={setPaginaActual}
          textoPaginacion={`Mostrando ${inscripciones.length} de ${inscripciones.length} inscripciones`}
        />
      </section>
      

    </main>
  )
}

export default Inscripciones