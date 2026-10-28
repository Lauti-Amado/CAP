
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Container, Form, Row, Col } from 'react-bootstrap'
import { Eye, Trash2, UserRoundPlus, Search } from 'lucide-react'
import './Inscripciones.css'
import { Tabla, type Columna } from '../../components/tabla/Tabla'
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
  const { nombreCarrera } = useParams();

  const filtros: FiltrosInscripciones = {
    dni,
    carrera,
    distancia,
    pago,
    estado,
    anio,
    pagina: paginaActual,
  }

  // TODO: reemplazar por la consulta al backend
  // const resultado = await obtenerInscripciones(filtros)
  // const inscripciones = resultado.datos
  // const totalPaginas = resultado.totalPaginas

  const inscripciones: Inscripcion[] = inscripcionesMock

  // Opciones de filtros temporales obtenidas del mock
  const carreras = [
    ...new Set(inscripcionesMock.map((inscripcion) => inscripcion.carrera)),
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
      inscripcionesMock.map((inscripcion) => inscripcion.fecha.slice(-4)),
    ),
  ]

  const columnas: Columna<Inscripcion>[] = [
    { titulo: 'DNI', key: 'dni' },
    { titulo: 'Corredor', key: 'corredor' },
    { titulo: 'Carrera', key: 'carrera' },
    { titulo: 'Distancia', key: 'distancia' },
    { titulo: 'Fecha', key: 'fecha' },
    {
      titulo: 'Tipo',
      key: 'tipo',
      render: (inscripcion) => (
        <span
          className={`inscripciones__badge inscripciones__badge--tipo-${inscripcion.tipo
            .toLowerCase()
            .replace(/\s+/g, '-')}`}
        >
          {inscripcion.tipo}
        </span>
      ),
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
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              aria-label="Ver detalle de inscripción"
              title="Ver detalle"
              onClick={() =>
                navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones/${inscripcion.id}`)
              }
            >
              <Eye size={13} />
            </Button>

            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              aria-label="Eliminar inscripción"
              title="Eliminar inscripción"
            >
              <Trash2 size={13} />
            </Button>
          </div>

          <Button
            type="button"
            className="inscripciones__dar-kit"
            size="sm"
            onClick={() =>
              navigate(`/clasificador/entrega-kits/${nombreCarrera}/corredor/${inscripcion.dni}`)
            }
          >
            Dar Kit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Container fluid className="inscripciones">
      <header className="inscripciones__encabezado">
        <div>
          <h1>Inscripciones</h1>
          <p>
            Gestiona las inscripciones de todas las carreras activas y
            publicadas.
          </p>
        </div>

        <Button
          type="button"
          className="inscripciones__nueva"
          onClick={() =>
            navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones/nueva`)
          }
        >
          <UserRoundPlus size={15} />
          <span>Nueva inscripción</span>
        </Button>
      </header>

      <Form className="inscripciones__filtros">
        <Row className="g-3 align-items-center">
          <Col xs={12} sm={6} lg={2}>
            <div className="inscripciones__buscador">
              <Search size={14} />
              <Form.Control
                type="text"
                value={dni}
                onChange={(event) => {
                  setDni(event.target.value)
                  setPaginaActual(1)
                }}
                placeholder="Buscar por DNI"
                aria-label="Buscar por DNI"
              />
            </div>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              value={carrera}
              aria-label="Filtrar por carrera"
              onChange={(event) => {
                setCarrera(event.target.value)
                setPaginaActual(1)
              }}
            >
              <option value="">Carrera</option>
              {carreras.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              value={distancia}
              aria-label="Filtrar por distancia"
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
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              value={pago}
              aria-label="Filtrar por pago"
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
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              value={estado}
              aria-label="Filtrar por estado"
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
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              value={anio}
              aria-label="Filtrar por año"
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
            </Form.Select>
          </Col>
        </Row>
      </Form>

      <section className="inscripciones__tabla">
        <Tabla
          columnas={columnas}
          datos={inscripciones}
          paginaActual={paginaActual}
          // TODO: reemplazar cuando se integre el backend
          totalPaginas={2}
          onCambiarPagina={setPaginaActual}
          mostrarNumeros={false}
          textoPaginacion={`Mostrando ${inscripciones.length} de ${inscripciones.length} inscripciones`}
        />
      </section>
    </Container>
  )
}

export default Inscripciones
