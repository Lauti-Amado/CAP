//frontend/src/pages/clasificacion/DashboardClasificacion.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { AlertTriangle, CalendarDays, Clock, MapPin, Play, RotateCcw, Ruler, Square } from 'lucide-react';
import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge';
import ParticipantesCard from '../../components/clasificacion/ParticipantesCard';
import EstadisticasClasificacion from '../../components/clasificacion/EstadisticasClasificacion';
import FinalizarCarreraModal from './modales/FinalizarCarreraModal';
import { useCronometroCarrera } from '../../hooks/useCronometroCarrera';
import { participantesMock, estadisticasMock } from './participanteMock';

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
    <main className="p-4" style={{ minHeight: '100vh', backgroundColor: '#f8f9ff' }}>
      {/* Cabecera */}
      <header className="mb-4">
        <h1 className="mb-2 text-dark" style={{ fontSize: '2rem', fontWeight: 800 }}>Dashboard de Clasificación</h1>
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

      {/* Cronómetro: cambia al iniciar y al finalizar */}
      <Card className="mb-4 shadow-sm" style={{ borderLeft: '4px solid #22c55e', borderRadius: '8px' }}>
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-4">
          <div>
            <EstadoCarreraBadge estado={estado} />
            <div className="mt-2 text-uppercase text-muted fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              TIEMPO DE CARRERA
            </div>
            <div className="fw-bold text-dark font-monospace" style={{ fontSize: '2.8rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {transcurrido}
            </div>
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
      <EstadisticasClasificacion
        participantes={estadisticasMock.participantes}
        llegados={llegados}
        pendientes={pendientes}
        progreso={progreso}
      />

      <Row className="g-4">
        {/* Participantes */}
        <Col xs={12} lg={8}>
          <ParticipantesCard
            participantes={participantesMock}
            onVerClasificacion={(p) => navigate(`/clasificador/clasificaciones/${nombreCarrera}/${p.id}`)}
          />
        </Col>

        {/* Acciones rápidas */}
        <Col xs={12} lg={4}>
          <Card className="h-100 shadow-sm border" style={{ borderRadius: '8px' }}>
            <Card.Body className="d-flex flex-column p-4">
              <h3 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                ACCIONES RÁPIDAS
              </h3>

              <Button
                className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center gap-2 p-4 text-white border-0"
                style={{ backgroundColor: '#16a34a', borderRadius: '8px', minHeight: '180px' }}
                onClick={() => navigate(`/clasificador/clasificaciones/${nombreCarrera}/tiempo-real`)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Clock size={28} aria-hidden="true" />
                </span>
                <strong className="fs-5">Clasificaciones en tiempo real</strong>
                <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Seguimiento en directo</span>
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