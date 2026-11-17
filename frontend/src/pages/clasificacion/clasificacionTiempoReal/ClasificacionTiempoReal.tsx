//frontend/src/pages/clasificacion/clasificacionTiempoReal/ClasificacionTiempoReal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRutasClasificacion } from '../../../hooks/useRutasClasificacion';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, ProgressBar, Row } from 'react-bootstrap';
import { Layers, Pencil, Search, UserMinus, UserX, Wifi } from 'lucide-react';
import { Tabla, type Columna } from '../../../components/tabla/Tabla';
import EstadoCarreraBadge from '../../../components/carrera/EstadoCarreraBadge';
import CargaManualModal from '../modales/CargaManualModal';
import DescalificarCorredorModal from '../modales/DescalificarCorredorModal';
import NoLargoCorredorModal from '../modales/NoLargoCorredorModal';
import { llegadasMock } from '../llegadasMock';
import { useCronometroCarrera } from '../../../hooks/useCronometroCarrera';
import type { EstadoClasificacion, LlegadaAtleta, ResumenCorredor } from '../../../types/clasificacion';
import { useDetalleCarrera } from '../../../hooks/useDetalleCarrera';
import { useCarreraActual } from '../../../hooks/useCarreraActual';

const badgeEstado: Record<LlegadaAtleta['estado'], { bg: string; text?: string }> = {
  OFICIAL: { bg: 'success-subtle', text: 'success-emphasis' },
  'EN REVISIÓN': { bg: 'warning-subtle', text: 'warning-emphasis' },
  DESCALIFICADO: { bg: 'danger' },
  'NO LARGÓ': { bg: 'secondary-subtle', text: 'secondary-emphasis' },
};

const colorPuesto: Record<number, string> = { 1: 'text-success', 2: 'text-info', 3: 'text-warning' };

const estadoResumen: Record<LlegadaAtleta['estado'], EstadoClasificacion> = {
  OFICIAL: 'Oficial',
  'EN REVISIÓN': 'En revisión',
  DESCALIFICADO: 'Descalificado',
  'NO LARGÓ': 'No largó',
};

const aResumen = (llegada: LlegadaAtleta): ResumenCorredor => ({
  id: llegada.id,
  dorsal: `#${llegada.dorsal}`,
  nombre: llegada.apellidosNombres,
  dni: llegada.dni,
  categoria: llegada.categoria,
  estado: estadoResumen[llegada.estado],
});

// MOCK TEMPORAL
// TODO BACKEND: totales reales de la carrera
const resumenMock = { llegadas: 452, pendientes: 1048 };

const ClasificacionTiempoReal: React.FC = () => {
  const navigate = useNavigate();
  const rutas = useRutasClasificacion();

  // En Carreras la carrera ya terminó: sin cronómetro, antenas ni carga manual
  const finalizada = rutas.enCarreras;
  // Solo en Carreras (carrera finalizada) se consulta el detalle
  const { carrera } = useDetalleCarrera(finalizada ? rutas.carreraId : undefined);
  const carreraActual = useCarreraActual();
  const { estado, transcurrido } = useCronometroCarrera(carreraActual);

  const [llegadas, setLlegadas] = useState<LlegadaAtleta[]>(llegadasMock);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [mostrarCargaManual, setMostrarCargaManual] = useState(false);
  const [corredoresADescalificar, setCorredoresADescalificar] = useState<ResumenCorredor[]>([]);
  const [corredoresANoLargo, setCorredoresANoLargo] = useState<ResumenCorredor[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const seleccion = llegadas.filter((llegada) => seleccionados.includes(llegada.id));
  const descalificables = seleccion.filter((llegada) => llegada.estado !== 'DESCALIFICADO');

  // El backend rechaza marcar "No largó" a quien ya tiene resultado
  const noLargables = seleccion.filter(
    (llegada) => llegada.estado !== 'DESCALIFICADO' && llegada.estado !== 'NO LARGÓ'
  );

  const alternarSeleccion = (id: string) =>
    setSeleccionados((actuales) =>
      actuales.includes(id) ? actuales.filter((actual) => actual !== id) : [...actuales, id]
    );

  // Modificar: abre al primero y deja en cola a los demás (?siguientes=2,3)
  const handleModificarClasificacion = () => {
    if (seleccion.length === 0) return;
    const [primero, ...resto] = seleccion;
    const cola = resto.length > 0 ? `?siguientes=${resto.map((llegada) => llegada.id).join(',')}` : '';
    navigate(rutas.corredor(primero.id, cola));
  };

  const handleDescalificar = () => setCorredoresADescalificar(descalificables.map(aResumen));

  const confirmarDescalificacion = () => {
    const ids = corredoresADescalificar.map((corredor) => corredor.id);

    // TODO BACKEND: PATCH /api/clasificaciones/{id} con { estado: 'Descalificado' } por cada corredor
    setLlegadas((actuales) =>
      actuales.map((llegada) => (ids.includes(llegada.id) ? { ...llegada, estado: 'DESCALIFICADO' } : llegada))
    );
    setSeleccionados((actuales) => actuales.filter((id) => !ids.includes(id)));
    setAviso(
      ids.length === 1
        ? `Se descalificó a ${corredoresADescalificar[0].nombre}.`
        : `Se descalificaron ${ids.length} corredores.`
    );
    setCorredoresADescalificar([]);
  };

  const handleNoLargo = () => setCorredoresANoLargo(noLargables.map(aResumen));

  const confirmarNoLargo = () => {
  const ids = corredoresANoLargo.map((corredor) => corredor.id);

    // TODO BACKEND: PATCH /api/clasificaciones/{id} con { estado: 'No_largo' } por cada corredor
    setLlegadas((actuales) =>
      actuales.map((llegada) => (ids.includes(llegada.id) ? { ...llegada, estado: 'NO LARGÓ' } : llegada))
    );
    setSeleccionados((actuales) => actuales.filter((id) => !ids.includes(id)));
    setAviso(
      ids.length === 1
        ? `Se marcó como "No largó" a ${corredoresANoLargo[0].nombre}.`
        : `Se marcaron ${ids.length} corredores como "No largó".`
    );
    setCorredoresANoLargo([]);
  };

  const llegadasFiltradas = llegadas.filter((llegada) => {
    const termino = busqueda.toLowerCase().trim();
    return (
      llegada.dorsal.toLowerCase().includes(termino) ||
      llegada.dni.includes(termino) ||
      llegada.apellidosNombres.toLowerCase().includes(termino)
    );
  });

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
      render: (atleta) => <strong className={colorPuesto[atleta.puesto] ?? ''}>{atleta.puesto}</strong>,
    },
    { titulo: 'DORSAL', key: 'dorsal', render: (atleta) => <strong>{atleta.dorsal}</strong> },
    { titulo: 'CORREDOR', key: 'apellidosNombres', render: (atleta) => <span className="fw-semibold">{atleta.apellidosNombres}</span> },
    { titulo: 'DNI', key: 'dni', render: (atleta) => <span className="text-secondary">{atleta.dni}</span> },
    { titulo: 'CATEGORÍA', key: 'categoria' },
    { titulo: 'TIEMPO', key: 'tiempo', render: (atleta) => <strong className="font-monospace">{atleta.tiempo}</strong> },
    {
      titulo: 'ESTADO',
      key: 'estado',
      render: (atleta) => {
        const { bg, text } = badgeEstado[atleta.estado];
        return <Badge pill bg={bg} text={text}>{atleta.estado}</Badge>;
      },
    },
  ];

  const llegadasTotales = carrera ? carrera.cantidadClasificados : resumenMock.llegadas;
  const pendientesTotales = carrera ? carrera.cantidadInscriptos - carrera.cantidadClasificados : resumenMock.pendientes;
  const progreso = Math.round((llegadasTotales / (llegadasTotales + pendientesTotales)) * 100);

 return (
    <Container fluid="xl" className="py-4">
      {aviso && (
        <Alert variant="success" dismissible onClose={() => setAviso(null)}>
          {aviso}
        </Alert>
      )}

      {/* Cabecera */}
      <header className="mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
          <h1 className="h2 fw-bold mb-0">
            {carrera ? `Clasificación de ${carrera.nombre}` : 'Clasificación de la carrera Tres Ciudades'}
          </h1>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(rutas.dashboard)}>
            Volver a Dashboard de Clasificación
          </Button>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <EstadoCarreraBadge estado={finalizada ? 'finalizada' : estado} />
          {!finalizada && <span className="fs-3 fw-bold font-monospace">{transcurrido}</span>}
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
              Modificar clasificación{seleccion.length > 0 && ` (${seleccion.length})`}
            </Button>

            <Button
              variant="outline-secondary"
              className="d-inline-flex align-items-center gap-2"
              disabled={noLargables.length === 0}
              onClick={handleNoLargo}
            >
              <UserMinus size={15} aria-hidden="true" />
              No largó{noLargables.length > 0 && ` (${noLargables.length})`}
            </Button>

            <Button
              variant="outline-danger"
              className="d-inline-flex align-items-center gap-2"
              disabled={descalificables.length === 0}
              onClick={handleDescalificar}
            >
              <UserX size={15} aria-hidden="true" />
              Descalificar{descalificables.length > 0 && ` (${descalificables.length})`}
            </Button>

            {seleccion.length === 0 && (
              <span className="small text-secondary">Tilde corredores para modificar, descalificar o marcar como "No largó".</span>
            )}
          </div>
        </header>

        {/* Llegadas recientes */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h6 fw-bold mb-0">{finalizada ? 'Clasificación final' : 'Llegadas Recientes'}</h2>
            <InputGroup size="sm" className="w-auto">
              <InputGroup.Text className="bg-white">
                <Search size={14} aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar dorsal o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </InputGroup>
          </div>

          <Tabla
            columnas={columnasLlegadas}
            datos={llegadasFiltradas}
            mensajeVacio="No se encontraron registros recientes."
            paginaActual={1}
            totalPaginas={1}
            onCambiarPagina={() => {}}
            textoPaginacion={`Mostrando ${llegadasFiltradas.length} resultados`}
          />
        </Card.Body>
      </Card>

      {/* Participantes y estado del sistema */}
      <Row className="g-3">
        <Col xs={12} md={finalizada ? 12 : 6}>
          <Card className="h-100">
            <Card.Body>
              <h3 className="h6 fw-bold mb-3">Participantes</h3>

              <div className="d-flex gap-4 mb-3">
                <div>
                  <small className="d-block fw-semibold text-secondary">Llegadas</small>
                  <span className="fs-3 fw-bold">{llegadasTotales.toLocaleString('es-AR')}</span>
                </div>
                <div>
                  <small className="d-block fw-semibold text-secondary">Pendientes</small>
                  <span className="fs-3 fw-bold">{pendientesTotales.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Progreso de Carrera</span>
                <strong>{progreso}%</strong>
              </div>
              <ProgressBar now={progreso} variant="success" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>

        {!finalizada && (
          <Col xs={12} md={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Estado del Sistema</h3>
                  <span className="d-inline-flex align-items-center gap-1 small fw-bold text-success">
                    <Wifi size={15} aria-hidden="true" />
                    Conectado
                  </span>
                </div>

                <Alert variant="info" className="py-2">
                  <small className="d-block fw-bold">ÚLTIMA LECTURA</small>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Dorsal 1899</strong>
                    <small className="fw-semibold">hace 3s</small>
                  </div>
                </Alert>

                <ListGroup variant="flush" className="small">
                  <ListGroup.Item className="d-flex justify-content-between px-0 text-secondary">
                    <span>Antena 1</span>
                    <span className="fw-semibold text-success">OK (98%)</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0 text-secondary">
                    <span>Antena 2</span>
                    <span className="fw-semibold text-success">OK (95%)</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}
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

      {!finalizada && <CargaManualModal show={mostrarCargaManual} onCerrar={() => setMostrarCargaManual(false)} />}
    </Container>
  );
};

export default ClasificacionTiempoReal;