import React, { useState, useEffect } from 'react';
import { Award, FileSpreadsheet, FileText, Search, Send, Table } from 'lucide-react';
import './Resultados.css';
import { Tabla, type Columna } from '../../components/tabla/Tabla';
import { enviarCertificados } from '../../services/certificadosService';

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

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState<{
    tipo: 'success' | 'warning' | 'danger';
    texto: string;
  } | null>(null);
  const [certificadosEnviados, setCertificadosEnviados] = useState(false);

  // TODO: tomar el id de la carrera seleccionada cuando exista
  const carreraId = 1;
  
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
    render: (atleta) => (
      <strong className={atleta.puesto <= 3 ? `res-puesto--${atleta.puesto}` : ''}>
        {atleta.puesto}
      </strong>
    ),
  },
  { titulo: 'DORSAL', key: 'dorsal', render: (atleta) => <strong>{atleta.dorsal}</strong> },
  {
    titulo: 'CORREDOR',
    key: 'nombre',
    render: (atleta) => (
      <div className="d-flex align-items-center gap-2">
        <span
          className={`res-avatar d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold ${
            atleta.puesto <= 3 ? 'res-avatar--podio' : 'res-avatar--normal'
          }`}
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
      <span className={`res-cat rounded px-2 py-1 fw-bold ${atleta.puesto <= 3 ? 'res-cat--verde' : 'res-cat--gris'}`}>
        {atleta.categoria}
      </span>
    ),
  },
  { titulo: 'T. NETO', key: 'tiempoNeto', render: (atleta) => <span className="text-secondary">{atleta.tiempoNeto}</span> },
  { titulo: 'T. OFICIAL', key: 'tiempoOficial', render: (atleta) => <strong>{atleta.tiempoOficial}</strong> },
];

  // Funciones para exportación (mock)
  const handleExportPDF = () => console.log('Exportando a PDF...');
  const handleExportExcel = () => console.log('Exportando a Excel...');
  const handleExportCSV = () => console.log('Exportando a CSV...');

  const handleEnviarCertificados = async () => {
    setMostrarConfirmacion(false);

    // El envío masivo necesita internet (la notebook vuelve a estar online después del evento)
    if (!navigator.onLine) {
      setMensajeEnvio({
        tipo: 'danger',
        texto: 'Sin conexión a internet. Conecte la notebook a una red para enviar los certificados.',
      });
      return;
    }

    setEnviando(true);
    setMensajeEnvio(null);

    try {
      const { enviados, fallidos } = await enviarCertificados(carreraId);

      if (enviados === 0 && fallidos === 0) {
        setMensajeEnvio({ tipo: 'warning', texto: 'No hay socios con certificados pendientes de envío.' });
      } else if (fallidos > 0) {
        setMensajeEnvio({
          tipo: 'warning',
          texto: `Se enviaron ${enviados} certificados y ${fallidos} fallaron. Puede reintentar: solo se reenviarán los pendientes.`,
        });
      } else {
        setCertificadosEnviados(true);
        setMensajeEnvio({ tipo: 'success', texto: `Se enviaron ${enviados} certificados a los socios correctamente.` });
      }
    } catch (error) {
      console.error('Error al enviar certificados:', error);
      setMensajeEnvio({ tipo: 'danger', texto: 'No se pudieron enviar los certificados. Intente nuevamente.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
  <main className="main-content res-form p-4">
    {/* =========================
        ENCABEZADO
    ========================= */}
    <header className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <div className="d-flex align-items-center gap-3 mb-1">
          <h1 className="h2 fw-bold mb-0">Resultados Finales</h1>
          <span className="res-estado d-inline-flex align-items-center gap-1 rounded-pill bg-light border text-secondary fw-bold px-2 py-1">
            <span className="res-punto d-inline-block rounded-circle bg-secondary" />
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
          <Table size={14} className="text-success" aria-hidden="true" />
          CSV
        </button>
      </div>
    </header>

    {/* =========================
        FILTROS
    ========================= */}
    <section className="card mb-4">
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
    <div className="card overflow-hidden mb-4 res-tabla">
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

    {/* =========================
        RESULTADO DEL ENVÍO
    ========================= */}
    {mensajeEnvio && (
      <div className={`alert alert-${mensajeEnvio.tipo} alert-dismissible mb-3`} role="alert">
        {mensajeEnvio.texto}
        <button
          type="button"
          className="btn-close"
          aria-label="Cerrar"
          onClick={() => setMensajeEnvio(null)}
        />
      </div>
    )}

    {/* =========================
        CERTIFICADOS DE FINISHER
    ========================= */}
    <section className="res-banner rounded-3 p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div className="d-flex align-items-center gap-3">
        <span className="res-banner__icono d-inline-flex align-items-center justify-content-center rounded-3 text-white flex-shrink-0">
          <Award size={24} aria-hidden="true" />
        </span>
        <div>
          <h2 className="h6 fw-bold mb-1">Certificados de Finisher</h2>
          <p className="small text-secondary mb-0">
            Genera y envía por correo electrónico los certificados oficiales a los socios que finalizaron la carrera.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="btn res-btn-verde d-inline-flex align-items-center gap-2"
        disabled={enviando || certificadosEnviados}
        onClick={() => setMostrarConfirmacion(true)}
      >
        {enviando ? (
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        ) : (
          <Send size={14} aria-hidden="true" />
        )}
        {enviando ? 'Enviando...' : certificadosEnviados ? 'Certificados enviados' : 'Enviar Certificados'}
      </button>
    </section>

    {/* =========================
        CONFIRMAR ENVÍO
    ========================= */}
    {mostrarConfirmacion && (
      <>
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="titulo-envio">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title h5" id="titulo-envio">Enviar certificados</h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setMostrarConfirmacion(false)}
                />
              </div>
              <div className="modal-body">
                Se enviará el certificado por correo a los socios que finalizaron la carrera.
                Los certificados solo se pueden enviar una vez.
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setMostrarConfirmacion(false)}
                >
                  Cancelar
                </button>
                <button type="button" className="btn btn-sm res-btn-verde" onClick={handleEnviarCertificados}>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop show" />
      </>
    )}
  </main>
);
};

export default Resultados;