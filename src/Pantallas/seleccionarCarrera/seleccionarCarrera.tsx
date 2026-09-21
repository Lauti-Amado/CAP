import React, {useState} from 'react';
import Sidebar from '../../componentes/Sidebar';
import './SeleccionarCarrera.css';

const SeleccionarCarrera = () => {

  const [busqueda, setBusqueda] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  return (
    <div className="layout-container">
      <Sidebar />
      
      <main className="main-content">
        {/* Topbar superior */}
        <header className="topbar">
          <div className="breadcrumb">
            CAP Gestión <span className="separator">&gt;</span> <strong>Seleccionar carrera</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>
            <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
            <button className="profile-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
          </div>
        </header>

        {/* Contenido de la página */}
        <div className="page-content">
          <div className="page-header">
            <h1>Seleccionar carrera</h1>
            <p>Seleccione la carrera que desea gestionar.</p>
          </div>

          {/* Sección Última Carrera */}
          <section className="section-block">
            <h2>Última carrera</h2>
            <div className="race-card highlighted-card">
              <div className="race-info">
                <div className="race-header">
                  <h3>CAP 10K 2026</h3>
                  <span className="badge badge-gray">FINALIZADA</span>
                </div>
                <div className="race-details">
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> 10 km</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 15 de septiembre de 2026</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> La Plata</span>
                </div>
                <p className="race-description">Acceda rápidamente a la carrera más reciente disponible.</p>
              </div>
              <button className="btn btn-primary">Gestionar carrera <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
            </div>
          </section>

          <div className="divider">
            <span>o seleccionar una carrera específica</span>
          </div>

          {/* Sección Seleccionar otra carrera */}
          <section className="section-block">
            <div className="section-header-row">
              <h2>Seleccionar otra carrera</h2>
              <div className="filters">
                <div className="search-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    placeholder="Buscar carrera por nombre" 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)} 
                />
                </div>
                <select 
                className="filter-select"
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
                >
                    <option value="">Año</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </select>
                <select 
                className="filter-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="">Estado</option>
                    <option value="PUBLICADA">PUBLICADA</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="CANCELADA">CANCELADA</option>
                    <option value="FINALIZADA">FINALIZADA</option>
                </select>
              </div>
            </div>

            <div className="race-list">
              {/* Tarjeta Seleccionada */}
              <div className="race-card selected-card">
                <div className="race-info">
                  <div className="race-header">
                    <h3>CAP 21K 2026</h3>
                    <span className="badge badge-green">PUBLICADA</span>
                    <span className="selected-text"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Carrera seleccionada</span>
                  </div>
                  <div className="race-details">
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> 21 km</span>
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 20 de octubre de 2026</span>
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> La Plata</span>
                  </div>
                </div>
                <button className="btn btn-primary">Continuar <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
              </div>

              {/* Tarjeta Normal 1 */}
              <div className="race-card">
                <div className="race-info">
                  <div className="race-header">
                    <h3>CAP 5K 2026</h3>
                    <span className="badge badge-green">PUBLICADA</span>
                  </div>
                  <div className="race-details">
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> 5 km</span>
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 12 de noviembre de 2026</span>
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> La Plata</span>
                  </div>
                </div>
                <button className="btn btn-outline">Seleccionar</button>
              </div>

              {/* Tarjeta Normal 2 */}
              <div className="race-card">
                <div className="race-info">
                  <div className="race-header">
                    <h3>CAP 10K 2025</h3>
                    <span className="badge badge-gray">FINALIZADA</span>
                  </div>
                  <div className="race-details">
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> 10 km</span>
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 15 de septiembre de 2025</span>
                    <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> La Plata</span>
                  </div>
                </div>
                <button className="btn btn-outline">Seleccionar</button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default SeleccionarCarrera;