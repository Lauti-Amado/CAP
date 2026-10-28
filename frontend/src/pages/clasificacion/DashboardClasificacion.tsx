//frontend/src/pages/clasificacion/DashboardClasificacion.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Form, InputGroup, ProgressBar, Row } from 'react-bootstrap';
import { AlertTriangle, ArrowRight, CalendarDays, ChevronRight, Clock, Flag, Footprints, MapPin, Pencil, Play, RotateCcw, Ruler, Search, Square, Table as IconoTabla, Users,} from 'lucide-react';
import './DashboardClasificacion.css';
import { Tabla, type Columna } from '../../components/tabla/Tabla';
import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge';
import FinalizarCarreraModal from './modales/FinalizarCarreraModal';
import CargaManualModal from './modales/CargaManualModal';
import { useCronometroCarrera } from '../../hooks/useCronometroCarrera';
//import { useAuth } from '../../context/AuthContext'; para cuando hagamos lo de admin con iniciar y finalizar

interface ParticipanteClasificacion {
  id: number;
  dorsal: string;
  atleta: string;
  dni: string;
  categoria: string;
  estado: string;
  tiempo?: string;
}

// MOCK TEMPORAL
// TODO BACKEND: datos reales de la carrera y de los participantes
const carreraMock = {
  nombre: 'CAP 10K 2026',
  distancia: '10 km',
  fecha: '15 de septiembre de 2026',
  lugar: 'La Plata',
};

const estadisticasMock = { participantes: 1248, llegados: 842 };

const participantesMock: ParticipanteClasificacion[] = [
  { id: 1, dorsal: '#1042', atleta: 'Juan Pérez', dni: '38.456.789', categoria: 'M 30-34', estado: 'PENDIENTE' },
  { id: 2, dorsal: '#1043', atleta: 'María Gómez', dni: '39.123.456', categoria: 'F 25-29', estado: 'EN CURSO' },
  { id: 3, dorsal: '#1044', atleta: 'Carlos Ruiz', dni: '35.987.654', categoria: 'M 35-39', estado: 'LLEGADO', tiempo: '00:45:12' },
  { id: 4, dorsal: '#1045', atleta: 'Ana Silva', dni: '40.111.222', categoria: 'F 20-24', estado: 'PENDIENTE' },
];

const formatear = (numero: number) => numero.toLocaleString('es-AR');

const DashboardClasificacion = () => {
  const navigate = useNavigate();
  const { nombreCarrera } = useParams();
  //const { tieneRol } = useAuth();
  //const esAdministrador = tieneRol('Administrador'); para cuando el iniciar y finalizar sea solo admin 
  const { estado, transcurrido, iniciar, finalizar, reiniciar } = useCronometroCarrera();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [mostrarCargaManual, setMostrarCargaManual] = useState(false);

  const handleIniciarCarrera = () => {
    // TODO BACKEND: PATCH /api/carreras/{id} con { estado: 'En_curso', fechaHoraCarrera: <ahora> }
    iniciar();
  };

  const handleReiniciarCarrera = () => {
  // TEMPORAL (solo pruebas): quitar cuando el estado de la carrera venga del backend
  reiniciar();
};

  const confirmarFinalizacion = () => {
    // TODO BACKEND: PATCH /api/carreras/{id} con { estado: 'Finalizada' }
    finalizar();
    setMostrarFinalizar(false);
  };

  // Estadísticas: antes de iniciar nadie llegó todavía
  const llegados = estado === 'sin-iniciar' ? 0 : estadisticasMock.llegados;
  const pendientes = estadisticasMock.participantes - llegados;
  const progreso = Math.round((llegados / estadisticasMock.participantes) * 100);

  const estadisticas = [
    { etiqueta: 'Participantes', valor: formatear(estadisticasMock.participantes), icon: Users },
    { etiqueta: 'Llegados', valor: formatear(llegados), icon: Flag },
    { etiqueta: 'Pendientes', valor: formatear(pendientes), icon: Footprints },
  ];

  const participantesFiltrados = participantesMock.filter((p) => {
    const coincideBusqueda =
      p.dorsal.includes(busqueda) ||
      p.dni.includes(busqueda) ||
      p.atleta.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado.toUpperCase();
    return coincideBusqueda && coincideEstado;
  });

  const columnasParticipantes: Columna<ParticipanteClasificacion>[] = [
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
          <Button
            variant="link"
            size="sm"
            className="dc-link-accion"
            onClick={() => navigate(`/clasificador/clasificaciones/${nombreCarrera}/${p.id}`)}
          >
            Ver clasificación <ArrowRight size={12} aria-hidden="true" />
          </Button>
        ) : null,
    },
  ];

  return (
    <main className="dc-pagina p-4">
      {/* Cabecera */}
      <header className="mb-3">
        <h1 className="dc-titulo mb-2">Dashboard de Clasificación</h1>
        <p className="dc-subtitulo mb-0">
          <span className="d-inline-flex align-items-center gap-1">
            <Ruler size={14} aria-hidden="true" /> {carreraMock.distancia}
          </span>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <CalendarDays size={14} aria-hidden="true" /> {carreraMock.fecha}
          </span>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <MapPin size={14} aria-hidden="true" /> {carreraMock.lugar}
          </span>
        </p>
      </header>

      {/* Cronómetro: cambia al iniciar y al finalizar */}
      <Card className="dc-timer mb-3">
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <EstadoCarreraBadge estado={estado} />
            <div className="dc-etiqueta mt-2">TIEMPO DE CARRERA</div>
            <div className="dc-cronometro">{transcurrido}</div>
          </div>

          {import.meta.env.DEV && estado !== 'sin-iniciar' && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="mt-2 d-inline-flex align-items-center gap-1"
              onClick={handleReiniciarCarrera}
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reiniciar (solo pruebas)
            </Button>
          )}

          {/* esAdmin &&*/estado === 'sin-iniciar' && (
            <Button
              variant="success"
              className="dc-btn-iniciar d-inline-flex align-items-center gap-2"
              onClick={handleIniciarCarrera}
            >
              <Play size={14} fill="currentColor" aria-hidden="true" />
              INICIAR CARRERA
            </Button>
          )}

          {/* esAdmin &&*/ estado === 'en-curso' && (
            <div className="text-end">
              <Button
                variant="danger"
                className="dc-btn-detener d-inline-flex align-items-center gap-2"
                onClick={() => setMostrarFinalizar(true)}
              >
                <Square size={13} fill="currentColor" aria-hidden="true" />
                DETENER CARRERA
              </Button>
              <p className="dc-aviso">
                <AlertTriangle size={12} className="flex-shrink-0" aria-hidden="true" />
                Detener la carrera finalizará el cronómetro oficial.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Estadísticas */}
      <Row className="g-3 mb-3">
        {estadisticas.map(({ etiqueta, valor, icon: Icono }) => (
          <Col xs={6} lg={3} key={etiqueta}>
            <Card className="dc-stat h-100">
              <Card.Body>
                <div className="dc-stat__etiqueta">
                  <Icono size={14} aria-hidden="true" />
                  {etiqueta}
                </div>
                <div className="dc-stat__valor">{valor}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        <Col xs={6} lg={3}>
          <Card className="dc-stat h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="dc-stat__etiqueta">Progreso</span>
                <strong>{progreso}%</strong>
              </div>
              <ProgressBar now={progreso} variant="success" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Participantes */}
        <Col xs={12} lg={8}>
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
                columnas={columnasParticipantes}
                datos={participantesFiltrados}
                mensajeVacio="No se encontraron participantes."
                paginaActual={1}
                totalPaginas={1}
                onCambiarPagina={() => {}}
                textoPaginacion={`Mostrando ${participantesFiltrados.length} resultados`}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Acciones rápidas */}
        <Col xs={12} lg={4}>
          <Card>
            <Card.Body>
              <h3 className="dc-etiqueta mb-3">ACCIONES RÁPIDAS</h3>

              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  className="dc-accion-principal d-flex align-items-center gap-3"
                  onClick={() => navigate(`/clasificador/clasificaciones/${nombreCarrera}/tiempo-real`)}
                >
                  <span className="dc-accion-icono">
                    <Clock size={16} aria-hidden="true" />
                  </span>
                  <span className="flex-grow-1 text-start">
                    <strong className="d-block small">Clasificaciones en tiempo real</strong>
                    <span className="dc-accion-sub">Seguimiento en directo</span>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>

                {/* TODO: navegar a la lista de participantes cuando exista la pantalla */}
                <Button variant="outline-secondary" className="d-flex align-items-center gap-2 text-start">
                  <Users size={15} aria-hidden="true" />
                  <strong className="small">Ver participantes</strong>
                </Button>

                <Button
                  variant="outline-secondary"
                  className="d-flex align-items-center gap-2 text-start"
                  onClick={() => setMostrarCargaManual(true)}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <strong className="small">Cargar tiempo manual</strong>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <FinalizarCarreraModal
        show={mostrarFinalizar}
        nombreCarrera={carreraMock.nombre}
        tiempoTranscurrido={transcurrido}
        estadoActual="EN CURSO"
        onConfirmar={confirmarFinalizacion}
        onCancelar={() => setMostrarFinalizar(false)}
      />

      <CargaManualModal show={mostrarCargaManual} onCerrar={() => setMostrarCargaManual(false)} />
    </main>
  );
};

export default DashboardClasificacion;