
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Spinner
} from 'react-bootstrap';

import { ApiError } from '../../../services/apiService';
import {
  eliminarCategoria,
  listarCategorias
} from '../../../services/categoriaService';

import type { CategoriaDTO } from '../../../types/categoria';

import '../Administracion.css';

const esCategoriaProtegida = (nombre: string) =>
  ['Edad CAP', 'Discapacidades', 'Sexo'].some(
    (nombreProtegido) =>
      nombreProtegido.toLowerCase() === nombre.trim().toLowerCase()
  );

function ConfiguracionClasificaciones() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [porEliminar, setPorEliminar] = useState<CategoriaDTO | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar categorías
  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      setCategorias(await listarCategorias());
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudieron cargar las categorías.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarCategorias();
  }, [cargarCategorias]);

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    if (!porEliminar) return;

    setEliminando(true);
    setError('');

    try {
      await eliminarCategoria(porEliminar.id);
      setPorEliminar(null);
      await cargarCategorias();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudo eliminar la categoría.'
      );
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Container fluid className="main-content p-4">

      {/* ENCABEZADO */}
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-1">
          Administración de categorías
        </h1>

        <p className="text-secondary mb-0">
          Configurá las categorías que se utilizan en la modalidad de
          clasificación por categorías.
        </p>
      </header>

      {/* TÍTULO Y BOTÓN NUEVA CATEGORÍA */}
      <Row className="align-items-center justify-content-between g-3 mb-3">

        <Col>
          <h2 className="h6 fw-bold mb-1">
            Categorías configuradas
          </h2>

          <p className="text-secondary small mb-0">
            Las modalidades General y Por discapacidades son fijas
            y no se administran desde aquí.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="success"
            size="sm"
            className="d-inline-flex align-items-center gap-2 fw-semibold"
            onClick={() =>
              navigate('/administrador/configuraciones/categorias/nueva')
            }
          >
            <Plus size={14} aria-hidden="true" />
            Nueva categoría
          </Button>
        </Col>

      </Row>

      {/* MENSAJE DE ERROR */}
      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}

      {/* ESTADO DE CARGA */}
      {cargando ? (

        <div
          className="d-flex align-items-center gap-2 text-secondary py-4"
          role="status"
        >
          <Spinner animation="border" size="sm" />
          <span>Cargando categorías...</span>
        </div>

      ) : categorias.length === 0 ? (

        /* SIN CATEGORÍAS */
        <Card>
          <Card.Body className="text-center py-5">

            <h3 className="h6 fw-bold">
              Todavía no hay categorías configuradas
            </h3>

            <p className="text-secondary small mb-3">
              Creá una categoría para utilizarla en la clasificación
              de corredores.
            </p>

            <Button
              variant="success"
              size="sm"
              onClick={() =>
                navigate('/administrador/configuraciones/categorias/nueva')
              }
            >
              <Plus size={14} className="me-1" aria-hidden="true" />
              Nueva categoría
            </Button>

          </Card.Body>
        </Card>

      ) : (

        /* LISTADO DE CATEGORÍAS */
        <Row className="g-3" aria-label="Categorías configuradas">

          {categorias.map((categoria) => {

            const protegida = esCategoriaProtegida(categoria.nombre);

            return (
              <Col xs={12} md={6} xl={4} key={categoria.id}>

                <Card
                  className="h-100 shadow-sm"
                  style={{
                    borderColor: '#e6e9f3',
                    borderTop: `3px solid ${protegida ? '#6b7280' : '#087f3f'}`,
                    borderRadius: '10px'
                  }}
                >

                  <Card.Body className="d-flex flex-column">

                    {/* NOMBRE Y ACCIONES */}
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">

                      <Card.Title className="h6 fw-bold mb-0">
                        {categoria.nombre}
                      </Card.Title>

                      {!protegida && (
                        <div className="d-flex gap-2">

                          <Button
                            variant="link"
                            size="sm"
                            className="text-secondary p-0"
                            aria-label={`Editar ${categoria.nombre}`}
                            onClick={() =>
                              navigate(
                                `/administrador/configuraciones/categorias/${categoria.id}`
                              )
                            }
                          >
                            <Pencil size={14} aria-hidden="true" />
                          </Button>

                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            aria-label={`Eliminar ${categoria.nombre}`}
                            onClick={() => setPorEliminar(categoria)}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </Button>

                        </div>
                      )}

                    </div>

                    {/* DESCRIPCIÓN */}
                    <Card.Text className="text-secondary small mb-3">
                      {categoria.descripcion || 'Sin descripción.'}
                    </Card.Text>

                    {/* CRITERIOS */}
                    <div className="small fw-semibold mb-1">
                      Criterios
                    </div>

                    {categoria.criterios.length ? (

                      <ul className="small ps-3 mb-0">
                        {categoria.criterios.map((criterio, indice) => (
                          <li key={`${criterio.nombre}-${indice}`}>
                            {criterio.nombre}: {criterio.valor}
                          </li>
                        ))}
                      </ul>

                    ) : (

                      <p className="text-secondary small mb-0">
                        Sin criterios definidos.
                      </p>

                    )}

                  </Card.Body>

                </Card>

              </Col>
            );
          })}

        </Row>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal
        show={porEliminar !== null}
        onHide={() => setPorEliminar(null)}
        centered
        backdrop={eliminando ? 'static' : true}
        keyboard={!eliminando}
      >

        <Modal.Header closeButton={!eliminando}>
          <Modal.Title className="h5">
            Eliminar categoría
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          ¿Deseás eliminar{' '}
          <strong>{porEliminar?.nombre}</strong>?
          Esta acción no se puede deshacer.
        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setPorEliminar(null)}
            disabled={eliminando}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => void confirmarEliminacion()}
            disabled={eliminando}
          >
            {eliminando ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>

        </Modal.Footer>

      </Modal>

    </Container>
  );
}

export default ConfiguracionClasificaciones;
