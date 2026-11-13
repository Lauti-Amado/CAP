import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Search, Table as TableIcon } from 'lucide-react';
import { Tabla, type Columna } from '../../components/tabla/Tabla';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSeleccionarCarrera } from '../../context/SeleccionarCarreraContext';
import CertificadosSocios from '../../components/certificados/CertificadosSocios';

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

  const { carreraSeleccionada } = useSeleccionarCarrera();
  
  // Datos mock de atletas finalizados (simulando una base de datos)
  const resultadosMock: ResultadoAtleta[] = [
    { id: 1, puesto: 1, dorsal: '1042', nombre: 'Juan Pérez', dni: '32.456.789', categoria: '30-39 M', tiempoNeto: '02:15:34', tiempoOficial: '02:15:35' },
    { id: 2, puesto: 2, dorsal: '2105', nombre: 'María González', dni: '28.123.456', categoria: '40-49 F', tiempoNeto: '02:18:12', tiempoOficial: '02:18:15' },
    { id: 3, puesto: 3, dorsal: '1003', nombre: 'Carlos Rodríguez', dni: '40.987.654', categoria: '18-29 M', tiempoNeto: '02:20:05', tiempoOficial: '02:20:08' },
    { id: 4, puesto: 4, dorsal: '3012', nombre: 'Laura Martínez', dni: '35.654.321', categoria: '30-39 F', tiempoNeto: '02:25:40', tiempoOficial: '02:25:45' },
    { id: 5, puesto: 5, dorsal: '1508', nombre: 'Diego Fernández', dni: '25.333.111', categoria: '50-59 M', tiempoNeto: '02:28:15', tiempoOficial: '02:28:22' },
  ];

  // Simulación de consulta a base de datos / API con paginación
  useEffect(() => {
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
        const colorPuesto = 
          atleta.puesto === 1 ? '#16a34a' : 
          atleta.puesto === 2 ? '#0d9488' : 
          atleta.puesto === 3 ? '#ca8a04' : '';
        return (
          <strong style={{ color: colorPuesto }}>
            {atleta.puesto}
          </strong>
        );
      },
    },
    { titulo: 'DORSAL', key: 'dorsal', render: (atleta) => <strong>{atleta.dorsal}</strong> },
    {
      titulo: 'CORREDOR',
      key: 'nombre',
      render: (atleta) => (
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
            style={{
              width: '32px',
              height: '32px',
              fontSize: '12px',
              backgroundColor: atleta.puesto <= 3 ? '#15803d' : '#64748b'
            }}
          >
            {atleta.nombre.charAt(0)}
          </span>
          <span className="fw-semibold">{atleta.nombre}</span>
        </div>
      ),
    },
    { titulo: 'DNI', key: 'dni', render: (atleta) => <span className="text-secondary">{atleta.dni}</span> },
    {
      titulo: 'CATEGORÍA',
      key: 'categoria',
      render: (atleta) => (
        <span 
          className="rounded px-2 py-1 fw-bold" 
          style={{
            fontSize: '11px',
            backgroundColor: atleta.puesto <= 3 ? '#bbf7d0' : '#f1f5f9',
            color: atleta.puesto <= 3 ? '#166534' : '#475569'
          }}
        >
          {atleta.categoria}
        </span>
      ),
    },
    { titulo: 'T. NETO', key: 'tiempoNeto', render: (atleta) => <span className="text-secondary text-end d-block">{atleta.tiempoNeto}</span> },
    { titulo: 'T. OFICIAL', key: 'tiempoOficial', render: (atleta) => <strong className="text-end d-block">{atleta.tiempoOficial}</strong> },
  ];

  // FUNCIONES DE EXPORTACION
  // Exportar a PDF 
  const handleExportPDF = () => {
    if (datosTabla.length === 0) return;

    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resultados Finales - Maratón de la Ciudad", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Distancia: ${distancia} | Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

    // Configuración de la tabla en el PDF
    const columnas = ['Puesto', 'Dorsal', 'Corredor', 'DNI', 'Categoría', 'T. Neto', 'T. Oficial'];
    const filas = datosTabla.map(a => [
      a.puesto,
      a.dorsal,
      a.nombre,
      a.dni,
      a.categoria,
      a.tiempoNeto,
      a.tiempoOficial
    ]);

    // Generar tabla llamando a la función autoTable y pasándole 'doc'
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // Color verde institucional (#16a34a)
      styles: { fontSize: 9 },
    });

    // Guardar el archivo PDF
    doc.save("resultados_maraton.pdf");
  };
  // Exportar a Excel
  const handleExportExcel = () => {
    if (datosTabla.length === 0) return;

    // Mapeamos los datos para darles un formato limpio en el Excel
    const datosParaExcel = datosTabla.map(a => ({
      Puesto: a.puesto,
      Dorsal: a.dorsal,
      Corredor: a.nombre,
      DNI: a.dni,
      Categoría: a.categoria,
      'Tiempo Neto': a.tiempoNeto,
      'Tiempo Oficial': a.tiempoOficial
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados Finales");
    
    // Descarga el archivo excel directamente en la PC
    XLSX.writeFile(workbook, "resultados_maraton.xlsx");
  };
  // Exportar a CSV
  const handleExportCSV = () => {
    if (datosTabla.length === 0) return;

    const headers = ['PUESTO', 'DORSAL', 'CORREDOR', 'DNI', 'CATEGORÍA', 'T. NETO', 'T. OFICIAL'];
    const rows = datosTabla.map(a => [
      a.puesto, 
      `"${a.dorsal}"`, 
      `"${a.nombre}"`, 
      `"${a.dni}"`, 
      `"${a.categoria}"`, 
      `"${a.tiempoNeto}"`, 
      `"${a.tiempoOficial}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "resultados_maraton.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="main-content p-4">
      {/* Estilos locales en línea para reemplazos específicos de Bootstrap */}
      <style>{`
        .form-control:focus, .form-select:focus {
          border-color: #16a34a !important;
          box-shadow: 0 0 0 0.2rem rgba(22, 163, 74, 0.15) !important;
        }
        .table-container {
          max-height: none !important;
          overflow-y: visible !important;
          border: 0 !important;
          border-radius: 0 !important;
        }
        .participants-table {
          table-layout: fixed !important;
        }
        .participants-table th {
          position: static !important;
          background: #eef1ff !important;
          color: #344054 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          padding: 12px 14px !important;
          border-bottom: 1px solid #dfe3f0 !important;
        }
        .participants-table td {
          padding: 12px 14px !important;
          font-size: 13px !important;
        }
        .participants-table tbody tr:hover td {
          background: #f0faf4 !important;
        }
        .participants-table th:nth-child(1), .participants-table td:nth-child(1) { width: 9%; }
        .participants-table th:nth-child(2), .participants-table td:nth-child(2) { width: 9%; }
        .participants-table th:nth-child(3), .participants-table td:nth-child(3) { width: 25%; }
        .participants-table th:nth-child(4), .participants-table td:nth-child(4) { width: 16%; }
        .participants-table th:nth-child(5), .participants-table td:nth-child(5) { width: 15%; }
        .participants-table th:nth-child(6), .participants-table td:nth-child(6) { width: 13%; text-align: right; }
        .participants-table th:nth-child(7), .participants-table td:nth-child(7) { width: 13%; text-align: right; }
      `}</style>

      {/* =========================
          ENCABEZADO
      ========================= */}
      <header className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <h1 className="h2 fw-bold mb-0">Resultados Finales</h1>
            <span className="d-inline-flex align-items-center gap-1 rounded-pill bg-light border text-secondary fw-bold px-2 py-1" style={{ fontSize: '11px' }}>
              <span className="d-inline-block rounded-circle bg-secondary" style={{ width: '6px', height: '6px' }} />
              FINALIZADA
            </span>
          </div>
          <p className="text-secondary small mb-0">Maratón de la Ciudad 2024 - 42K / 21K / 10K</p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportPDF}
          >
            <FileText size={14} className="text-success" aria-hidden="true" />
            PDF
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet size={14} className="text-success" aria-hidden="true" />
            Excel
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportCSV}
          >
            <TableIcon size={14} className="text-success" aria-hidden="true" />
            CSV
          </button>
        </div>
      </header>

      {/* =========================
          FILTROS
      ========================= */}
      <section className="card mb-4 shadow-sm border">
        <div className="card-body">
          <h2 className="h6 fw-bold pb-2 mb-3 border-bottom">Filtros de Resultados</h2>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <label htmlFor="filtroDistancia" className="form-label small fw-semibold">Distancia</label>
              <select
                id="filtroDistancia"
                className="form-select"
                value={distancia}
                onChange={(e) => { setDistancia(e.target.value); setPaginaActual(1); }}
              >
                <option value="42K - Maratón">42K - Maratón</option>
                <option value="21K - Media Maratón">21K - Media Maratón</option>
                <option value="10K">10K</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="filtroSexo" className="form-label small fw-semibold">Sexo</label>
              <select
                id="filtroSexo"
                className="form-select"
                value={sexo}
                onChange={(e) => { setSexo(e.target.value); setPaginaActual(1); }}
              >
                <option value="Todos">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="filtroCategoria" className="form-label small fw-semibold">Categoría</label>
              <select
                id="filtroCategoria"
                className="form-select"
                value={categoria}
                onChange={(e) => { setCategoria(e.target.value); setPaginaActual(1); }}
              >
                <option value="General">General</option>
                <option value="18-29">18-29</option>
                <option value="30-39">30-39</option>
                <option value="40-49">40-49</option>
                <option value="50-59">50-59</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Search size={16} className="text-secondary" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Buscar corredor o dorsal..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>
        </div>
      </section>

      {/* =========================
          TABLA
      ========================= */}
      <div className="card overflow-hidden mb-4 shadow-sm border">
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

      {carreraSeleccionada && <CertificadosSocios carreraId={carreraSeleccionada.id} />}

    </main>
  );
};

export default Resultados;