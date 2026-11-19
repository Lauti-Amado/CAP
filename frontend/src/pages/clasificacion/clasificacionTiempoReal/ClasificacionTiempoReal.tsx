//frontend/src/pages/clasificacion/clasificacionTiempoReal/ClasificacionTiempoReal.tsx

import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  ProgressBar,
  Row,
  Spinner,
} from 'react-bootstrap'
import {
  Layers,
  Pencil,
  Search,
  UserMinus,
  UserX,
} from 'lucide-react'

import { Tabla, type Columna } from '../../../components/tabla/Tabla'
import EstadoCarreraBadge from '../../../components/carrera/EstadoCarreraBadge'
import CargaManualModal from '../modales/CargaManualModal'
import DescalificarCorredorModal from '../modales/DescalificarCorredorModal'
import NoLargoCorredorModal from '../modales/NoLargoCorredorModal'

import { useRutasClasificacion } from '../../../hooks/useRutasClasificacion'
import { useCronometroCarrera } from '../../../hooks/useCronometroCarrera'
import { useDetalleCarrera } from '../../../hooks/useDetalleCarrera'
import { useCarreraActual } from '../../../hooks/useCarreraActual'

import {
  cambiarEstadoClasificacion,
  obtenerClasificacionTiempoReal,
  type ClasificacionDTO,
  type ClasificacionTiempoRealDTO,
} from '../../../services/clasificacionService'

import type {
  LlegadaAtleta,
  ResumenCorredor,
} from '../../../types/clasificacion'

const badgeEstado: Record<
  LlegadaAtleta['estado'],
  { bg: string; text?: string }
> = {
  OFICIAL: { bg: 'success-subtle', text: 'success-emphasis' },
  'EN REVISIÓN': { bg: 'warning-subtle', text: 'warning-emphasis' },
  DESCALIFICADO: { bg: 'danger' },
  'NO LARGÓ': { bg: 'secondary-subtle', text: 'secondary-emphasis' },
}

const colorPuesto: Record<number, string> = {
  1: 'text-success',
  2: 'text-info',
  3: 'text-warning',
}

function formatearTiempo(tiempo: number | null): string {
  if (tiempo === null) return '—'

  const horas = Math.floor(tiempo / 3600000)
  const minutos = Math.floor((tiempo % 3600000) / 60000)
  const segundos = Math.floor((tiempo % 60000) / 1000)
  const milisegundos = tiempo % 1000

  return [
    String(horas).padStart(2, '0'),
    String(minutos).padStart(2, '0'),
    `${String(segundos).padStart(2, '0')}.${String(milisegundos).padStart(3, '0')}`,
  ].join(':')
}

function mapearLlegada(dto: ClasificacionDTO): LlegadaAtleta {
  let estado: LlegadaAtleta['estado']

  if (dto.estado === 'Descalificado') {
    estado = 'DESCALIFICADO'
  } else if (dto.estado === 'No_largo') {
    estado = 'NO LARGÓ'
  } else if (dto.resultado?.estado === 'En_revision') {
    estado = 'EN REVISIÓN'
  } else {
    estado = 'OFICIAL'
  }

  return {
    id: dto.id,
    puesto: dto.resultado?.puestoGeneral ?? 0,
    dorsal: dto.dorsal ?? 'Sin dorsal',
    apellidosNombres: `${dto.corredor.apellido}, ${dto.corredor.nombre}`,
    dni: dto.corredor.dni,
    categoria:
      dto.resultado?.categorias.map((categoria) => categoria.nombre).join(', ') ||
      'Sin categoría',
    tiempo: formatearTiempo(dto.resultado?.tiempoLlegada ?? null),
    estado,
    sexo: dto.corredor.sexo,
    club: '—',
    equipo: dto.equipo ?? '—',
  }
}

function aResumen(llegada: LlegadaAtleta): ResumenCorredor {
  const estados = {
    OFICIAL: 'Oficial',
    'EN REVISIÓN': 'En revisión',
    DESCALIFICADO: 'Descalificado',
    'NO LARGÓ': 'No largó',
  } as const

  return {
    id: llegada.id,
    dorsal: `#${llegada.dorsal}`,
    nombre: llegada.apellidosNombres,
    dni: llegada.dni,
    categoria: llegada.categoria,
    estado: estados[llegada.estado],
  }
}

const ClasificacionTiempoReal: React.FC = () => {
  const navigate = useNavigate()
  const rutas = useRutasClasificacion()
  const finalizada = rutas.enCarreras

  const carreraActual = useCarreraActual()
  const { carrera } = useDetalleCarrera(
    finalizada ? rutas.carreraId : undefined
  )

  const { estado, transcurrido } = useCronometroCarrera(carreraActual)

  const carreraId = carreraActual?.id ?? rutas.carreraId

  const [datos, setDatos] = useState<ClasificacionTiempoRealDTO | null>(null)
  const [llegadas, setLlegadas] = useState<LlegadaAtleta[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  const [mostrarCargaManual, setMostrarCargaManual] = useState(false)
  const [corredoresADescalificar, setCorredoresADescalificar] =
    useState<ResumenCorredor[]>([])
  const [corredoresANoLargo, setCorredoresANoLargo] =
    useState<ResumenCorredor[]>([])

  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarDatos = useCallback(async () => {
    if (!carreraId) {
      setError('No se pudo identificar la carrera.')
      setCargando(false)
      return
    }

    try {
      setCargando(true)
      setError(null)

      const respuesta = await obtenerClasificacionTiempoReal(carreraId, 100)

      setDatos(respuesta)
      setLlegadas(respuesta.llegadas.map(mapearLlegada))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las llegadas.'
      )
    } finally {
      setCargando(false)
    }
  }, [carreraId])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  const seleccion = llegadas.filter((llegada) =>
    seleccionados.includes(llegada.id)
  )

  const descalificables = seleccion.filter(
    (llegada) => llegada.estado !== 'DESCALIFICADO'
  )

  const noLargables = seleccion.filter(
    (llegada) =>
      llegada.estado !== 'DESCALIFICADO' &&
      llegada.estado !== 'NO LARGÓ'
  )

  const alternarSeleccion = (id: string) => {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((actual) => actual !== id)
        : [...actuales, id]
    )
  }

  const handleModificarClasificacion = () => {
    if (seleccion.length === 0) return

    const [primero, ...resto] = seleccion

    const cola =
      resto.length > 0
        ? `?siguientes=${resto.map((llegada) => llegada.id).join(',')}`
        : ''

    navigate(rutas.corredor(primero.id, cola))
  }

  const handleDescalificar = () => {
    setCorredoresADescalificar(descalificables.map(aResumen))
  }

  const confirmarDescalificacion = async () => {
    const ids = corredoresADescalificar.map((corredor) => corredor.id)

    try {
      setError(null)

      await Promise.all(
        ids.map((id) => cambiarEstadoClasificacion(id, 'Descalificado'))
      )

      await cargarDatos()

      setSeleccionados((actuales) =>
        actuales.filter((id) => !ids.includes(id))
      )

      setAviso(
        ids.length === 1
          ? `Se descalificó a ${corredoresADescalificar[0].nombre}.`
          : `Se descalificaron ${ids.length} corredores.`
      )

      setCorredoresADescalificar([])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron descalificar los corredores.'
      )
    }
  }

  const handleNoLargo = () => {
    setCorredoresANoLargo(noLargables.map(aResumen))
  }

  const confirmarNoLargo = async () => {
    const ids = corredoresANoLargo.map((corredor) => corredor.id)

    try {
      setError(null)

      await Promise.all(
        ids.map((id) => cambiarEstadoClasificacion(id, 'No_largo'))
      )

      await cargarDatos()

      setSeleccionados((actuales) =>
        actuales.filter((id) => !ids.includes(id))
      )

      setAviso(
        ids.length === 1
          ? `Se marcó como "No largó" a ${corredoresANoLargo[0].nombre}.`
          : `Se marcaron ${ids.length} corredores como "No largó".`
      )

      setCorredoresANoLargo([])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron actualizar los estados.'
      )
    }
  }

  const termino = busqueda.toLowerCase().trim()

  const llegadasFiltradas = llegadas.filter((llegada) =>
    llegada.dorsal.toLowerCase().includes(termino) ||
    llegada.dni.toLowerCase().includes(termino) ||
    llegada.apellidosNombres.toLowerCase().includes(termino)
  )

  const columnasLlegadas: Columna<LlegadaAtleta>[] = [
    {
      titulo: '',
      key: 'seleccion',
      render: (atleta) => (
        <div className="d-flex justify-content-center">
          <Form.Check.Input
            type="checkbox"
            className="m-0"
            style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
            aria-label={`Seleccionar a ${atleta.apellidosNombres}`}
            checked={seleccionados.includes(atleta.id)}
            onChange={() => alternarSeleccion(atleta.id)}
          />
        </div>
      ),
    },
    {
      titulo: 'PUESTO',
      key: 'puesto',
      render: (atleta) => (
        <strong className={colorPuesto[atleta.puesto] ?? ''}>
          {atleta.puesto || '—'}
        </strong>
      ),
    },
    {
      titulo: 'DORSAL',
      key: 'dorsal',
      render: (atleta) => <strong>{atleta.dorsal}</strong>,
    },
    {
      titulo: 'CORREDOR',
      key: 'apellidosNombres',
      render: (atleta) => (
        <span className="fw-semibold">{atleta.apellidosNombres}</span>
      ),
    },
    {
      titulo: 'DNI',
      key: 'dni',
      render: (atleta) => (
        <span className="text-secondary">{atleta.dni}</span>
      ),
    },
    { titulo: 'CATEGORÍA', key: 'categoria' },
    {
      titulo: 'TIEMPO',
      key: 'tiempo',
      render: (atleta) => (
        <strong className="font-monospace">{atleta.tiempo}</strong>
      ),
    },
    {
      titulo: 'ESTADO',
      key: 'estado',
      render: (atleta) => {
        const { bg, text } = badgeEstado[atleta.estado]
        return (
          <Badge pill bg={bg} text={text}>
            {atleta.estado}
          </Badge>
        )
      },
    },
  ]

  const resumen = datos?.resumen
  const llegadasTotales = resumen?.llegados ?? 0
  const pendientesTotales = resumen?.pendientes ?? 0
  const progreso = resumen?.progreso ?? 0

  const nombreCarrera =
    carrera?.nombre ?? carreraActual?.nombre ?? 'la carrera'

  return (
    <Container fluid="xl" className="py-4">
      {aviso && (
        <Alert variant="success" dismissible onClose={() => setAviso(null)}>
          {aviso}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <header className="mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
          <h1 className="h2 fw-bold mb-0">
            Clasificación de {nombreCarrera}
          </h1>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(rutas.dashboard)}
          >
            Volver a Dashboard de Clasificación
          </Button>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <EstadoCarreraBadge
            estado={finalizada ? 'finalizada' : estado}
          />
          {!finalizada && (
            <span className="fs-3 fw-bold font-monospace">
              {transcurrido}
            </span>
          )}
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {!finalizada && (
            <Button
              variant="outline-secondary"
              className="d-inline-flex align-items-center gap-2"
              onClick={() => setMostrarCargaManual(true)}
            >
              <Pencil size={15} aria-hidden="true" />
              Cargar tiempo manual
            </Button>
          )}

          <Button
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-2"
            disabled={seleccion.length === 0}
            onClick={handleModificarClasificacion}
          >
            <Layers size={15} aria-hidden="true" />
            Modificar clasificación
            {seleccion.length > 0 && ` (${seleccion.length})`}
          </Button>

          <Button
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-2"
            disabled={noLargables.length === 0}
            onClick={handleNoLargo}
          >
            <UserMinus size={15} aria-hidden="true" />
            No largó
            {noLargables.length > 0 && ` (${noLargables.length})`}
          </Button>

          <Button
            variant="outline-danger"
            className="d-inline-flex align-items-center gap-2"
            disabled={descalificables.length === 0}
            onClick={handleDescalificar}
          >
            <UserX size={15} aria-hidden="true" />
            Descalificar
            {descalificables.length > 0 && ` (${descalificables.length})`}
          </Button>

          {seleccion.length === 0 && (
            <span className="small text-secondary">
              Seleccioná corredores para modificar, descalificar o marcar como
              "No largó".
            </span>
          )}
        </div>
      </header>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h6 fw-bold mb-0">
              {finalizada ? 'Clasificación final' : 'Llegadas recientes'}
            </h2>

            <div className="d-flex gap-2">
              <InputGroup size="sm" className="w-auto">
                <InputGroup.Text>
                  <Search size={14} aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar dorsal o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>

              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => void cargarDatos()}
                disabled={cargando}
              >
                Actualizar
              </Button>
            </div>
          </div>

          {cargando ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="text-secondary mt-2 mb-0">
                Cargando llegadas...
              </p>
            </div>
          ) : (
            <Tabla
              columnas={columnasLlegadas}
              datos={llegadasFiltradas}
              mensajeVacio="No se encontraron llegadas."
              paginaActual={1}
              totalPaginas={1}
              onCambiarPagina={() => {}}
              textoPaginacion={`Mostrando ${llegadasFiltradas.length} de ${llegadas.length} llegadas recientes`}
            />
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h3 className="h6 fw-bold mb-3">Participantes</h3>

              <div className="d-flex flex-wrap gap-4 mb-3">
                <div>
                  <small className="d-block fw-semibold text-secondary">
                    Total participantes
                  </small>
                  <span className="fs-3 fw-bold">
                    {(resumen?.participantes ?? 0).toLocaleString('es-AR')}
                  </span>
                </div>

                <div>
                  <small className="d-block fw-semibold text-secondary">
                    Llegadas
                  </small>
                  <span className="fs-3 fw-bold">
                    {llegadasTotales.toLocaleString('es-AR')}
                  </span>
                </div>

                <div>
                  <small className="d-block fw-semibold text-secondary">
                    Pendientes
                  </small>
                  <span className="fs-3 fw-bold">
                    {pendientesTotales.toLocaleString('es-AR')}
                  </span>
                </div>

                <div>
                  <small className="d-block fw-semibold text-secondary">
                    No finalizaron
                  </small>
                  <span className="fs-3 fw-bold">
                    {(resumen?.noFinalizaron ?? 0).toLocaleString('es-AR')}
                  </span>
                </div>

                <div>
                  <small className="d-block fw-semibold text-secondary">
                    No largaron
                  </small>
                  <span className="fs-3 fw-bold">
                    {(resumen?.noLargaron ?? 0).toLocaleString('es-AR')}
                  </span>
                </div>

                <div>
                  <small className="d-block fw-semibold text-secondary">
                    Descalificados
                  </small>
                  <span className="fs-3 fw-bold">
                    {(resumen?.descalificados ?? 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Progreso de carrera</span>
                <strong>{progreso}%</strong>
              </div>

              <ProgressBar
                now={progreso}
                variant="success"
                style={{ height: 6 }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <DescalificarCorredorModal
        corredores={corredoresADescalificar}
        onConfirmar={confirmarDescalificacion}
        onCancelar={() => setCorredoresADescalificar([])}
      />

      <NoLargoCorredorModal
        corredores={corredoresANoLargo}
        onConfirmar={confirmarNoLargo}
        onCancelar={() => setCorredoresANoLargo([])}
      />

      {!finalizada && (
        <CargaManualModal
          show={mostrarCargaManual}
          onCerrar={() => setMostrarCargaManual(false)}
        />
      )}
    </Container>
  )
}

export default ClasificacionTiempoReal
