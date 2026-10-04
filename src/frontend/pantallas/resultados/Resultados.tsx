import React, { useState, useEffect } from 'react';
import './Resultados.css';
import { Tabla, type Columna } from '../../componentes/tabla/Tabla';

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
  const [datosTabla, setDatosTabla] = useState<ResultadoAtleta[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const elementosPorPagina = 50;
  
  // Datos mock de atletas finalizados (simulando una base de datos)
  const resultadosMock: ResultadoAtleta[] = [
    { id: 1, puesto: 1, dorsal: '1042', nombre: 'Juan Pérez', dni: '32.456.789', categoria: '30-39 M', tiempoNeto: '02:15:34', tiempoOficial: '02:15:35' },
    { id: 2, puesto: 2, dorsal: '2105', nombre: 'María González', dni: '28.123.456', categoria: '40-49 F', tiempoNeto: '02:18:12', tiempoOficial: '02:18:15' },
    { id: 3, puesto: 3, dorsal: '1003', nombre: 'Carlos Rodríguez', dni: '40.987.654', categoria: '18-29 M', tiempoNeto: '02:20:05', tiempoOficial: '02:20:08' },
    { id: 4, puesto: 4, dorsal: '3012', nombre: 'Laura Martínez', dni: '35.654.321', categoria: '30-39 F', tiempoNeto: '02:25:40', tiempoOficial: '02:25:45' },
    { id: 5, puesto: 5, dorsal: '1508', nombre: 'Diego Fernández', dni: '25.333.111', categoria: '50-59 M', tiempoNeto: '02:28:15', tiempoOficial: '02:28:22' },
  ];

  // Simulación de consulta a base de datos / API con paginación - MODIFICAR CUANDO SE HAGA LA CONSULTA A LA BASE DE DATOS REAL
  useEffect(() => {
    // 1. Filtramos el mock (en tu backend real, esto lo hace SQL / Prisma con LIMIT y OFFSET)
    const filtrados = resultadosMock.filter(atleta => {
      const textoBusqueda = busqueda.toLowerCase().trim();
      return (
        atleta.nombre.toLowerCase().includes(textoBusqueda) || 
        atleta.dorsal.includes(textoBusqueda) || 
        atleta.dni.includes(textoBusqueda)
      );
    });

    setTotalRegistros(filtrados.length);
    const paginasTotalesCalculadas = Math.ceil(filtrados.length / elementosPorPagina) || 1;
    setTotalPaginas(paginasTotalesCalculadas);

    // 2. Recortamos los datos para la página actual (simulando el paginado del backend)
    const indiceUltimo = paginaActual * elementosPorPagina;
    const indicePrimero = indiceUltimo - elementosPorPagina;
    const datosPagina = filtrados.slice(indicePrimero, indiceUltimo);

    setDatosTabla(datosPagina);
  }, [busqueda, paginaActual, distancia, sexo, categoria]);

  // Cálculos para el texto informativo inferior
  const primerItem = totalRegistros > 0 ? (paginaActual - 1) * elementosPorPagina + 1 : 0;
  const ultimoItem = Math.min(paginaActual * elementosPorPagina, totalRegistros);
  const textoPaginacion = `Mostrando ${primerItem} - ${ultimoItem} de ${totalRegistros} resultados`;

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

  // Funciones para exportación (mock)
  const handleExportPDF = () => console.log('Exportando a PDF...');
  const handleExportExcel = () => console.log('Exportando a Excel...');
  const handleExportCSV = () => console.log('Exportando a CSV...');
  const handleEnviarCertificados = () => console.log('Enviando certificados por correo...');

  return (
    <div className="resultados-container">

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
            <button className="btn-export" onClick={handleExportPDF}>PDF</button>
            <button className="btn-export" onClick={handleExportExcel}>Excel</button>
            <button className="btn-export" onClick={handleExportCSV}>CSV</button>
          </div>
        </div>

        {/* Tarjeta de Filtros de Resultados */}
        <div className="filters-card">
          <h3 className="filters-title">Filtros de Resultados</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Distancia</label>
              <select value={distancia} onChange={(e) => { setDistancia(e.target.value); setPaginaActual(1); }}>
                <option value="42K - Maratón">42K - Maratón</option>
                <option value="21K - Media Maratón">21K - Media Maratón</option>
                <option value="10K">10K</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sexo</label>
              <select value={sexo} onChange={(e) => { setSexo(e.target.value); setPaginaActual(1); }}>
                <option value="Todos">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Categoría</label>
              <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setPaginaActual(1); }}>
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
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1); // ¡Fundamental: volver a la página 1 al buscar!
              }}
            />
          </div>
        </div>

        {/* Tabla de Resultados (con paginación integrada del componente) */}
        <div className="table-wrapper-results">
          <Tabla 
            columnas={columnasResultados} 
            datos={datosTabla} 
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onCambiarPagina={(nuevaPag) => setPaginaActual(nuevaPag)}
            textoPaginacion={textoPaginacion}
            mensajeVacio="No se encontraron corredores."
          />
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
            Enviar Certificados
          </button>
        </div>

      </div>
    </div>
  );
};

export default Resultados;