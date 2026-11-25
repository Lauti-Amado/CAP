//frontend/src/pages/resultados/Resultados.tsx
import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, FileText, Search, Table as TableIcon } from 'lucide-react';
import { Spinner, Alert } from 'react-bootstrap';
import { Tabla, type Columna } from '../../components/tabla/Tabla';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSeleccionarCarrera } from '../../context/SeleccionarCarreraContext';
import { useCarreraActual } from '../../hooks/useCarreraActual';
import { useClasificacion } from '../../hooks/useClasificacion';
import { formatearTiempo } from '../../utils/clasificacionUtils';
import CertificadosSocios from '../../components/certificados/CertificadosSocios';

interface ResultadoAtleta {
  id: string;
  puesto: number | string;
  dorsal: string;
  nombre: string;
  dni: string;
  categoria: string;
  tiempoNeto: string;
  tiempoOficial: string;
}

const Resultados: React.FC = () => {
  // Contexto de carrera
  const { carreraSeleccionada } = useSeleccionarCarrera();
  const carreraActual = useCarreraActual();
  const carrera = carreraSeleccionada ?? carreraActual;

  // Estados para filtros y búsqueda locales (para inputs)
  const [distancia, setDistancia] = useState('');
  const [sexo, setSexo] = useState('Todos');
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Consulta a la base de datos real con paginación y filtros
  const {
    datos,
    total,
    totalPaginas,
    cargando,
    error,
    filtros,
    cambiarFiltro,
    cambiarPagina,
  } = useClasificacion(carrera?.id, { limite: 50 });

  // Mapeo de datos reales al formato de la tabla
  const datosTabla: ResultadoAtleta[] = useMemo(() => {
    return datos.map((c) => {
      const tiempoStr = c.resultado?.tiempoLlegada != null ? formatearTiempo(c.resultado.tiempoLlegada) : '-';
      const puestoValor =
        c.resultado?.puestoGeneral ??
        (c.estado === 'Finalizo' ? '-' : c.estado.replace('_', ' '));

      return {
        id: c.id,
        puesto: puestoValor,
        dorsal: c.dorsal ?? '-',
        nombre: `${c.corredor.nombre} ${c.corredor.apellido}`,
        dni: c.corredor.dni,
        categoria: c.resultado?.categorias[0]?.nombre ?? (c.distancia ? `${c.distancia.kilometraje}K` : '-'),
        tiempoNeto: tiempoStr,
        tiempoOficial: tiempoStr,
      };
    });
  }, [datos]);

  // Cálculos para el texto informativo de paginación
  const paginaActual = filtros.pagina ?? 1;
  const limite = filtros.limite ?? 50;
  const primerItem = total > 0 ? (paginaActual - 1) * limite + 1 : 0;
  const ultimoItem = Math.min(paginaActual * limite, total);
  const textoPaginacion = `Mostrando ${primerItem} - ${ultimoItem} de ${total} resultados`;

  const distanciasCarrera = carrera?.distancias ?? [];

  const columnasResultados: Columna<ResultadoAtleta>[] = [
    {
      titulo: 'PUESTO',
      key: 'puesto',
      render: (atleta) => {
        const puestoNum = typeof atleta.puesto === 'number' ? atleta.puesto : Number(atleta.puesto);
        const colorPuesto =
          puestoNum === 1 ? '#16a34a' :
          puestoNum === 2 ? '#0d9488' :
          puestoNum === 3 ? '#ca8a04' : '';
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
      render: (atleta) => {
        const puestoNum = typeof atleta.puesto === 'number' ? atleta.puesto : Number(atleta.puesto);
        return (
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '12px',
                backgroundColor: puestoNum && puestoNum <= 3 ? '#15803d' : '#64748b',
              }}
            >
              {atleta.nombre.charAt(0).toUpperCase()}
            </span>
            <span className="fw-semibold">{atleta.nombre}</span>
          </div>
        );
      },
    },
    { titulo: 'DNI', key: 'dni', render: (atleta) => <span className="text-secondary">{atleta.dni}</span> },
    {
      titulo: 'CATEGORÍA',
      key: 'categoria',
      render: (atleta) => {
        const puestoNum = typeof atleta.puesto === 'number' ? atleta.puesto : Number(atleta.puesto);
        return (
          <span
            className="rounded px-2 py-1 fw-bold"
            style={{
              fontSize: '0.8rem',
              backgroundColor: puestoNum && puestoNum <= 3 ? '#bbf7d0' : '#f1f5f9',
              color: puestoNum && puestoNum <= 3 ? '#166534' : '#475569',
            }}
          >
            {atleta.categoria}
          </span>
        );
      },
    },
    { titulo: 'T. NETO', key: 'tiempoNeto', render: (atleta) => <span className="text-secondary text-end d-block">{atleta.tiempoNeto}</span> },
    { titulo: 'T. OFICIAL', key: 'tiempoOficial', render: (atleta) => <strong className="text-end d-block">{atleta.tiempoOficial}</strong> },
  ];

  // FUNCIONES DE EXPORTACIÓN
  const handleExportPDF = () => {
    if (datosTabla.length === 0) return;

    const doc = new jsPDF();
    const nombreCarrera = carrera?.nombre ?? 'Resultados';

    doc.setFontSize(16);
    doc.text(`Resultados Finales - ${nombreCarrera}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Distancia: ${distancia ? `${distancia}K` : 'Todas'} | Sexo: ${sexo} | Generado el: ${new Date().toLocaleDateString()}`,
      14,
      28
    );

    const columnas = ['Puesto', 'Dorsal', 'Corredor', 'DNI', 'Categoría', 'T. Neto', 'T. Oficial'];
    const filas = datosTabla.map((a) => [
      a.puesto,
      a.dorsal,
      a.nombre,
      a.dni,
      a.categoria,
      a.tiempoNeto,
      a.tiempoOficial,
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 9 },
    });

    doc.save(`resultados_${nombreCarrera.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExportExcel = () => {
    if (datosTabla.length === 0) return;

    const datosParaExcel = datosTabla.map((a) => ({
      Puesto: a.puesto,
      Dorsal: a.dorsal,
      Corredor: a.nombre,
      DNI: a.dni,
      Categoría: a.categoria,
      'Tiempo Neto': a.tiempoNeto,
      'Tiempo Oficial': a.tiempoOficial,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados Finales');

    const nombreCarrera = carrera?.nombre ?? 'Resultados';
    XLSX.writeFile(workbook, `resultados_${nombreCarrera.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleExportCSV = () => {
    if (datosTabla.length === 0) return;

    const headers = ['PUESTO', 'DORSAL', 'CORREDOR', 'DNI', 'CATEGORÍA', 'T. NETO', 'T. OFICIAL'];
    const rows = datosTabla.map((a) => [
      a.puesto,
      `"${a.dorsal}"`,
      `"${a.nombre}"`,
      `"${a.dni}"`,
      `"${a.categoria}"`,
      `"${a.tiempoNeto}"`,
      `"${a.tiempoOficial}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const nombreCarrera = carrera?.nombre ?? 'Resultados';
    link.setAttribute('download', `resultados_${nombreCarrera.replace(/\s+/g, '_')}.csv`);
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
            <h1 style={{ fontSize: '2rem' }} className="h2 fw-bold mb-0">Resultados Finales</h1>
            <span
              className="d-inline-flex align-items-center gap-1 rounded-pill bg-light border text-secondary fw-bold px-2 py-1"
              style={{ fontSize: '11px' }}
            >
              <span className="d-inline-block rounded-circle bg-secondary" style={{ width: '6px', height: '6px' }} />
              {carrera ? carrera.estado.toUpperCase().replace('_', ' ') : 'FINALIZADA'}
            </span>
          </div>
          <p className="text-secondary small mb-0">
            {carrera
              ? `${carrera.nombre} - ${distanciasCarrera.map((d) => `${d.kilometraje}K`).join(' / ')}`
              : 'Cargando carrera...'}
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportPDF}
            disabled={cargando || datosTabla.length === 0}
          >
            <FileText size={16} className="text-success" aria-hidden="true" />
            PDF
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportExcel}
            disabled={cargando || datosTabla.length === 0}
          >
            <FileSpreadsheet size={16} className="text-success" aria-hidden="true" />
            Excel
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportCSV}
            disabled={cargando || datosTabla.length === 0}
          >
            <TableIcon size={16} className="text-success" aria-hidden="true" />
            CSV
          </button>
        </div>
      </header>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* =========================
          FILTROS
      ========================= */}
      <section className="card mb-4 shadow-sm border">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
            <h2 className="h6 fw-bold mb-0">Filtros de Resultados</h2>
            {cargando && (
              <span className="d-flex align-items-center gap-2 text-muted small">
                <Spinner animation="border" size="sm" />
                Actualizando...
              </span>
            )}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <label htmlFor="filtroDistancia" className="form-label small fw-semibold">Distancia</label>
              <select
                id="filtroDistancia"
                className="form-select"
                value={distancia}
                onChange={(e) => {
                  const val = e.target.value;
                  setDistancia(val);
                  cambiarFiltro('distancia', val ? Number(val) : undefined);
                }}
              >
                <option value="">Todas las distancias</option>
                {distanciasCarrera.map((d) => (
                  <option key={d.kilometraje} value={d.kilometraje}>
                    {d.kilometraje}K {d.tipoDistancia ? `- ${d.tipoDistancia}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="filtroSexo" className="form-label small fw-semibold">Sexo</label>
              <select
                id="filtroSexo"
                className="form-select"
                value={sexo}
                onChange={(e) => {
                  const val = e.target.value;
                  setSexo(val);
                  cambiarFiltro('sexo', val === 'Todos' || !val ? undefined : (val as 'Masculino' | 'Femenino'));
                }}
              >
                <option value="Todos">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="filtroCategoria" className="form-label small fw-semibold">Categoría</label>
              <input
                type="text"
                id="filtroCategoria"
                list="categoriasSugeridas"
                className="form-control"
                placeholder="Buscar o elegir categoría..."
                value={categoria}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoria(val);
                  cambiarFiltro('categoria', val.trim() || undefined);
                }}
              />
              <datalist id="categoriasSugeridas">
                <option value="Edad CAP" />
                <option value="Sexo" />
                <option value="Discapacidades" />
              </datalist>
            </div>
          </div>

          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Search size={16} className="text-secondary" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Buscar por corredor, DNI o dorsal..."
              value={busqueda}
              onChange={(e) => {
                const val = e.target.value;
                setBusqueda(val);
                cambiarFiltro('busqueda', val.trim() || undefined);
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
          onCambiarPagina={cambiarPagina}
          textoPaginacion={textoPaginacion}
          mensajeVacio={cargando ? 'Cargando resultados...' : 'No se encontraron corredores.'}
        />
      </div>

      {carrera && <CertificadosSocios carreraId={carrera.id} />}
    </main>
  );
};

export default Resultados;
