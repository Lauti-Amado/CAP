//frontend/src/components/clasificacion/ParticipantesCard.tsx
import { useState } from 'react'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'
import { ArrowRight, ChevronDown, ChevronUp, Search, Table as IconoTabla } from 'lucide-react'
import { Tabla, type Columna } from '../tabla/Tabla'
import type { ParticipanteClasificacion } from '../../types/clasificacion'
import '../../pages/clasificacion/DashboardClasificacion.css'

// Filas visibles antes de tocar "Ver todos". Con el mock (4 filas) se ve el efecto; subir a 10 con datos reales.
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

  const filtrados = participantes.filter((p) => {
    const coincideBusqueda =
      p.dorsal.includes(busqueda) ||
      p.dni.includes(busqueda) ||
      p.atleta.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado.toUpperCase()
    return coincideBusqueda && coincideEstado
  })

  const visibles = verTodos ? filtrados : filtrados.slice(0, FILAS_INICIALES)

  const columnas: Columna<ParticipanteClasificacion>[] = [
    {
      titulo: 'DORSAL',
      key: 'dorsal',
      render: (p) => <strong className="dc-dorsal">{p.dorsal}</strong>,
    },
    {
      titulo: 'ATLETA',
      key: 'atleta',
      render: (p) => (
        <div>
          <span className="dc-atleta__nombre">{p.atleta}</span>
          <span className="dc-atleta__dni">DNI {p.dni}</span>
        </div>
      ),
    },
    { titulo: 'CATEGORÍA', key: 'categoria' },
    {
      titulo: 'ESTADO/TIEMPO',
      key: 'estado',
      render: (p) => (
        <>
          {p.estado === 'PENDIENTE' && <span className="dc-pill dc-pill--gris">PENDIENTE</span>}
          {p.estado === 'EN CURSO' && <span className="dc-pill dc-pill--verde">EN CURSO</span>}
          {p.estado === 'LLEGADO' && (
            <>
              <span className="dc-pill dc-pill--verde">LLEGÓ</span>
              <div className="dc-tiempo">{p.tiempo}</div>
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
          <Button variant="link" size="sm" className="dc-link-accion" onClick={() => onVerClasificacion(p)}>
            {textoAccion} <ArrowRight size={12} aria-hidden="true" />
          </Button>
        ) : null,
    },
  ]

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
            <IconoTabla size={16} aria-hidden="true" /> Participantes
          </h2>

          <div className="d-flex gap-2">
            <InputGroup size="sm" className="dc-buscador">
              <InputGroup.Text className="bg-white">
                <Search size={14} aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar por DNI o Dorsal..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </InputGroup>

            <Form.Select
              size="sm"
              className="dc-filtro"
              value={filtroEstado}
              aria-label="Filtrar por estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Curso">En Curso</option>
              <option value="Llegado">Llegado</option>
            </Form.Select>
          </div>
        </div>

        <Tabla
          columnas={columnas}
          datos={visibles}
          mensajeVacio="No se encontraron participantes."
          paginaActual={1}
          totalPaginas={1}
          onCambiarPagina={() => {}}
          textoPaginacion={`Mostrando ${visibles.length} de ${filtrados.length} resultados`}
        />

        {filtrados.length > FILAS_INICIALES && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100 mt-3 d-inline-flex align-items-center justify-content-center gap-2"
            aria-expanded={verTodos}
            onClick={() => setVerTodos((actual) => !actual)}
          >
            {verTodos ? (
              <>
                <ChevronUp size={14} aria-hidden="true" /> Ver menos
              </>
            ) : (
              <>
                <ChevronDown size={14} aria-hidden="true" /> Ver todos ({filtrados.length})
              </>
            )}
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default ParticipantesCard