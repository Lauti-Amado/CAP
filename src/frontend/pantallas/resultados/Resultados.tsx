import React, { useState } from 'react';
import './Resultados.css';
import { Tabla, type Columna } from '../../componentes/carreras/tabla/Tabla';

interface ResultadoAtleta {
  id: number;
  puesto: number;
  dorsal: string;
  nombre: string;
  dni: string;
  categoria: string;
  tiempoNeto: string;
  tiempoOficial: string;
}

const Resultados: React.FC = () => {
  // Estados para filtros y búsqueda
  const [distancia, setDistancia] = useState('42K - Maratón');
  const [sexo, setSexo] = useState('Todos');
  const [categoria, setCategoria] = useState('General');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Datos mock de atletas finalizados
  const resultadosMock: ResultadoAtleta[] = [
    { id: 1, puesto: 1, dorsal: '1042', nombre: 'Juan Pérez', dni: '32.456.789', categoria: '30-39 M', tiempoNeto: '02:15:34', tiempoOficial: '02:15:35' },
    { id: 2, puesto: 2, dorsal: '2105', nombre: 'María González', dni: '28.123.456', categoria: '40-49 F', tiempoNeto: '02:18:12', tiempoOficial: '02:18:15' },
    { id: 3, puesto: 3, dorsal: '1003', nombre: 'Carlos Rodríguez', dni: '40.987.654', categoria: '18-29 M', tiempoNeto: '02:20:05', tiempoOficial: '02:20:08' },
    { id: 4, puesto: 4, dorsal: '3012', nombre: 'Laura Martínez', dni: '35.654.321', categoria: '30-39 F', tiempoNeto: '02:25:40', tiempoOficial: '02:25:45' },
    { id: 5, puesto: 5, dorsal: '1508', nombre: 'Diego Fernández', dni: '25.333.111', categoria: '50-59 M', tiempoNeto: '02:28:15', tiempoOficial: '02:28:22' },
  ];

  const columnasResultados: Columna<ResultadoAtleta>[] = [
    { 
      titulo: 'PUESTO', 
      key: 'puesto',
      render: (atleta) => {
        const esPodio = atleta.puesto <= 3;
        return (
          <span className={`puesto-cell ${esPodio ? `puesto-${atleta.puesto}` : ''}`}>
            <strong>{atleta.puesto}</strong>
          </span>
        );
      }
    },
    { 
      titulo: 'DORSAL', 
      key: 'dorsal',
      render: (atleta) => <strong>{atleta.dorsal}</strong>
    },
    { 
      titulo: 'CORREDOR', 
      key: 'nombre',
      render: (atleta) => {
        const esPodio = atleta.puesto <= 3;
        return (
          <div className="runner-cell-info">
            <span className={`avatar-initial ${esPodio ? 'avatar-podium' : 'avatar-normal'}`}>
              {atleta.nombre.charAt(0)}
            </span>
            <span className="runner-name">{atleta.nombre}</span>
          </div>
        );
      }
    },
    { 
      titulo: 'DNI', 
      key: 'dni',
      render: (atleta) => <span className="dni-text">{atleta.dni}</span>
    },
    { 
      titulo: 'CATEGORÍA', 
      key: 'categoria',
      render: (atleta) => {
        const esPodio = atleta.puesto <= 3;
        return (
          <span className={`badge-category ${esPodio ? 'badge-cat-green' : 'badge-cat-gray'}`}>
            {atleta.categoria}
          </span>
        );
      }
    },
    { 
      titulo: 'T. NETO', 
      key: 'tiempoNeto',
      render: (atleta) => <span className="time-text">{atleta.tiempoNeto}</span>
    },
    { 
      titulo: 'T. OFICIAL', 
      key: 'tiempoOficial',
      render: (atleta) => <span className="time-official"><strong>{atleta.tiempoOficial}</strong></span>
    },
  ];

  // Lógica de filtrado dinámico
  const resultadosFiltrados = resultadosMock.filter(atleta => {
    const textoBusqueda = busqueda.toLowerCase().trim();
    const coincideBusqueda = 
      atleta.nombre.toLowerCase().includes(textoBusqueda) || 
      atleta.dorsal.includes(textoBusqueda) || 
      atleta.dni.includes(textoBusqueda);
    return coincideBusqueda;
  });

  // Funciones para exportación (mock)
  const handleExportPDF = () => console.log('Exportando a PDF...');
  const handleExportExcel = () => console.log('Exportando a Excel...');
  const handleExportCSV = () => console.log('Exportando a CSV...');
  const handleEnviarCertificados = () => console.log('Enviando certificados por correo...');

  return (
    <div className="resultados-container">
      {/* Topbar interno / Breadcrumb */}
      <header className="resultados-topbar">
        <div className="breadcrumb">
          CAP Gestión <span className="separator">&gt;</span> <strong>Resultados</strong>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" aria-label="Clima"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path><line x1="12" y1="12" x2="12" y2="22"></line><polyline points="8 18 12 22 16 18"></polyline></svg></button>
          <button className="icon-btn" aria-label="Notificaciones"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>
          <button className="icon-btn" aria-label="Ayuda"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
          <button className="profile-btn" aria-label="Perfil"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </div>
      </header>

      <div className="resultados-content">
        {/* Encabezado principal y botones de exportación */}
        <div className="resultados-header-main">
          <div className="title-group">
            <div className="title-with-badge">
              <h1>Resultados Finales</h1>
              <span className="badge badge-gray"><span className="dot-gray"></span> FINALIZADA</span>
            </div>
            <p className="subtitle-race">Maratón de la Ciudad 2024 - 42K / 21K / 10K</p>
          </div>
          <div className="export-buttons-group">
            <button className="btn-export" onClick={handleExportPDF}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              PDF
            </button>
            <button className="btn-export" onClick={handleExportExcel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line></svg>
              Excel
            </button>
            <button className="btn-export" onClick={handleExportCSV}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              CSV
            </button>
          </div>
        </div>

        {/* Tarjeta de Filtros de Resultados */}
        <div className="filters-card">
          <h3 className="filters-title">Filtros de Resultados</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Distancia</label>
              <select value={distancia} onChange={(e) => setDistancia(e.target.value)}>
                <option value="42K - Maratón">42K - Maratón</option>
                <option value="21K - Media Maratón">21K - Media Maratón</option>
                <option value="10K">10K</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sexo</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="General">General</option>
                <option value="18-29">18-29</option>
                <option value="30-39">30-39</option>
                <option value="40-49">40-49</option>
                <option value="50-59">50-59</option>
              </select>
            </div>
          </div>
          <div className="search-box-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Buscar corredor o dorsal..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="table-wrapper-results">
          <Tabla
            columnas={columnasResultados}
            datos={resultadosFiltrados}
            mensajeVacio="No se encontraron resultados para los filtros aplicados."
          />

          {/* Paginación de la tabla */}
          <div className="pagination-footer">
            <span className="pagination-info">Mostrando 1 - 50 de 1245 resultados</span>
            <div className="pagination-controls">
              <button className="page-nav-btn" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <button className={`page-num-btn ${paginaActual === 1 ? 'active' : ''}`} onClick={() => setPaginaActual(1)}>1</button>
              <button className={`page-num-btn ${paginaActual === 2 ? 'active' : ''}`} onClick={() => setPaginaActual(2)}>2</button>
              <button className={`page-num-btn ${paginaActual === 3 ? 'active' : ''}`} onClick={() => setPaginaActual(3)}>3</button>
              <button className="page-nav-btn" onClick={() => setPaginaActual(p => p + 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
          </div>
        </div>

        {/* Tarjeta inferior: Certificados de Finisher */}
        <div className="certificates-banner-card">
          <div className="cert-info-left">
            <div className="cert-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <div className="cert-text-content">
              <h4>Certificados de Finisher</h4>
              <p>Genera y envía por correo electrónico los certificados oficiales a todos los corredores que finalizaron la carrera.</p>
            </div>
          </div>
          <button className="btn btn-primary btn-cert-action" onClick={handleEnviarCertificados}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            Enviar Certificados
          </button>
        </div>

      </div>
    </div>
  );
};

export default Resultados;