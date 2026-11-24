//frontend/src/components/clasificacion/ParticipantesCard.tsx
import {
  Button,
  Card,
  Form,
  InputGroup,
  Row,
  Col,
  Badge,
  Spinner,
} from 'react-bootstrap'

import {
  ArrowRight,
  Search,
  Table as IconoTabla,
} from 'lucide-react'

import { Tabla, type Columna } from '../tabla/Tabla'
import type { ParticipanteClasificacion } from '../../types/clasificacion'

type ParticipantesCardProps = {
  participantes: ParticipanteClasificacion[]
  textoAccion?: string
  onVerClasificacion: (participante: ParticipanteClasificacion) => void

  // Paginación real (controlada por el padre)
  paginaActual: number
  totalPaginas: number
  total: number
  onCambiarPagina: (p: number) => void

  // Filtros controlados por el padre
  busqueda: string
  onBusquedaChange: (v: string) => void
  filtroEstado: string
  onFiltroEstadoChange: (v: string) => void
  filtroDistancia: string
  onFiltroDistanciaChange: (v: string) => void
  filtroSexo: string
  onFiltroSexoChange: (v: string) => void

  cargando?: boolean
}

function ParticipantesCard({
  participantes,
  textoAccion = 'Ver clasificación',
  onVerClasificacion,
  paginaActual,
  totalPaginas,
  total,
  onCambiarPagina,
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroDistancia,
  onFiltroDistanciaChange,
  filtroSexo,
  onFiltroSexoChange,
  cargando = false,
}: ParticipantesCardProps) {

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
          
          {p.estado === 'DESCALIFICADO' && (
            <Badge bg="danger">DESCALIFICADO</Badge>
          )}

          {p.estado === 'NO FINALIZÓ' && (
            <Badge bg="warning" text="dark">NO FINALIZÓ</Badge>
          )}

          {p.estado === 'NO LARGÓ' && (
            <Badge bg="secondary">NO LARGÓ</Badge>
          )}
          
        </>
      ),
    },
    {
      titulo: 'ACCIÓN',
      key: 'accion',
      render: (p) =>
        p.estado !== 'DESCALIFICADO' ? (
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
              {cargando && <Spinner animation="border" size="sm" className="ms-2" />}
            </h2>
          </Col>

          {/* Buscador y filtros */}
          <Col xs={12} md="auto">
            <Row className="g-2">

              <Col xs={12} sm="auto">
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <Search size={14} aria-hidden="true" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar nombre, DNI o dorsal..."
                    value={busqueda}
                    onChange={(e) => onBusquedaChange(e.target.value)}
                    aria-label="Buscar participante"
                  />
                </InputGroup>
              </Col>

              <Col xs={12} sm="auto">
                <Form.Select
                  size="sm"
                  value={filtroEstado}
                  aria-label="Filtrar por estado"
                  onChange={(e) => onFiltroEstadoChange(e.target.value)}
                >
                  <option value="">Estado: Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Finalizo">Llegó</option>
                  <option value="No_finalizo">No finalizó</option>
                  <option value="No_largo">No largó</option>
                  <option value="Descalificado">Descalificado</option>
                </Form.Select>
              </Col>

              <Col xs={12} sm="auto">
                <Form.Select
                  size="sm"
                  value={filtroDistancia}
                  aria-label="Filtrar por distancia"
                  onChange={(e) => onFiltroDistanciaChange(e.target.value)}
                >
                  <option value="">Distancia: Todas</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="21">21 km</option>
                  <option value="42">42 km</option>
                </Form.Select>
              </Col>

              <Col xs={12} sm="auto">
                <Form.Select
                  size="sm"
                  value={filtroSexo}
                  aria-label="Filtrar por sexo"
                  onChange={(e) => onFiltroSexoChange(e.target.value)}
                >
                  <option value="">Sexo: Todos</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </Form.Select>
              </Col>

            </Row>
          </Col>
        </Row>

        {/* Tabla de participantes */}
        <Tabla
          columnas={columnas}
          datos={participantes}
          mensajeVacio="No se encontraron participantes."
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
          textoPaginacion={`Mostrando ${participantes.length} de ${total} participantes`}
        />

      </Card.Body>
    </Card>
  )
}

export default ParticipantesCard
