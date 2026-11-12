//frontend/src/pages/carreras/Carreras.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap'
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
    <Container
      fluid
      as="main"
      className="px-4 py-4"
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* =========================
          ENCABEZADO
      ========================= */}
      <header className="mb-4">
        <h1
          style={{
            margin: 0,
            fontSize: '30px',
            fontWeight: 700,
            color: '#172033',
          }}
        >
          Listado de Carreras
        </h1>
        <p
          className="mt-2 text-secondary"
          style={{
            margin: '10px 0 0',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          Consulta las carreras disponibles y configura sus clasificaciones.
        </p>
      </header>

      {/* =========================
          FILTROS Y VISTAS
      ========================= */}
      <Card
        as="section"
        className="mb-4 border shadow-none"
        style={{
          borderColor: '#e5e7eb',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
        }}
      >
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col xs={12} md>
              <Form.Control
                type="search"
                aria-label="Buscar carrera"
                placeholder="Buscar carrera..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  backgroundColor: '#F9F9FF',
                  borderColor: '#d1d5db',
                  borderRadius: '8px',
                  fontSize:'0.9rem',
                  padding: '9px 14px',
                }}
              />
            </Col>

            <Col xs={12} sm={6} md="auto">
              <Form.Select
                aria-label="Filtrar por año"
                value={filtroAnio}
                onChange={(e) => setFiltroAnio(e.target.value)}
                style={{
                  minWidth: '170px',
                  backgroundColor: '#F9F9FF',
                  borderColor: '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  padding: '9px 12px',
                  cursor: 'pointer',
                }}
              >
                <option value="todos">Todos los años</option>
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} sm={6} md="auto">
              <Form.Select
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{
                  minWidth: '170px',
                  backgroundColor: '#F9F9FF',
                  borderColor: '#d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                }}
              >
                <option value="todos">Todos los estados</option>
                {estadosDisponibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md="auto" className="d-flex justify-content-md-end">
              <ButtonGroup
                aria-label="Selector de vista"
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '7px',
                  overflow: 'hidden',
                }}
              >
                <Button
                  type="button"
                  variant="light"
                  className="px-3"
                  onClick={() => setVista('cards')}
                  aria-label="Vista de tarjetas"
                  aria-pressed={vista === 'cards'}
                  style={{
                    backgroundColor: vista === 'cards' ? '#dcfce7' : '#ffffff',
                    color: vista === 'cards' ? '#15803d' : '#4b5563',
                    fontWeight: vista === 'cards' ? 700 : 400,
                    border: 'none',
                    borderRadius: 0,
                    height: '38px',
                    width: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ▦
                </Button>
                <Button
                  type="button"
                  variant="light"
                  className="px-3"
                  onClick={() => setVista('tabla')}
                  aria-label="Vista de tabla"
                  aria-pressed={vista === 'tabla'}
                  style={{
                    backgroundColor: vista === 'tabla' ? '#dcfce7' : '#ffffff',
                    color: vista === 'tabla' ? '#15803d' : '#4b5563',
                    fontWeight: vista === 'tabla' ? 700 : 400,
                    border: 'none',
                    borderLeft: '1px solid #d1d5db',
                    borderRadius: 0,
                    height: '38px',
                    width: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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

                <div
                  className="d-flex justify-content-center align-items-center gap-2 mt-4 pb-2"
                >
                  <Button
                    type="button"
                    variant="outline-secondary"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((pagina) => pagina - 1)}
                    aria-label="Página anterior"
                    style={{
                      width: '34px',
                      height: '34px',
                      padding: 0,
                      borderRadius: '50%',
                      borderColor: '#d5ddd7',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                    }}
                  >
                    ‹
                  </Button>

                  {Array.from({ length: totalPaginas }, (_, index) => {
                    const pagina = index + 1
                    const activa = paginaActual === pagina

                    return (
                      <Button
                        key={pagina}
                        type="button"
                        onClick={() => setPaginaActual(pagina)}
                        aria-current={activa ? 'page' : undefined}
                        style={{
                          width: '34px',
                          height: '34px',
                          padding: 0,
                          borderRadius: '50%',
                          border: activa ? '1px solid #087f3d' : '1px solid #d5ddd7',
                          backgroundColor: activa ? '#087f3d' : '#ffffff',
                          color: activa ? '#ffffff' : '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: activa ? 700 : 400,
                        }}
                      >
                        {pagina}
                      </Button>
                    )
                  })}

                  <Button
                    type="button"
                    variant="outline-secondary"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((pagina) => pagina + 1)}
                    aria-label="Página siguiente"
                    style={{
                      width: '34px',
                      height: '34px',
                      padding: 0,
                      borderRadius: '50%',
                      borderColor: '#d5ddd7',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                    }}
                  >
                    ›
                  </Button>
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
