//frontend/src/pages/clasificacion/clasificacionTiempoReal/ClasificacionTiempoReal.tsx
import React, { useState } from 'react';
import './ClasificacionTiempoReal.css';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, InputGroup, ProgressBar, Row } from 'react-bootstrap';
import { Layers, Pencil, Search, UserX, Wifi } from 'lucide-react';
import { Tabla, type Columna } from '../../../components/tabla/Tabla';
import EstadoCarreraBadge from '../../../components/carrera/EstadoCarreraBadge';
import CargaManualModal from '../modales/CargaManualModal';
import DescalificarCorredorModal from '../modales/DescalificarCorredorModal';
import { llegadasMock } from '../llegadasMock';
import { useCronometroCarrera } from '../../../hooks/useCronometroCarrera';
import type { LlegadaAtleta, ResumenCorredor } from '../../../types/clasificacion';

const aResumen = (llegada: LlegadaAtleta): ResumenCorredor => ({
  id: llegada.id,
  dorsal: `#${llegada.dorsal}`,
  nombre: llegada.apellidosNombres,
  dni: llegada.dni,
  categoria: llegada.categoria,
  estado:
    llegada.estado === 'OFICIAL' ? 'Oficial' : llegada.estado === 'EN REVISIÓN' ? 'En revisión' : 'Descalificado',
});

// MOCK TEMPORAL
// TODO BACKEND: totales reales de la carrera
const resumenMock = { llegadas: 452, pendientes: 1048 };

const ClasificacionTiempoReal: React.FC = () => {
  const navigate = useNavigate();
  const { estado, transcurrido } = useCronometroCarrera();

  const [llegadas, setLlegadas] = useState<LlegadaAtleta[]>(llegadasMock);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [mostrarCargaManual, setMostrarCargaManual] = useState(false);
  const [corredoresADescalificar, setCorredoresADescalificar] = useState<ResumenCorredor[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const seleccion = llegadas.filter((llegada) => seleccionados.includes(llegada.id));
  const descalificables = seleccion.filter((llegada) => llegada.estado !== 'DESCALIFICADO');

  const alternarSeleccion = (id: number) =>
    setSeleccionados((actuales) =>
      actuales.includes(id) ? actuales.filter((actual) => actual !== id) : [...actuales, id]
    );

  // Modificar: abre al primero y deja en cola a los demás (?siguientes=2,3)
  const handleModificarClasificacion = () => {
    if (seleccion.length === 0) return;
    const [primero, ...resto] = seleccion;
    const cola = resto.length > 0 ? `?siguientes=${resto.map((llegada) => llegada.id).join(',')}` : '';
    navigate(`/modificar-clasificacion/${primero.id}${cola}`);
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
        <Form.Check
          type="checkbox"
          className="rt-check"
          aria-label={`Seleccionar a ${atleta.apellidosNombres}`}
          checked={seleccionados.includes(atleta.id)}
          onChange={() => alternarSeleccion(atleta.id)}
        />
      ),
    },
    {
      titulo: 'PUESTO',
      key: 'puesto',
      render: (atleta) => (
        <span className={`rt-puesto ${atleta.puesto <= 3 ? `puesto-${atleta.puesto}` : ''}`}>
          <strong>{atleta.puesto}</strong>
        </span>
      ),
    },
    { titulo: 'DORSAL', key: 'dorsal', render: (atleta) => <strong>{atleta.dorsal}</strong> },
    { titulo: 'CORREDOR', key: 'apellidosNombres', render: (atleta) => <span className="rt-runner-name">{atleta.apellidosNombres}</span> },
    { titulo: 'DNI', key: 'dni', render: (atleta) => <span className="rt-dni">{atleta.dni}</span> },
    { titulo: 'CATEGORÍA', key: 'categoria' },
    { titulo: 'TIEMPO', key: 'tiempo', render: (atleta) => <span className="rt-time"><strong>{atleta.tiempo}</strong></span> },
    {
      titulo: 'ESTADO',
      key: 'estado',
      render: (atleta) => {
        if (atleta.estado === 'OFICIAL') return <span className="rt-badge-status status-oficial">OFICIAL</span>;
        if (atleta.estado === 'EN REVISIÓN') return <span className="rt-badge-status status-revision">EN REVISIÓN</span>;
        return <span className="rt-badge-status status-descalificado">DESCALIFICADO</span>;
      },
    },
  ];

  const progreso = Math.round((resumenMock.llegadas / (resumenMock.llegadas + resumenMock.pendientes)) * 100);

  return (
    <div className="rt-container">
      <div className="rt-content">
        {aviso && (
          <Alert variant="success" dismissible onClose={() => setAviso(null)}>
            {aviso}
          </Alert>
        )}

        {/* Cabecera */}
        <header className="mb-3">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
            <h1 className="rt-titulo">Clasificación de la carrera Tres Ciudades</h1>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard-clasificacion')}>
              Volver a Dashboard de Clasificación
            </Button>
          </div>

          <div className="d-flex align-items-center gap-3 mb-3">
            <EstadoCarreraBadge estado={estado} />
            <span className="rt-reloj">{transcurrido}</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <Button
              variant="outline-secondary"
              className="d-inline-flex align-items-center gap-2"
              onClick={() => setMostrarCargaManual(true)}
            >
              <Pencil size={15} aria-hidden="true" />
              Cargar tiempo manual
            </Button>

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
              variant="outline-danger"
              className="d-inline-flex align-items-center gap-2"
              disabled={descalificables.length === 0}
              onClick={handleDescalificar}
            >
              <UserX size={15} aria-hidden="true" />
              Descalificar{descalificables.length > 0 && ` (${descalificables.length})`}
            </Button>

            {seleccion.length === 0 && (
              <span className="small text-secondary">Tilde corredores para modificar o descalificar.</span>
            )}
          </div>
        </header>

        {/* Llegadas recientes */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="h6 fw-bold mb-0">Llegadas Recientes</h2>
              <InputGroup size="sm" className="rt-buscador">
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

            <div className="rt-tabla">
              <Tabla
                columnas={columnasLlegadas}
                datos={llegadasFiltradas}
                mensajeVacio="No se encontraron registros recientes."
                paginaActual={1}
                totalPaginas={1}
                onCambiarPagina={() => {}}
                textoPaginacion={`Mostrando ${llegadasFiltradas.length} resultados`}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Participantes y estado del sistema */}
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Card className="h-100">
              <Card.Body>
                <h3 className="h6 fw-bold mb-3">Participantes</h3>

                <div className="d-flex gap-4 mb-3">
                  <div>
                    <span className="rt-stat-label d-block">Llegadas</span>
                    <span className="rt-stat-val">{resumenMock.llegadas}</span>
                  </div>
                  <div>
                    <span className="rt-stat-label d-block">Pendientes</span>
                    <span className="rt-stat-val">{resumenMock.pendientes.toLocaleString('es-AR')}</span>
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

          <Col xs={12} md={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Estado del Sistema</h3>
                  <span className="rt-rfid-status d-inline-flex align-items-center gap-1">
                    <Wifi size={15} aria-hidden="true" />
                    Conectado
                  </span>
                </div>

                <div className="rt-last-read-box">
                  <span className="rt-read-title">ÚLTIMA LECTURA</span>
                  <div className="rt-read-detail">
                    <strong>Dorsal 1899</strong> <span className="rt-time-ago">hace 3s</span>
                  </div>
                </div>

                <div className="rt-antennas-status">
                  <div className="rt-antenna-row">
                    <span>Antena 1</span>
                    <span className="rt-ant-ok">OK (98%)</span>
                  </div>
                  <div className="rt-antenna-row">
                    <span>Antena 2</span>
                    <span className="rt-ant-ok">OK (95%)</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <CargaManualModal show={mostrarCargaManual} onCerrar={() => setMostrarCargaManual(false)} />

      <DescalificarCorredorModal
        corredores={corredoresADescalificar}
        onConfirmar={confirmarDescalificacion}
        onCancelar={() => setCorredoresADescalificar([])}
      />
    </div>
  );
};

export default ClasificacionTiempoReal;