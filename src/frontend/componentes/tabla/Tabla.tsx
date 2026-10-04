import React from 'react';
import './Tabla.css';

export interface Columna<T> {
  titulo: string;
  key: keyof T | string;
  render?: (fila: T) => React.ReactNode;
}

interface TablaProps<T> {
  columnas: Columna<T>[];
  datos: T[]; // Los datos que se mostrarán en la tabla
  mensajeVacio?: string;
  
  // Controles de paginación que vienen de la API/Base de datos
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (nuevaPagina: number) => void;
  textoPaginacion: string; // Ej: "Mostrando 1 - 50 de 1245 resultados"
}

export function Tabla<T extends { id: string | number }>({ 
  columnas, 
  datos, 
  mensajeVacio = "No se encontraron registros.",
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  textoPaginacion
}: TablaProps<T>) {

  // Generador de botones de páginas
  const generarBotonesPaginas = () => {
    const botones = [];

    for (let i = 1; i <= totalPaginas; i++) {
      botones.push(
        <button
          key={i}
          className={`page-num-btn ${paginaActual === i ? 'active' : ''}`}
          onClick={() => onCambiarPagina(i)}
        >
          {i}
        </button>
      );
    }
    return botones;
  };

  return (
    <div className="table-wrapper-component">
      <div className="table-container">
        <table className="participants-table">
          <thead>
            <tr>
              {columnas.map((col, index) => (
                <th key={index}>{col.titulo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.length > 0 ? (
              datos.map((fila) => (
                <tr key={fila.id}>
                  {columnas.map((col, colIndex) => {
                    const valor = col.render 
                      ? col.render(fila) 
                      : (fila[col.key as keyof T] as React.ReactNode);

                    return <td key={colIndex}>{valor}</td>;
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnas.length} className="empty-state">
                  {mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación inferior conectada al backend */}
      {totalPaginas > 0 && (
        <div className="pagination-footer">
          <span className="pagination-info">{textoPaginacion}</span>
          
          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <button 
                className="page-nav-btn" 
                disabled={paginaActual === 1}
                onClick={() => onCambiarPagina(paginaActual - 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              {generarBotonesPaginas()}

              <button 
                className="page-nav-btn" 
                disabled={paginaActual === totalPaginas}
                onClick={() => onCambiarPagina(paginaActual + 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Tabla;