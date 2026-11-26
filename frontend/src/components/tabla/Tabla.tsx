
// frontend/src/components/tabla.Tabla.tsx

import React from 'react';
import {
  Table,
  Pagination,
  Card,
} from 'react-bootstrap';

export interface Columna<T> {
  titulo: string;
  key: keyof T | string;
  render?: (fila: T) => React.ReactNode;
}

interface TablaProps<T> {
  columnas: Columna<T>[];
  datos: T[];
  mensajeVacio?: string;

  // Paginación conectada al backend
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (nuevaPagina: number) => void;
  textoPaginacion: string;

  onRowClick?: (fila: T) => void;
  mostrarNumeros?: boolean;
}

export function Tabla<T extends { id: string | number }>({
  columnas,
  datos,
  mensajeVacio = 'No se encontraron registros.',
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  textoPaginacion,
  onRowClick,
  mostrarNumeros = true,
}: TablaProps<T>) {

  // Generar números de página
  const generarBotonesPaginas = () => {
    const botones = [];

    for (let i = 1; i <= totalPaginas; i++) {
      botones.push(
        <Pagination.Item
          key={i}
          active={paginaActual === i}
          onClick={() => onCambiarPagina(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return botones;
  };

  return (
    <Card className="w-100 shadow-sm border">

      {/* Contenedor de la tabla */}
      <div
        style={{
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        <Table
          className="mb-0 align-middle"
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '10px',
          }}
        >
          <thead className="table-light">
            <tr>
              {columnas.map((col, index) => (
                <th
                  key={index}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    padding: '0 10px',
                    height: '40px',
                    backgroundColor: '#f0f3ff',
                    color: '#344054',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #dfe3eb',
                  }}
                >
                  {col.titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {datos.length > 0 ? (
              datos.map((fila) => (
                <tr
                  key={fila.id}
                  onClick={() => onRowClick?.(fila)}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {columnas.map((col, colIndex) => {
                    const valor = col.render
                      ? col.render(fila)
                      : (fila[col.key as keyof T] as React.ReactNode);

                    return (
                      <td
                        key={colIndex}
                        style={{
                          height: '64px',
                          padding: '7px 10px',
                          color: '#344054',
                          fontSize: '0.8rem',
                          verticalAlign: 'middle',
                          borderBottom: '1px solid #e4e7ec',
                        }}
                      >
                        {valor}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="text-center text-muted py-5"
                >
                  {mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPaginas > 0 && (
        <Card.Footer className="d-flex justify-content-between align-items-center flex-wrap gap-2 bg-white">

          <small className="text-muted">
            {textoPaginacion}
          </small>

          {totalPaginas > 1 && (
            <Pagination size="sm" className="mb-0">

              <Pagination.Prev
                disabled={paginaActual === 1}
                onClick={() => onCambiarPagina(paginaActual - 1)}
              />

              {mostrarNumeros && generarBotonesPaginas()}

              <Pagination.Next
                disabled={paginaActual === totalPaginas}
                onClick={() => onCambiarPagina(paginaActual + 1)}
              />

            </Pagination>
          )}

        </Card.Footer>
      )}

    </Card>
  );
}

export default Tabla;
