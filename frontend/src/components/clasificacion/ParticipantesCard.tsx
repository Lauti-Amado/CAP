
import { useState } from 'react'
import {
  Button,
  Card,
  Form,
  InputGroup,
  Row,
  Col,
  Badge,
} from 'react-bootstrap'

import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Table as IconoTabla,
} from 'lucide-react'

import { Tabla, type Columna } from '../tabla/Tabla'
import type { ParticipanteClasificacion } from '../../types/clasificacion'

// Cantidad de filas visibles inicialmente
const FILAS_INICIALES = 3

type ParticipantesCardProps = {
  participantes: ParticipanteClasificacion[]
  textoAccion?: string
  onVerClasificacion: (participante: ParticipanteClasificacion) => void
}

function ParticipantesCard({
  participantes,
  textoAccion = 'Ver clasificación',
  onVerClasificacion,
}: ParticipantesCardProps) {

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [verTodos, setVerTodos] = useState(false)

  // Filtrar participantes
  const filtrados = participantes.filter((p) => {
    const termino = busqueda.toLowerCase().trim()

    const coincideBusqueda =
      p.dorsal.toLowerCase().includes(termino) ||
      p.dni.toLowerCase().includes(termino) ||
      p.atleta.toLowerCase().includes(termino)

    const coincideEstado =
      filtroEstado === 'Todos' ||
      p.estado === filtroEstado.toUpperCase()

    return coincideBusqueda && coincideEstado
  })

  // Determinar filas visibles
  const visibles = verTodos
    ? filtrados
    : filtrados.slice(0, FILAS_INICIALES)

  // Columnas de la tabla
  const columnas: Columna<ParticipanteClasificacion>[] = [
    {
      titulo: 'DORSAL',
      key: 'dorsal',
      render: (p) => (
        <strong className="dc-dorsal">
          {p.dorsal}
        </strong>
      ),
    },
    {
      titulo: 'ATLETA',
      key: 'atleta',
      render: (p) => (
        <div className="d-flex flex-column">
          <span className="dc-atleta__nombre">
            {p.atleta}
          </span>
          <small className="text-muted">
            DNI {p.dni}
          </small>
        </div>
      ),
    },
    {
      titulo: 'CATEGORÍA',
      key: 'categoria',
    },
    {
      titulo: 'ESTADO/TIEMPO',
      key: 'estado',
      render: (p) => (
        <>
          {p.estado === 'PENDIENTE' && (
            <Badge bg="secondary">
              PENDIENTE
            </Badge>
          )}

          {p.estado === 'EN CURSO' && (
            <Badge bg="success">
              EN CURSO
            </Badge>
          )}

          {p.estado === 'LLEGADO' && (
            <>
              <Badge bg="success">
                LLEGÓ
              </Badge>
              <div className="dc-tiempo mt-1">
                {p.tiempo}
              </div>
            </>
          )}
        </>
      ),
    },
    {
      titulo: 'ACCIÓN',
      key: 'accion',
      render: (p) =>
        p.estado === 'LLEGADO' ? (
          <Button
            variant="link"
            size="sm"
            className="dc-link-accion text-decoration-none"
            onClick={() => onVerClasificacion(p)}
          >
            {textoAccion}
            <ArrowRight
              size={12}
              className="ms-1"
              aria-hidden="true"
            />
          </Button>
        ) : null,
    },
  ]

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>

        {/* Encabezado */}
        <Row className="align-items-center g-3 mb-3">
          <Col xs={12} md>
            <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
              <IconoTabla size={16} aria-hidden="true" />
              Participantes
            </h2>
          </Col>

          {/* Buscador y filtro */}
          <Col xs={12} md="auto">
            <Row className="g-2">

              <Col xs={12} sm="auto">
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <Search size={14} aria-hidden="true" />
                  </InputGroup.Text>

                  <Form.Control
                    type="text"
                    placeholder="Buscar por DNI o dorsal..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value)
                      setVerTodos(false)
                    }}
                    aria-label="Buscar participante"
                  />
                </InputGroup>
              </Col>

              <Col xs={12} sm="auto">
                <Form.Select
                  size="sm"
                  value={filtroEstado}
                  aria-label="Filtrar por estado"
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setVerTodos(false)
                  }}
                >
                  <option value="Todos">Estado: Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Curso">En Curso</option>
                  <option value="Llegado">Llegado</option>
                </Form.Select>
              </Col>

            </Row>
          </Col>
        </Row>

        {/* Tabla de participantes */}
        <Tabla
          columnas={columnas}
          datos={visibles}
          mensajeVacio="No se encontraron participantes."
          paginaActual={1}
          totalPaginas={1}
          onCambiarPagina={() => {}}
          textoPaginacion={`Mostrando ${visibles.length} de ${filtrados.length} resultados`}
        />

        {/* Botón ver todos */}
        {filtrados.length > FILAS_INICIALES && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
            aria-expanded={verTodos}
            onClick={() => setVerTodos((actual) => !actual)}
          >
            {verTodos ? (
              <>
                <ChevronUp size={14} aria-hidden="true" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown size={14} aria-hidden="true" />
                Ver todos ({filtrados.length})
              </>
            )}
          </Button>
        )}

      </Card.Body>
    </Card>
  )
}

export default ParticipantesCard
