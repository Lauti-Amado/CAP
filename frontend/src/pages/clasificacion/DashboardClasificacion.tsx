//frontend/src/pages/clasificacion/DashboardClasificacion.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { AlertTriangle, CalendarDays, Clock, MapPin, Play, RotateCcw, Ruler, Square } from 'lucide-react';
import './DashboardClasificacion.css';
import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge';
import ParticipantesCard from '../../components/clasificacion/ParticipantesCard';
import EstadisticasClasificacion from '../../components/clasificacion/EstadisticasClasificacion';
import FinalizarCarreraModal from './modales/FinalizarCarreraModal';
import { useCronometroCarrera } from '../../hooks/useCronometroCarrera';
import { participantesMock, estadisticasMock } from './participanteMock';
//import { useAuth } from '../../context/AuthContext'; para cuando hagamos lo de admin con iniciar y finalizar

// MOCK TEMPORAL
// TODO BACKEND: datos reales de la carrera y de los participantes
const carreraMock = {
  nombre: 'CAP 10K 2026',
  distancia: '10 km',
  fecha: '15 de septiembre de 2026',
  lugar: 'La Plata',
};

const DashboardClasificacion = () => {
  const navigate = useNavigate();
  const { nombreCarrera } = useParams();
  //const { tieneRol } = useAuth();
  //const esAdministrador = tieneRol('Administrador'); para cuando el iniciar y finalizar sea solo admin 
  const { estado, transcurrido, iniciar, finalizar, reiniciar } = useCronometroCarrera();

  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);

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
            <EstadisticasClasificacion
              participantes={estadisticasMock.participantes}
              llegados={llegados}
              pendientes={pendientes}
              progreso={progreso}
            />

      <Row className="g-3">
        {/* Participantes */}
                <Col xs={12} lg={8}>
                  <ParticipantesCard
                    participantes={participantesMock}
                    onVerClasificacion={(p) => navigate(`/clasificador/clasificaciones/${nombreCarrera}/${p.id}`)}
                  />
                </Col>

        {/* Acciones rápidas */}
        <Col xs={12} lg={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <h3 className="dc-etiqueta mb-3">ACCIONES RÁPIDAS</h3>

              <Button
                variant="success"
                className="dc-accion-principal dc-accion-principal--tile flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center gap-2"
                onClick={() => navigate(`/clasificador/clasificaciones/${nombreCarrera}/tiempo-real`)}
              >
                <span className="dc-accion-icono">
                  <Clock size={28} aria-hidden="true" />
                </span>
                <strong className="fs-5">Clasificaciones en tiempo real</strong>
                <span className="dc-accion-sub">Seguimiento en directo</span>
              </Button>
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
    </main>
  );
};

export default DashboardClasificacion;