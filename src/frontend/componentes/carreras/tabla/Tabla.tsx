import React from 'react';
import './Tabla.css';

// Definimos la estructura de una columna
export interface Columna<T> {
  titulo: string;
  key: keyof T | string;
  render?: (fila: T) => React.ReactNode; // Función opcional para personalizar celdas (badges, negritas, etc.)
}

interface TablaAtletasProps<T> {
  columnas: Columna<T>[];
  datos: T[];
  mensajeVacio?: string;
}

export function Tabla<T extends { id: string | number }>({ 
  columnas, 
  datos, 
  mensajeVacio = "No se encontraron registros." 
}: TablaAtletasProps<T>) {
  return (
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
                  // Si la columna tiene una función 'render', la usamos; si no, leemos la propiedad directamente
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
  );
}

export default Tabla;