import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Form, InputGroup, ProgressBar, Row } from 'react-bootstrap';
import { AlertTriangle, ArrowRight, CalendarDays, ChevronRight, Clock, Flag, Footprints, MapPin, Pencil, Play, RotateCcw, Ruler, Search, Square, Table as IconoTabla, Users } from 'lucide-react';
import { Tabla, type Columna } from '../../components/tabla/Tabla';
import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge';
import FinalizarCarreraModal from './modales/FinalizarCarreraModal';
import CargaManualModal from './modales/CargaManualModal';
import { useCronometroCarrera } from '../../hooks/useCronometroCarrera';

interface ParticipanteClasificacion {
  id: number;
  dorsal: string;
  atleta: string;
  dni: string;
  categoria: string;
  estado: string;
  tiempo?: string;
}

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
  const { estado, transcurrido, iniciar, finalizar, reiniciar } = useCronometroCarrera();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [mostrarCargaManual, setMostrarCargaManual] = useState(false);

  const handleIniciarCarrera = () => {
    iniciar();
  };

  const handleReiniciarCarrera = () => {
    reiniciar();
  };

  const confirmarFinalizacion = () => {
    finalizar();
    setMostrarFinalizar(false);
  };

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
      render: (p) => <strong className="fs-6 text-dark">{p.dorsal}</strong>,
    },
    {
      titulo: 'ATLETA',
      key: 'atleta',
      render: (p) => (
        <div>
          <span className="d-block fw-bold text-dark">{p.atleta}</span>
          <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>DNI {p.dni}</span>
        </div>
      ),
    },
    { titulo: 'CATEGORÍA', key: 'categoria' },
    {
      titulo: 'ESTADO/TIEMPO',
      key: 'estado',
      render: (p) => (
        <>
          {p.estado === 'PENDIENTE' && (
            <span className="badge rounded-pill fw-bold px-2 py-1" style={{ backgroundColor: '#dbe4f5', color: '#475467', fontSize: '0.65rem' }}>
              PENDIENTE
            </span>
          )}
          {p.estado === 'EN CURSO' && (
            <span className="badge rounded-pill fw-bold px-2 py-1" style={{ backgroundColor: '#bbf7d0', color: '#166534', fontSize: '0.65rem' }}>
              EN CURSO
            </span>
          )}
          {p.estado === 'LLEGADO' && (
            <>
              <span className="badge rounded-pill fw-bold px-2 py-1 me-1" style={{ backgroundColor: '#bbf7d0', color: '#166534', fontSize: '0.65rem' }}>
                LLEGÓ
              </span>
              <div className="font-monospace fw-bold text-dark mt-1" style={{ fontSize: '0.8rem' }}>{p.tiempo}</div>
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
            className="p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
            style={{ color: '#087f3f', fontSize: '0.75rem' }}
            onClick={() => navigate(`/clasificador/clasificaciones/${nombreCarrera}/${p.id}`)}
          >
            Ver clasificación <ArrowRight size={12} aria-hidden="true" />
          </Button>
        ) : null,
    },
  ];

  return (
    <main className="p-4" style={{ minHeight: '100vh', backgroundColor: '#f8f9ff' }}>
      {/* Cabecera */}
      <header className="mb-4">
        <h1 className="mb-2 fw-extrabold text-dark" style={{ fontSize: '2rem', fontWeight: 800 }}>Dashboard de Clasificación</h1>
        <p className="mb-0 d-flex flex-wrap align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
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

      {/* Cronómetro */}
      <Card className="mb-4 shadow-sm" style={{ borderLeft: '4px solid #22c55e', borderRadius: '8px' }}>
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-4">
          <div>
            <EstadoCarreraBadge estado={estado} />
            <div className="mt-2 text-uppercase text-muted fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>TIEMPO DE CARRERA</div>
            <div className="fw-bold text-dark font-monospace" style={{ fontSize: '2.8rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{transcurrido}</div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {import.meta.env.DEV && estado !== 'sin-iniciar' && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-inline-flex align-items-center gap-1"
                onClick={handleReiniciarCarrera}
              >
                <RotateCcw size={12} aria-hidden="true" />
                Reiniciar (solo pruebas)
              </Button>
            )}

            {estado === 'sin-iniciar' && (
              <Button
                className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold text-white border-0"
                style={{ backgroundColor: '#16a34a' }}
                onClick={handleIniciarCarrera}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <Play size={14} fill="currentColor" aria-hidden="true" />
                INICIAR CARRERA
              </Button>
            )}

            {estado === 'en-curso' && (
              <div className="text-end">
                <Button
                  className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold text-white border-0"
                  style={{ backgroundColor: '#b91c1c' }}
                  onClick={() => setMostrarFinalizar(true)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#991b1b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                >
                  <Square size={13} fill="currentColor" aria-hidden="true" />
                  DETENER CARRERA
                </Button>
                <p className="d-flex align-items-center gap-1 mt-1 mb-0 text-danger text-start" style={{ fontSize: '0.72rem', maxWidth: '260px' }}>
                  <AlertTriangle size={12} className="flex-shrink-0" aria-hidden="true" />
                  Detener la carrera finalizará el cronómetro oficial.
                </p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Estadísticas */}
      <Row className="g-3 mb-4">
        {estadisticas.map(({ etiqueta, valor, icon: Icono }) => (
          <Col xs={6} lg={3} key={etiqueta}>
            <Card className="h-100 shadow-sm border" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-2 text-muted fw-semibold mb-2" style={{ fontSize: '0.8rem' }}>
                  <Icono size={15} aria-hidden="true" />
                  {etiqueta}
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '1.75rem' }}>{valor}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        <Col xs={6} lg={3}>
          <Card className="h-100 shadow-sm border" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2 text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>
                <span>Progreso</span>
                <strong className="text-dark">{progreso}%</strong>
              </div>
              <ProgressBar now={progreso} variant="success" style={{ height: 6 }} className="mt-3" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Participantes */}
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                  <IconoTabla size={16} aria-hidden="true" /> Participantes
                </h2>

                <div className="d-flex flex-wrap gap-2">
                  <InputGroup size="sm" style={{ maxWidth: '230px' }}>
                    <InputGroup.Text className="bg-white text-muted">
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
                    style={{ width: 'auto' }}
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
          <Card className="shadow-sm border" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-4">
              <h3 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>ACCIONES RÁPIDAS</h3>

              <div className="d-grid gap-3">
                <Button
                  className="d-flex align-items-center gap-3 p-3 text-white border-0 text-start w-100"
                  style={{ backgroundColor: '#16a34a', borderRadius: '8px' }}
                  onClick={() => navigate(`/clasificador/clasificaciones/${nombreCarrera}/tiempo-real`)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                >
                  <span className="d-inline-flex align-items-center justify-content-center rounded" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Clock size={16} aria-hidden="true" />
                  </span>
                  <span className="flex-grow-1 text-start">
                    <strong className="d-block small lh-sm">Clasificaciones en tiempo real</strong>
                    <span className="text-white-50" style={{ fontSize: '0.7rem' }}>Seguimiento en directo</span>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>


                <Button
                  variant="outline-secondary"
                  className="d-flex align-items-center gap-2 p-3 text-dark bg-white border text-start w-100"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setMostrarCargaManual(true)}
                >
                  <Pencil size={16} aria-hidden="true" className="text-muted" />
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