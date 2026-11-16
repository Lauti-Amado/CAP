//frontend/src/pages/carreras/Carreras.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, ButtonGroup, Card, Col, Container, Form, Pagination, Row, Spinner } from 'react-bootstrap'
import CarreraCard from '../../components/carreras/CarreraCard'
import { Tabla } from '../../components/tabla/Tabla'
import { useCarrera } from '../../context/CarreraContext'

function Carreras() {
  const navigate = useNavigate()

  const [busqueda, setBusqueda] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const [vista, setVista] = useState<'cards' | 'tabla'>('cards')
  const [paginaActual, setPaginaActual] = useState(1)

  const carrerasPorPagina = 3

  // Las carreras las trae el CarreraProvider (ya no hay mock ni fetch propio)
  const { carreras, cargando, error } = useCarrera()

  const aniosDisponibles = useMemo(() => {
    const anios = carreras.map((carrera) =>
      new Date(carrera.fechaHoraCarrera).getFullYear()
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
        carrera.lugar.localidad.toLowerCase().includes(texto)

      const anioCarrera = new Date(carrera.fechaHoraCarrera).getFullYear()

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

  const verCarrera = (id: string) => {
    navigate(`/administrador/carreras/${id}`)
  }

  const verRanking = (id: string) => {
    navigate(`/administrador/carreras/${id}/clasificacion/completa`)
  }

  return (
    <Container fluid as="main" className="p-4">
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-0">Listado de Carreras</h1>
        <p className="mt-2 mb-0 small text-secondary">
          Consulta las carreras disponibles y configura sus clasificaciones.
        </p>
      </header>

      <Card as="section" className="mb-4 shadow-sm">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col xs={12} md>
              <Form.Control
                type="search"
                aria-label="Buscar carrera"
                placeholder="Buscar carrera..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Col>

            <Col xs={12} sm={6} md="auto">
              <Form.Select
                aria-label="Filtrar por año"
                value={filtroAnio}
                onChange={(e) => setFiltroAnio(e.target.value)}
              >
                <option value="todos">Todos los años</option>
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} sm={6} md="auto">
              <Form.Select
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                {estadosDisponibles.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md="auto" className="d-flex justify-content-md-end">
              <ButtonGroup aria-label="Selector de vista">
                <Button
                  type="button"
                  variant="outline-success"
                  active={vista === 'cards'}
                  aria-label="Vista de tarjetas"
                  aria-pressed={vista === 'cards'}
                  onClick={() => setVista('cards')}
                >
                  ▦
                </Button>
                <Button
                  type="button"
                  variant="outline-success"
                  active={vista === 'tabla'}
                  aria-label="Vista de tabla"
                  aria-pressed={vista === 'tabla'}
                  onClick={() => setVista('tabla')}
                >
                  ▤
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* =========================
          CONTENIDO
      ========================= */}
      <section>
        {cargando && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-secondary">Cargando carreras...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!cargando && !error && carrerasFiltradas.length === 0 && (
          <div className="text-center py-5 text-secondary">
            No se encontraron carreras.
          </div>
        )}

        {!cargando && !error && carrerasFiltradas.length > 0 && (
          <>
            {vista === 'cards' && (
              <>
                <Row className="g-4">
                  {carrerasPaginadas.map((carrera) => (
                    <Col xs={12} md={6} xl={4} key={carrera.id}>
                      <CarreraCard carrera={carrera} />
                    </Col>
                  ))}
                </Row>

                <Pagination className="justify-content-center mt-4 mb-0">
                  <Pagination.Prev
                    disabled={paginaActual === 1}
                    aria-label="Página anterior"
                    onClick={() => setPaginaActual((pagina) => pagina - 1)}
                  />
                  {Array.from({ length: totalPaginas }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={paginaActual === index + 1}
                      onClick={() => setPaginaActual(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={paginaActual === totalPaginas}
                    aria-label="Página siguiente"
                    onClick={() => setPaginaActual((pagina) => pagina + 1)}
                  />
                </Pagination>
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
                    key: 'fechaHoraCarrera',
                    render: (carrera) =>
                      new Date(carrera.fechaHoraCarrera).toLocaleDateString('es-AR'),
                  },
                  {
                    titulo: 'Lugar',
                    key: 'lugar',
                    render: (carrera) =>
                      `${carrera.lugar.nombre} - ${carrera.lugar.localidad}`,
                  },
                  {
                    titulo: 'Estado',
                    key: 'estado',
                  },
                  {
                    titulo: 'Acciones',
                    key: 'acciones',
                    render: (carrera) => (
                      <div className="d-flex align-items-center gap-1">
                        <Button
                          type="button"
                          variant="light"
                          size="sm"
                          onClick={() => verCarrera(carrera.id)}
                          title="Ver detalle"
                          aria-label={`Ver detalle de ${carrera.nombre}`}
                        >
                          👁
                        </Button>

                        {carrera.estado === 'Finalizada' ? (
                          <Button
                            type="button"
                            variant="light"
                            size="sm"
                            onClick={() => verRanking(carrera.id)}
                            title="Ver ranking"
                            aria-label={`Ver ranking de ${carrera.nombre}`}
                          >
                            🏆
                          </Button>
                        ) : null}
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
    </Container>
  )
}

export default Carreras
