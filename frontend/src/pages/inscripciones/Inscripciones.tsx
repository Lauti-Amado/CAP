//frontend/src/pages/inscripciones/Inscripciones.tsx

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Col, Container, Form, InputGroup, Row, Alert,} from 'react-bootstrap'
import { Eye, UserRoundPlus, Search, Undo2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Tabla, type Columna } from '../../components/tabla/Tabla'
import { useCarrera } from '../../context/CarreraContext'
import { obtenerInscripciones } from '../../services/inscripcionService'
import { filtrosInscripcionesSchema } from '../../schemas/inscripcionFiltrosSchema'
import type { FiltrosInscripcionesForm } from '../../schemas/inscripcionFiltrosSchema'

import type {
  InscripcionListadoDTO,
  FiltrosListadoInscripciones,
  EstadoInscripcionBackend,
} from '../../types/inscripcion'

const INSCRIPCIONES_POR_PAGINA = 10

const filtrosIniciales: FiltrosInscripcionesForm = {
  dni: '',
  carreraId: '',
  kilometraje: '',
  tipoDistancia: '',
  pago: '',
  estado: '',
  anio: '',
}

const colorPago: Record<string, string> = {
  Pagado: 'success',
  Pendiente: 'warning',
}

const colorEstado: Record<EstadoInscripcionBackend, string> = {
  En_proceso: 'warning',
  Pagada: 'success',
  Confirmada: 'primary',
  Anulada: 'danger',
}

const nombreEstado: Record<EstadoInscripcionBackend, string> = {
  En_proceso: 'En proceso',
  Pagada: 'Pagada',
  Confirmada: 'Confirmada',
  Anulada: 'Anulada',
}

function Pill({ texto, color = 'secondary' }: { texto: string; color?: string }) {
  return (
    <Badge pill bg={`${color}-subtle`} text={`${color}-emphasis`}>
      {texto}
    </Badge>
  )
}

function Inscripciones() {
  const navigate = useNavigate()
  const location = useLocation()
  const { nombreCarrera } = useParams()
  const { carreras } = useCarrera()

  // Filtros (formulario validado con el mismo criterio que el backend)
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FiltrosInscripcionesForm>({
    resolver: zodResolver(filtrosInscripcionesSchema),
    mode: 'onChange',
    defaultValues: filtrosIniciales,
  })

  const [dni, carreraId, kilometraje, tipoDistancia, pago, estado, anio] = watch([
    'dni',
    'carreraId',
    'kilometraje',
    'tipoDistancia',
    'pago',
    'estado',
    'anio',
  ])

  const [paginaActual, setPaginaActual] = useState(1)

  // Cada vez que cambia un filtro se vuelve a la primera página
  const volverAPrimeraPagina = () => setPaginaActual(1)

  // Datos del backend
  const [inscripciones, setInscripciones] = useState<InscripcionListadoDTO[]>([])
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Opciones de distancia obtenidas de las carreras
  const distancias = useMemo(() => {
    return [
      ...new Set(
        carreras.flatMap((carrera) =>
          carrera.distancias.map((distancia) => distancia.kilometraje)
        )
      ),
    ].sort((a, b) => a - b)
  }, [carreras])

  // Parámetros que se envían al backend. Si algún filtro es inválido no se consulta
  // (el formulario muestra el error) para no mandar al backend un pedido que va a rechazar.
  const filtros = useMemo<FiltrosListadoInscripciones | null>(() => {
    const validacion = filtrosInscripcionesSchema.safeParse({
      dni,
      carreraId,
      kilometraje,
      tipoDistancia,
      pago,
      estado,
      anio,
    })

    if (!validacion.success) return null

    const datos = validacion.data

    return {
      ...(datos.carreraId ? { carreraId: datos.carreraId } : {}),
      ...(datos.dni ? { dni: datos.dni } : {}),
      ...(datos.kilometraje ? { kilometraje: Number(datos.kilometraje) } : {}),
      ...(datos.tipoDistancia ? { tipoDistancia: datos.tipoDistancia } : {}),
      ...(datos.pago !== '' ? { pagado: datos.pago === 'true' } : {}),
      ...(datos.estado ? { estado: datos.estado } : {}),
      ...(datos.anio ? { anio: Number(datos.anio) } : {}),
      pagina: paginaActual,
      limite: INSCRIPCIONES_POR_PAGINA,
    }
  }, [
    carreraId,
    dni,
    kilometraje,
    tipoDistancia,
    pago,
    estado,
    anio,
    paginaActual,
  ])

  // Consulta al backend cada vez que cambian los filtros o la página
  useEffect(() => {
    if (!filtros) return

    let cancelado = false

    async function cargarInscripciones(filtrosActuales: FiltrosListadoInscripciones) {
      try {
        setCargando(true)
        setError(null)

        const resultado = await obtenerInscripciones(filtrosActuales)

        if (cancelado) return

        setInscripciones(resultado.datos)
        setTotal(resultado.total)
        setTotalPaginas(resultado.totalPaginas)
      } catch (err) {
        if (cancelado) return

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las inscripciones.'
        )
        setInscripciones([])
        setTotal(0)
        setTotalPaginas(1)
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    void cargarInscripciones(filtros)

    return () => {
      cancelado = true
    }
  }, [filtros])

  const columnas: Columna<InscripcionListadoDTO>[] = [
    {
      titulo: 'DNI',
      key: 'dni',
      render: (inscripcion) => inscripcion.corredor.dni,
    },
    {
      titulo: 'Corredor',
      key: 'corredor',
      render: (inscripcion) =>
        `${inscripcion.corredor.nombre} ${inscripcion.corredor.apellido}`,
    },
    {
      titulo: 'Carrera',
      key: 'carrera',
      render: (inscripcion) => inscripcion.carrera.nombre,
    },
    {
      titulo: 'Distancia',
      key: 'distancia',
      render: (inscripcion) => `${inscripcion.distancia.kilometraje}K`,
    },
    {
      titulo: 'Modalidad',
      key: 'tipoDistancia',
      render: (inscripcion) => inscripcion.distancia.tipoDistancia,
    },
    {
      titulo: 'Fecha',
      key: 'fechaHoraCreacion',
      render: (inscripcion) =>
        new Date(inscripcion.fechaHoraCreacion).toLocaleDateString('es-AR'),
    },
    {
      titulo: 'Pago',
      key: 'pago',
      render: (inscripcion) => {
        const texto = inscripcion.pago.pagado ? 'Pagado' : 'Pendiente'
        return <Pill texto={texto} color={colorPago[texto]} />
      },
    },
    {
      titulo: 'Estado',
      key: 'estado',
      render: (inscripcion) => (
        <Pill
          texto={nombreEstado[inscripcion.estado]}
          color={colorEstado[inscripcion.estado]}
        />
      ),
    },
    {
      titulo: 'Acciones',
      key: 'acciones',
      render: (inscripcion) => (
        <div className="d-flex flex-column align-items-center gap-1">
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            className="d-inline-flex p-1"
            aria-label="Ver detalle de inscripción"
            title="Ver detalle"
            onClick={() =>
              navigate(
                `/clasificador/entrega-kits/${nombreCarrera}/inscripciones/${inscripcion.id}`
              )
            }
          >
            <Eye size={13} />
          </Button>

          <Button
            type="button"
            variant="success"
            size="sm"
            className="rounded-pill px-3"
            onClick={() =>
              navigate(
                `/clasificador/entrega-kits/${nombreCarrera}/${encodeURIComponent(inscripcion.corredor.dni)}`,
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

  const handleIrAtras = () => {
    const pathVolver = location.pathname.replace(/\/inscripciones\/?$/, '/buscar-corredor');

    navigate({
      pathname: pathVolver,
      search: location.search,
    });
  };

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
            <InputGroup size="sm" hasValidation>
              <InputGroup.Text className="bg-white">
                <Search size={14} aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                inputMode="numeric"
                placeholder="Buscar por DNI"
                aria-label="Buscar por DNI"
                isInvalid={!!errors.dni}
                {...register('dni', { onChange: volverAPrimeraPagina })}
              />
              <Form.Control.Feedback type="invalid">{errors.dni?.message}</Form.Control.Feedback>
            </InputGroup>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              size="sm"
              aria-label="Filtrar por carrera"
              {...register('carreraId', { onChange: volverAPrimeraPagina })}
            >
              <option value="">Todas las carreras</option>
              {carreras.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              size="sm"
              aria-label="Filtrar por distancia"
              {...register('kilometraje', { onChange: volverAPrimeraPagina })}
            >
              <option value="">Todas las distancias</option>
              {distancias.map((km) => (
                <option key={km} value={km}>
                  {km}K
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              size="sm"
              aria-label="Filtrar por modalidad"
              {...register('tipoDistancia', { onChange: volverAPrimeraPagina })}
            >
              <option value="">Todas las modalidades</option>
              <option value="Participativa">Participativa</option>
              <option value="Competitiva">Competitiva</option>
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              size="sm"
              aria-label="Filtrar por pago"
              {...register('pago', { onChange: volverAPrimeraPagina })}
            >
              <option value="">Todos los pagos</option>
              <option value="true">Pagado</option>
              <option value="false">Pendiente</option>
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg>
            <Form.Select
              size="sm"
              aria-label="Filtrar por estado"
              {...register('estado', { onChange: volverAPrimeraPagina })}
            >
              <option value="">Todos los estados</option>
              <option value="En_proceso">En proceso</option>
              <option value="Pagada">Pagada</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Anulada">Anulada</option>
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} lg={1}>
            <Form.Control
              type="number"
              min={2000}
              max={2100}
              size="sm"
              placeholder="Año"
              aria-label="Filtrar por año"
              isInvalid={!!errors.anio}
              {...register('anio', { onChange: volverAPrimeraPagina })}
            />
            <Form.Control.Feedback type="invalid">{errors.anio?.message}</Form.Control.Feedback>
          </Col>
        </Row>
      </Form>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {cargando && (
        <p className="text-secondary small">Cargando inscripciones...</p>
      )}

      <Tabla
        columnas={columnas}
        datos={inscripciones}
        mensajeVacio={cargando ? 'Cargando...' : 'No se encontraron inscripciones.'}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiarPagina={setPaginaActual}
        mostrarNumeros={false}
        textoPaginacion={`Mostrando ${inscripciones.length} de ${total} inscripciones`}
      />
    </Container>
  )
}

export default Inscripciones