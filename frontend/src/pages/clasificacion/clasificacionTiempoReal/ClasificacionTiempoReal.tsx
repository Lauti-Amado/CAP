import React, { useState } from 'react';
import './ClasificacionTiempoReal.css';
import { useNavigate } from 'react-router-dom';

interface LlegadaAtleta {
  id: number;
  puesto: number;
  dorsal: string;
  apellidosNombres: string;
  dni: string;
  categoria: string;
  tiempo: string;
  estado: 'OFICIAL' | 'EN REVISIÓN';
}

const ClasificacionTiempoReal: React.FC = () => {
  const navigate = useNavigate();
  // Estado para la búsqueda en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // Acciones rápidas (mock)
  const handleCargarTiempoManual = () => console.log("Cargar tiempo manual");
  const handleModificarClasificacion = () => console.log("Modificar clasificación");
  const handleDescalificar = () => console.log("Descalificar corredor");

  // Datos mock de llegadas recientes basados en la interfaz
  const llegadasMock: LlegadaAtleta[] = [
    { id: 1, puesto: 1, dorsal: '1042', apellidosNombres: 'Martínez, Juan Pablo', dni: '32.456.789', categoria: 'M 30-34', tiempo: '00:45:12.105', estado: 'OFICIAL' },
    { id: 2, puesto: 2, dorsal: '856', apellidosNombres: 'López, Ana María', dni: '28.123.456', categoria: 'F 35-39', tiempo: '00:46:05.892', estado: 'OFICIAL' },
    { id: 3, puesto: 3, dorsal: '2105', apellidosNombres: 'Garcia, Carlos', dni: '40.987.654', categoria: 'M 20-24', tiempo: '00:46:42.331', estado: 'EN REVISIÓN' },
    { id: 4, puesto: 4, dorsal: '342', apellidosNombres: 'Rodriguez, Laura', dni: '35.654.321', categoria: 'F 25-29', tiempo: '00:47:10.050', estado: 'OFICIAL' },
    { id: 5, puesto: 5, dorsal: '1899', apellidosNombres: 'Fernández, Diego', dni: '25.333.222', categoria: 'M 40-44', tiempo: '00:47:28.901', estado: 'EN REVISIÓN' },
  ];

  // Lógica de filtrado de corredores
  const llegadasFiltradas = llegadasMock.filter(atleta => {
    const term = busqueda.toLowerCase().trim();
    return (
      atleta.dorsal.toLowerCase().includes(term) ||
      atleta.dni.includes(term) ||
      atleta.apellidosNombres.toLowerCase().includes(term)
    );
  });

  return (
    <div className="rt-container">

      <div className="rt-content">
        
        {/* Cabecera de la Carrera y Cronómetro */}
        <div className="rt-header-main">
          <div className="rt-title-row">
            <h1>Clasificación de la carrera Tres Ciudades</h1>
            <button 
              className="rt-btn-action" 
              onClick={() => navigate('/dashboard-clasificacion')}
            >Volver a Dashboard de Clasificación</button>
          </div>
          <div className="rt-timer-status-row">
            <span className="badge badge-light-green"><span className="pulse-dot"></span> EN CURSO</span>
            <span className="rt-timer-clock">00:47:32.284</span>
          </div>

          {/* Botones de acción rápida superior */}
          <div className="rt-action-buttons">
            <button className="rt-btn-action" onClick={handleCargarTiempoManual}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Cargar tiempo manual
            </button>
            <button className="rt-btn-action" onClick={handleModificarClasificacion}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              Modificar clasificación
            </button>
            <button className="rt-btn-action rt-btn-danger" onClick={handleDescalificar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Descalificar
            </button>
          </div>
        </div>

        {/* Sección de Llegadas Recientes */}
        <div className="rt-table-card">
          <div className="rt-table-header-row">
            <h2>Llegadas Recientes</h2>
            <div className="rt-search-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Buscar dorsal o DNI..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="rt-table">
              <thead>
                <tr>
                  <th>PUESTO</th>
                  <th>DORSAL</th>
                  <th>CORREDOR</th>
                  <th>DNI</th>
                  <th>CATEGORÍA</th>
                  <th>TIEMPO</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {llegadasFiltradas.length > 0 ? (
                  llegadasFiltradas.map((atleta) => {
                    const esPodio = atleta.puesto <= 3;
                    return (
                      <tr key={atleta.id} className={esPodio ? 'rt-podium-row' : ''}>
                        <td className={`rt-puesto ${esPodio ? `puesto-${atleta.puesto}` : ''}`}>
                          <strong>{atleta.puesto}</strong>
                        </td>
                        <td><strong>{atleta.dorsal}</strong></td>
                        <td className="rt-runner-name">{atleta.apellidosNombres}</td>
                        <td className="rt-dni">{atleta.dni}</td>
                        <td>{atleta.categoria}</td>
                        <td className="rt-time"><strong>{atleta.tiempo}</strong></td>
                        <td>
                          {atleta.estado === 'OFICIAL' ? (
                            <span className="rt-badge-status status-oficial">OFICIAL</span>
                          ) : (
                            <span className="rt-badge-status status-revision">EN REVISIÓN</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="rt-empty">No se encontraron registros recientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Paneles Inferiores (Participantes y Estado del Sistema) */}
        <div className="rt-bottom-grid">
          
          {/* Panel de Participantes */}
          <div className="rt-card-box">
            <h3>Participantes</h3>
            <div className="rt-stats-row">
              <div className="rt-stat-item">
                <span className="rt-stat-label">Llegadas</span>
                <span className="rt-stat-val">452</span>
              </div>
              <div className="rt-stat-item">
                <span className="rt-stat-label">Pendientes</span>
                <span className="rt-stat-val">1,048</span>
              </div>
            </div>
            <div className="rt-progress-container">
              <div className="rt-prog-info">
                <span>Progreso de Carrera</span>
                <strong>30%</strong>
              </div>
              <div className="rt-progress-track">
                <div className="rt-progress-fill" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>

          {/* Panel de Estado del Sistema */}
          <div className="rt-card-box">
            <div className="rt-system-header">
              <h3>Estado del Sistema</h3>
              <span className="rt-rfid-status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
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
          </div>

        </div>

      </div>
    </div>
  );
};

export default ClasificacionTiempoReal;