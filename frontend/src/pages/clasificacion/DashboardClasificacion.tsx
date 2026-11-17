
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  MapPin,
  Play,
  Ruler,
  Square,
} from 'lucide-react';

import EstadoCarreraBadge from '../../components/carrera/EstadoCarreraBadge';
import ParticipantesCard from '../../components/clasificacion/ParticipantesCard';
import EstadisticasClasificacion from '../../components/clasificacion/EstadisticasClasificacion';
import FinalizarCarreraModal from './modales/FinalizarCarreraModal';
import { useCronometroCarrera } from '../../hooks/useCronometroCarrera';
import { useAuth } from '../../context/AuthContext';
import { useCarrera } from '../../context/CarreraContext';
import { useCarreraActual } from '../../hooks/useCarreraActual';
import { ApiError } from '../../services/apiService';
import {
  iniciarCarrera,
  finalizarCarrera,
} from '../../services/carreraService';
import {
  obtenerClasificaciones,
  obtenerClasificacionTiempoReal,
  type ClasificacionDTO,
  type ResumenClasificacionDTO,
} from '../../services/clasificacionService';
import type { ParticipanteClasificacion } from '../../types/clasificacion';

const resumenInicial: ResumenClasificacionDTO = {
  participantes: 0,
  llegados: 0,
  pendientes: 0,
  noFinalizaron: 0,
  noLargaron: 0,
  descalificados: 0,
  progreso: 0,
};

const formatearTiempo = (milisegundos: number | null): string | undefined => {
  if (milisegundos === null) return undefined;

  const totalSegundos = Math.floor(milisegundos / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  return [horas, minutos, segundos]
    .map((valor) => String(valor).padStart(2, '0'))
    .join(':');
};

const mapearParticipante = (
  clasificacion: ClasificacionDTO,
  carreraEnCurso: boolean,
): ParticipanteClasificacion => {
  let estado: ParticipanteClasificacion['estado'];

  switch (clasificacion.estado) {
    case 'Finalizo':
      estado = 'LLEGADO';
      break;
    case 'Descalificado':
      estado = 'DESCALIFICADO';
      break;
    case 'No_finalizo':
      estado = 'NO FINALIZÓ';
      break;
    case 'No_largo':
      estado = 'NO LARGÓ';
      break;
    default:
      estado = carreraEnCurso ? 'EN CURSO' : 'PENDIENTE';
  }

  return {
    id: clasificacion.id,
    dorsal: clasificacion.dorsal
      ? `#${clasificacion.dorsal}`
      : '—',
    atleta: `${clasificacion.corredor.nombre} ${clasificacion.corredor.apellido}`,
    dni: clasificacion.corredor.dni,
    categoria: clasificacion.resultado?.categorias[0]?.nombre ?? '—',
    estado,
    tiempo: formatearTiempo(clasificacion.resultado?.tiempoLlegada ?? null),
  };
};

const DashboardClasificacion = () => {
  const navigate = useNavigate();
  const { nombreCarrera } = useParams();
  const { tieneRol } = useAuth();
  const { recargar } = useCarrera();
  const carrera = useCarreraActual();
  const { estado, transcurrido } = useCronometroCarrera(carrera);

  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [participantes, setParticipantes] = useState<ParticipanteClasificacion[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<ResumenClasificacionDTO>(resumenInicial);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);

  useEffect(() => {
    if (!carrera) return;

    let cancelado = false;

    const cargarDatos = async () => {
      setCargandoDatos(true);
      setErrorDatos(null);

      try {
        const [clasificaciones, tiempoReal] = await Promise.all([
          obtenerClasificaciones(carrera.id),
          obtenerClasificacionTiempoReal(carrera.id),
        ]);

        if (cancelado) return;

        setParticipantes(
          clasificaciones.map((clasificacion) =>
            mapearParticipante(
              clasificacion,
              carrera.estado === 'En_curso',
            ),
          ),
        );

        setEstadisticas(tiempoReal.resumen);
      } catch (e) {
        if (cancelado) return;

        setErrorDatos(
          e instanceof ApiError
            ? e.message
            : 'No se pudieron cargar los datos de clasificación.',
        );
      } finally {
        if (!cancelado) setCargandoDatos(false);
      }
    };

    void cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [carrera?.id, carrera?.estado]);

  const ejecutar = async (accion: (id: string) => Promise<unknown>) => {
    if (!carrera || procesando) return;

    setProcesando(true);
    setError(null);

    try {
      await accion(carrera.id);
      await recargar();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudo completar la acción.',
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleIniciarCarrera = () => void ejecutar(iniciarCarrera);

  const confirmarFinalizacion = async () => {
    await ejecutar(finalizarCarrera);
    setMostrarFinalizar(false);
  };

  if (!carrera) {
    return (
      <main className="p-4">
        <p className="text-secondary">No se encontró la carrera.</p>
      </main>
    );
  }

  const puedeIniciar =
    tieneRol('Administrador') && carrera.estado === 'Entrega_kits';

  const motivoNoIniciar = !tieneRol('Administrador')
    ? 'Solo un administrador puede iniciar la carrera.'
    : 'La carrera debe estar en etapa de entrega de kits.';

  const distanciaTexto = [...new Set(carrera.distancias.map((d) => d.kilometraje))]
    .sort((a, b) => a - b)
    .map((km) => `${km} km`)
    .join(' · ');

  const fechaTexto = new Date(carrera.fechaHoraCarrera).toLocaleDateString(
    'es-AR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );

  const lugarTexto = `${carrera.lugar.nombre}, ${carrera.lugar.localidad}`;

  return (
    <main
      className="p-4"
      style={{ minHeight: '100vh', backgroundColor: '#f8f9ff' }}
    >
      <header className="mb-4">
        <h1
          className="mb-2 text-dark"
          style={{ fontSize: '2rem', fontWeight: 800 }}
        >
          Dashboard de Clasificación
        </h1>

        <p
          className="mb-0 d-flex flex-wrap align-items-center gap-2 text-muted"
          style={{ fontSize: '0.85rem' }}
        >
          <span className="d-inline-flex align-items-center gap-1">
            <Ruler size={14} aria-hidden="true" />
            {distanciaTexto}
          </span>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <CalendarDays size={14} aria-hidden="true" />
            {fechaTexto}
          </span>
          <span aria-hidden="true">•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <MapPin size={14} aria-hidden="true" />
            {lugarTexto}
          </span>
        </p>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card
        className="mb-4 shadow-sm"
        style={{ borderLeft: '4px solid #22c55e', borderRadius: '8px' }}
      >
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-4">
          <div>
            <EstadoCarreraBadge estado={estado} />

            <div
              className="mt-2 text-uppercase text-muted fw-semibold"
              style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
            >
              TIEMPO DE CARRERA
            </div>

            <div
              className="fw-bold text-dark font-monospace"
              style={{
                fontSize: '2.8rem',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {transcurrido}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {estado === 'sin-iniciar' && (
              <div className="text-end">
                <Button
                  className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold text-white border-0"
                  style={{ backgroundColor: '#16a34a' }}
                  disabled={!puedeIniciar || procesando}
                  onClick={handleIniciarCarrera}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#15803d')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#16a34a')
                  }
                >
                  <Play size={14} fill="currentColor" aria-hidden="true" />
                  INICIAR CARRERA
                </Button>

                {!puedeIniciar && (
                  <p
                    className="mt-1 mb-0 text-muted text-start"
                    style={{ fontSize: '0.72rem', maxWidth: '260px' }}
                  >
                    {motivoNoIniciar}
                  </p>
                )}
              </div>
            )}

            {estado === 'en-curso' && (
              <div className="text-end">
                <Button
                  className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold text-white border-0"
                  style={{ backgroundColor: '#b91c1c' }}
                  onClick={() => setMostrarFinalizar(true)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#991b1b')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#b91c1c')
                  }
                  disabled={procesando}
                >
                  <Square size={13} fill="currentColor" aria-hidden="true" />
                  DETENER CARRERA
                </Button>

                <p
                  className="d-flex align-items-center gap-1 mt-1 mb-0 text-danger text-start"
                  style={{ fontSize: '0.72rem', maxWidth: '260px' }}
                >
                  <AlertTriangle
                    size={12}
                    className="flex-shrink-0"
                    aria-hidden="true"
                  />
                  Detener la carrera finalizará el cronómetro oficial.
                </p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {errorDatos && (
        <div className="alert alert-danger" role="alert">
          {errorDatos}
        </div>
      )}

      {cargandoDatos ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando clasificación...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <EstadisticasClasificacion
            participantes={estadisticas.participantes}
            llegados={estadisticas.llegados}
            pendientes={estadisticas.pendientes}
            progreso={estadisticas.progreso}
          />

          <Row className="g-4">
            <Col xs={12} lg={8}>
              <ParticipantesCard
                participantes={participantes}
                onVerClasificacion={(p) =>
                  navigate(
                    `/clasificador/clasificaciones/${nombreCarrera}/${p.id}`,
                  )
                }
              />
            </Col>

            <Col xs={12} lg={4}>
              <Card
                className="h-100 shadow-sm border"
                style={{ borderRadius: '8px' }}
              >
                <Card.Body className="d-flex flex-column p-4">
                  <h3
                    className="text-uppercase text-muted fw-bold mb-3"
                    style={{
                      fontSize: '0.7rem',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ACCIONES RÁPIDAS
                  </h3>

                  <Button
                    className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center gap-2 p-4 text-white border-0"
                    style={{
                      backgroundColor: '#16a34a',
                      borderRadius: '8px',
                      minHeight: '180px',
                    }}
                    onClick={() =>
                      navigate(
                        `/clasificador/clasificaciones/${nombreCarrera}/tiempo-real`,
                      )
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#15803d')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = '#16a34a')
                    }
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Clock size={28} aria-hidden="true" />
                    </span>

                    <strong className="fs-5">
                      Clasificaciones en tiempo real
                    </strong>

                    <span
                      className="text-white-50"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Seguimiento en directo
                    </span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <FinalizarCarreraModal
        show={mostrarFinalizar}
        nombreCarrera={carrera.nombre}
        tiempoTranscurrido={transcurrido}
        estadoActual="EN CURSO"
        onConfirmar={() => void confirmarFinalizacion()}
        onCancelar={() => setMostrarFinalizar(false)}
      />
    </main>
  );
};

export default DashboardClasificacion;
