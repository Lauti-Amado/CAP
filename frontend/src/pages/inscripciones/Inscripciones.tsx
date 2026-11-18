//frontend/src/pages/inscripciones/Inscripciones.tsx
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import { Eye, Trash2, UserRoundPlus, Search, Undo2 } from 'lucide-react'
import { Tabla, type Columna } from '../../components/tabla/Tabla'
import type { Inscripcion, /*FiltrosInscripciones*/ } from '../../types/inscripcion'

// MOCK TEMPORAL
import { inscripcionesMock } from './inscripcionesMock'

const INSCRIPCIONES_POR_PAGINA = 10

// "34.567.890" y "34567890" tienen que matchear
const soloDigitos = (valor: string) => valor.replace(/\D/g, '')

const colorTipo: Record<string, string> = { Socio: 'primary', 'No socio': 'secondary' }
const colorPago: Record<string, string> = { Pagado: 'success', Pendiente: 'warning' }
const colorEstado: Record<string, string> = { Confirmada: 'success', 'En Proceso': 'warning', Anulada: 'danger' }

function Pill({ texto, color = 'secondary' }: { texto: string; color?: string }) {
  return (
    <Badge pill bg={`${color}-subtle`} text={`${color}-emphasis`}>
      {texto}
    </Badge>
  )
}

function Inscripciones() {
  const [dni, setDni] = useState('')
  const [carrera, setCarrera] = useState('')
  const [distancia, setDistancia] = useState('')
  const [pago, setPago] = useState('')
  const [estado, setEstado] = useState('')
  const [anio, setAnio] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)

  const navigate = useNavigate()
  const location = useLocation();
  const { nombreCarrera } = useParams();

  const handleIrAtras = () => {
    const pathVolver = location.pathname.replace(/\/inscripciones\/?$/, '/buscar-corredor');

    navigate({
      pathname: pathVolver,
      search: location.search,
    });
  };

  // TODO BACKEND: usar filtros en la consulta real al backend
  /*const _filtros: FiltrosInscripciones = {
   dni,
   carrera,
   distancia,
   pago,
   estado,
   anio,
   pagina: paginaActual,
 } */

  // TODO: reemplazar por la consulta al backend
  // const resultado = await obtenerInscripciones(filtros)
  // const inscripciones = resultado.datos
  // const totalPaginas = resultado.totalPaginas

  const inscripcionesFiltradas = useMemo(() => {
    const dniBuscado = soloDigitos(dni)

    return inscripcionesMock.filter(
      (inscripcion) =>
        (dniBuscado === '' || soloDigitos(inscripcion.dni).includes(dniBuscado)) &&
        (carrera === '' || inscripcion.carrera === carrera) &&
        (distancia === '' || inscripcion.distancia === distancia) &&
        (pago === '' || inscripcion.pago === pago) &&
        (estado === '' || inscripcion.estado === estado) &&
        (anio === '' || inscripcion.fecha.slice(-4) === anio),
    )
  }, [dni, carrera, distancia, pago, estado, anio])

  const totalPaginas = Math.max(
    1,
    Math.ceil(inscripcionesFiltradas.length / INSCRIPCIONES_POR_PAGINA),
  )

  const inscripciones: Inscripcion[] = inscripcionesFiltradas.slice(
    (paginaActual - 1) * INSCRIPCIONES_POR_PAGINA,
    paginaActual * INSCRIPCIONES_POR_PAGINA,
  )

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
      render: (inscripcion) => <Pill texto={inscripcion.tipo} color={colorTipo[inscripcion.tipo]} />,
    },
    {
      titulo: 'Pago',
      key: 'pago',
      render: (inscripcion) => <Pill texto={inscripcion.pago} color={colorPago[inscripcion.pago]} />,
    },
    {
      titulo: 'Estado',
      key: 'estado',
      render: (inscripcion) => <Pill texto={inscripcion.estado} color={colorEstado[inscripcion.estado]} />,
    },
    {
      titulo: 'Acciones',
      key: 'acciones',
      render: (inscripcion: Inscripcion) => (
        <div className="d-flex flex-column align-items-center gap-1">
          <div className="d-flex gap-1">
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              className="d-inline-flex p-1"
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
              className="d-inline-flex p-1"
              aria-label="Eliminar inscripción"
              title="Eliminar inscripción"
            >
              <Trash2 size={13} />
            </Button>
          </div>

          <Button
            type="button"
            variant="success"
            size="sm"
            className="rounded-pill px-3"
            onClick={() =>
              navigate(
                `/clasificador/entrega-kits/${nombreCarrera}/${encodeURIComponent(inscripcion.dni)}`,
                { state: { desde: 'inscripciones' } }
              )
            }
          >
            Dar Kit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Container fluid className="p-4">
      <header className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Inscripciones</h1>
          <p className="small text-secondary mb-0">
            Gestiona las inscripciones de todas las carreras activas y publicadas.
          </p>
        </div>

        <div className='d-flex flex-column flex-sm-row gap-3'>
          <Button
            type="button"
            variant="secondary"
            className="d-inline-flex align-items-center justify-content-center gap-2"
            onClick={handleIrAtras}
          >
            <Undo2 size={15} />
            Volver a buscar corredor
          </Button>
          <Button
            type="button"
            variant="success"
            className="d-inline-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones/nueva`)}
          >
            <UserRoundPlus size={15} />
            Nueva inscripción
          </Button>
        </div>
      </header>

      <Form className="mb-3" onSubmit={(event) => event.preventDefault()}>
        <Row className="g-3 align-items-center">
          <Col xs={12} sm={6} lg={2}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-white">
                <Search size={14} aria-hidden="true" />
              </InputGroup.Text>
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
            </InputGroup>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              value={carrera}
              size='sm'
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
              size='sm'
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
              size='sm'
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
              size='sm'
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
              size='sm'
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

      <Tabla
        columnas={columnas}
        datos={inscripciones}
        mensajeVacio="No se encontraron inscripciones."
        paginaActual={paginaActual}
        // TODO: reemplazar cuando se integre el backend
        totalPaginas={totalPaginas}
        onCambiarPagina={setPaginaActual}
        mostrarNumeros={false}
        textoPaginacion={`Mostrando ${inscripciones.length} de ${inscripcionesFiltradas.length} inscripciones`}
      />
    </Container>
  )
}

export default Inscripciones
