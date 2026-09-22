import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../componentes/Sidebar';
import './DashboardClasificacion.css'

const DashboardClasificacion = () => {
  const navigate = useNavigate();

  // Estados para los filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Funciones preparadas para la navegación futura
  const handleIniciarCarrera = () => console.log("Lógica para iniciar el cronómetro");
  const handleVerClasificacionTiempoReal = () =>  console.log("Lógica ir a clasificacion en tiempo real");
  const handleVerParticipantes = () =>  console.log("Lógica para ver participantes");
  const handleVerClasificacionCompleta = () =>  console.log("Lógica para ver clasificacion completa");

  // Participantes hardcodeados para la demostración
  const participantesMock = [
    { id: 1, dorsal: '#1042', atleta: 'Juan Pérez', dni: '38.456.789', categoria: 'M 30-34', estado: 'PENDIENTE' },
    { id: 2, dorsal: '#1043', atleta: 'María Gómez', dni: '39.123.456', categoria: 'F 25-29', estado: 'EN CURSO' },
    { id: 3, dorsal: '#1044', atleta: 'Carlos Ruiz', dni: '35.987.654', categoria: 'M 35-39', estado: 'LLEGADO', tiempo: '00:45:12' },
    { id: 4, dorsal: '#1045', atleta: 'Ana Silva', dni: '40.111.222', categoria: 'F 20-24', estado: 'PENDIENTE' },
  ];

  // Lógica dinámica de filtrado
  const participantesFiltrados = participantesMock.filter(p => {
    const coincideBusqueda = p.dorsal.includes(busqueda) || p.dni.includes(busqueda) || p.atleta.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado.toUpperCase();
    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="layout-container">
      {/* Asumimos que tu Sidebar ya maneja el estado activo de la pestaña "Clasificación" */}
      <Sidebar />
      
      <main className="main-content">
        {/* Topbar superior */}
        <header className="topbar">
          <div className="breadcrumb">
            CAP Gestión <span className="separator">&gt;</span> <strong>Clasificación carrera</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>
            <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
            <button className="profile-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
          </div>
        </header>

        {/* Contenido principal del Dashboard */}
        <div className="page-content dashboard-content">
          
          {/* Cabecera del Dashboard */}
          <div className="dashboard-header">
            <h1>Dashboard de Clasificación</h1>
            <p className="subtitle-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
              10 km <span className="dot">•</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              15 de septiembre de 2026 <span className="dot">•</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              La Plata
            </p>
          </div>

          {/* Tarjeta del Cronómetro Principal */}
          <div className="timer-main-card">
            <div className="timer-info">
              <span className="badge badge-light-green"><span className="pulse-dot"></span> EN CURSO</span>
              <span className="timer-label">TIEMPO DE CARRERA</span>
              <div className="timer-display">00:00:00</div>
            </div>
            <button className="btn btn-primary btn-large" onClick={handleIniciarCarrera}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              INICIAR CARRERA
            </button>
          </div>

          {/* Grid de Estadísticas */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Participantes</span>
              <span className="stat-value">1.248</span>
            </div>
            <div className="stat-card">
              <span className="stat-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg> Llegados</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-card">
              <span className="stat-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4v16M17 4v16M9 4v16M5 4v16"></path></svg> Pendientes</span>
              <span className="stat-value">1.248</span>
            </div>
            <div className="stat-card">
              <div className="progress-header">
                <span className="stat-label">Progreso</span>
                <span className="stat-value-small">0%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>

          {/* Layout de 2 Columnas (Tabla y Acciones) */}
          <div className="dashboard-columns">
            
            {/* Columna Izquierda: Tabla de Participantes */}
            <div className="participants-panel">
              <div className="panel-header">
                <h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> Participantes</h2>
                <div className="panel-filters">
                  <div className="search-input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                      type="text" 
                      placeholder="Buscar por DNI o Dorsal..." 
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)} 
                    />
                  </div>
                  <select 
                    className="filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Estado: Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Curso">En Curso</option>
                    <option value="Llegado">Llegado</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>DORSAL</th>
                      <th>ATLETA</th>
                      <th>CATEGORÍA</th>
                      <th>ESTADO/TIEMPO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantesFiltrados.length > 0 ? (
                      participantesFiltrados.map((p) => (
                        <tr key={p.id}>
                          <td className="dorsal-cell"><strong>{p.dorsal}</strong></td>
                          <td>
                            <div className="athlete-info">
                              <span className="athlete-name">{p.atleta}</span>
                              <span className="athlete-dni">DNI {p.dni}</span>
                            </div>
                          </td>
                          <td>{p.categoria}</td>
                          <td>
                            {p.estado === 'PENDIENTE' && <span className="badge badge-gray-solid">PENDIENTE</span>}
                            {p.estado === 'EN CURSO' && <span className="badge badge-light-green">EN CURSO</span>}
                            {p.estado === 'LLEGADO' && <strong>{p.tiempo}</strong>}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="empty-state">No se encontraron participantes.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Columna Derecha: Acciones Rápidas */}
            <div className="actions-panel">
              <h3 className="actions-title">ACCIONES RÁPIDAS</h3>
              <div className="actions-list">
                <button className="action-card primary-action" onClick={handleVerClasificacionTiempoReal}>
                  <div className="action-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <div className="action-text">
                      <strong>Clasificaciones en tiempo real</strong>
                      <span>Seguimiento en directo</span>
                    </div>
                  </div>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>

                <button className="action-card secondary-action" onClick={handleVerParticipantes}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <strong>Ver participantes</strong>
                </button>

                <button className="action-card secondary-action" onClick={handleVerClasificacionCompleta}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <strong>Ver clasificación completa</strong>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClasificacion;