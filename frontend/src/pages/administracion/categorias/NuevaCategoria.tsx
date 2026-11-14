//frontend/src\pages/administracion/categorias/NuevaCategoria.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Plus, Save, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner} from 'react-bootstrap';
import { ApiError } from '../../../services/apiService';
import { actualizarCategoria, crearCategoria, obtenerCategoria} from '../../../services/categoriaService';
import type { CriterioCategoria, DatosCategoria} from '../../../types/categoria';
import '../Administracion.css';
import { categoriaSchema } from '../../../schemas/categoriaSchema';
import { validar } from '../../../utils/validar';

const formularioInicial: DatosCategoria = {
  nombre: '',
  descripcion: '',
  criterios: [],
};

function NuevaCategoria() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const editando = id !== undefined;

  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [form, setForm] = useState<DatosCategoria>(formularioInicial);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const volver = () =>
    navigate('/administrador/configuraciones/categorias');

  // Cargar categoría cuando estamos editando
  useEffect(() => {
    if (!id) return;

    let activo = true;

    obtenerCategoria(id)
      .then((categoria) => {
        if (activo) {
          setForm({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            criterios: categoria.criterios.map((criterio) => ({
              ...criterio
            })),
          });
        }
      })
      .catch((e: unknown) => {
        if (activo) {
          setError(
            e instanceof ApiError
              ? e.message
              : 'No se pudo cargar la categoría.'
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  // Actualizar nombre o descripción
  const actualizarCampo = (
    campo: 'nombre' | 'descripcion',
    valor: string
  ) => {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor
    }));
  };

  // Actualizar un criterio
  const actualizarCriterio = (
    indice: number,
    campo: keyof CriterioCategoria,
    valor: string
  ) => {
    setForm((anterior) => ({
      ...anterior,
      criterios: anterior.criterios.map((criterio, i) =>
        i === indice
          ? { ...criterio, [campo]: valor }
          : criterio
      ),
    }));
  };

  // Agregar criterio
  const agregarCriterio = () => {
    setForm((anterior) => ({
      ...anterior,
      criterios: [
        ...anterior.criterios,
        { nombre: '', valor: '' }
      ],
    }));
  };

  // Quitar criterio
  const quitarCriterio = (indice: number) => {
    setForm((anterior) => ({
      ...anterior,
      criterios: anterior.criterios.filter(
        (_, i) => i !== indice
      ),
    }));
  };

  // Validación del formulario
  const validacion = validar(categoriaSchema, form);
  const errorCampo = (campo: string) =>
    mostrarErrores ? validacion.errores[campo] : undefined;

  // Guardar categoría
  const guardar = async () => {
    if (guardando) return;

    if (!validacion.ok) {
      setMostrarErrores(true);
      return;
    }

    setGuardando(true);
    setError('');

    try {
      if (id) {
        await actualizarCategoria(id, validacion.datos);
      } else {
        await crearCategoria(validacion.datos);
      }

      volver();

    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudo guardar la categoría.'
      );
    } finally {
      setGuardando(false);
    }
  };

  // Estado de carga
  if (cargando) {
    return (
      <Container fluid className="main-content p-4">
        <div
          className="d-flex align-items-center gap-2 text-secondary"
          role="status"
        >
          <Spinner animation="border" size="sm" />
          Cargando categoría...
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="main-content p-4">

      {/* ENCABEZADO */}
      <header className="d-flex align-items-start gap-3 mb-4">

        <Button
          variant="link"
          className="text-dark p-0 mt-1"
          aria-label="Volver a categorías"
          onClick={volver}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Button>

        <div>
          <h1 className="h2 fw-bold mb-1">
            {editando ? 'Editar categoría' : 'Nueva categoría'}
          </h1>

          <p className="text-secondary small mb-0">
            Definí el nombre, la descripción y los criterios de clasificación.
          </p>
        </div>

      </header>

      {/* MENSAJE DE ERROR */}
      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}

      <Row className="g-3">

        {/* COLUMNA PRINCIPAL */}
        <Col xs={12} lg={8}>

          {/* INFORMACIÓN GENERAL */}
          <Card className="mb-3 shadow-sm">

            <Card.Body>

              <h2 className="h6 fw-bold pb-2 mb-3 border-bottom">
                Información general
              </h2>

              <Form.Group className="mb-3" controlId="categoriaNombre">

                <Form.Label className="small fw-semibold">
                  Nombre <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  size="sm"
                  maxLength={100}
                  placeholder="Ej.: edad, sexo, organización ..."
                  value={form.nombre}
                  onChange={(e) =>
                    actualizarCampo('nombre', e.target.value)
                  }
                  isInvalid={!!errorCampo('nombre')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorCampo('nombre')}
                </Form.Control.Feedback>

              </Form.Group>

              <Form.Group controlId="categoriaDescripcion">

                <Form.Label className="small fw-semibold">
                  Descripción <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  size="sm"
                  maxLength={500}
                  placeholder="Describí a qué grupo corresponde esta categoría."
                  value={form.descripcion}
                  onChange={(e) =>
                    actualizarCampo('descripcion', e.target.value)
                  }
                  isInvalid={!!errorCampo('descripcion')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorCampo('descripcion')}
                </Form.Control.Feedback>

              </Form.Group>

            </Card.Body>

          </Card>

          {/* CRITERIOS DE CLASIFICACIÓN */}
          <Card className="shadow-sm">

            <Card.Body>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-2 mb-3 border-bottom">

                <div>
                  <h2 className="h6 fw-bold mb-1">
                    Criterios de clasificación
                  </h2>

                  <p className="text-secondary small mb-0">
                    Cada criterio tiene un nombre y un valor.
                  </p>
                </div>

                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={agregarCriterio}
                >
                  <Plus size={14} className="me-1" aria-hidden="true" />
                  Agregar criterio
                </Button>

              </div>

              {/* SIN CRITERIOS */}
              {form.criterios.length === 0 ? (

                <p className="text-secondary small mb-0">
                  Todavía no agregaste criterios. Podés crear la categoría
                  sin criterios y completarlos después.
                </p>

              ) : (

                /* LISTADO DE CRITERIOS */
                form.criterios.map((criterio, indice) => (

                  <Row
                    className="g-2 align-items-end mb-3"
                    key={indice}
                  >

                    <Col xs={12} md={5}>

                      <Form.Group controlId={`criterioNombre-${indice}`}>

                        <Form.Label className="small fw-semibold">
                          Nombre del criterio
                        </Form.Label>

                        <Form.Control
                          size="sm"
                          placeholder="Ej.: Edad"
                          value={criterio.nombre}
                          onChange={(e) =>
                            actualizarCriterio(
                              indice,
                              'nombre',
                              e.target.value
                            )
                          }
                          isInvalid={!!errorCampo(`criterios.${indice}.nombre`)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorCampo(`criterios.${indice}.nombre`)}
                        </Form.Control.Feedback>

                      </Form.Group>

                    </Col>

                    <Col xs={10} md={5}>

                      <Form.Group controlId={`criterioValor-${indice}`}>

                        <Form.Label className="small fw-semibold">
                          Valor
                        </Form.Label>

                        <Form.Control
                          size="sm"
                          placeholder="Ej.: 30 a 39"
                          value={criterio.valor}
                          onChange={(e) =>
                            actualizarCriterio(
                              indice,
                              'valor',
                              e.target.value
                            )
                          }
                          isInvalid={!!errorCampo(`criterios.${indice}.valor`)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorCampo(`criterios.${indice}.valor`)}
                        </Form.Control.Feedback>

                      </Form.Group>

                    </Col>

                    <Col xs={2} md={2} className="d-grid">

                      <Button
                        variant="outline-danger"
                        size="sm"
                        aria-label={`Quitar criterio ${indice + 1}`}
                        onClick={() => quitarCriterio(indice)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>

                    </Col>

                  </Row>

                ))

              )}

            </Card.Body>

          </Card>

        </Col>

        {/* COLUMNA VISTA PREVIA */}
        <Col xs={12} lg={4}>

          <Card className="shadow-sm" aria-label="Vista previa">

            {/* ENCABEZADO VISTA PREVIA */}
            <Card.Header className="d-flex justify-content-between align-items-center bg-body-secondary">

              <span className="small fw-bold text-secondary">
                VISTA PREVIA
              </span>

              <Eye
                size={14}
                className="text-secondary"
                aria-hidden="true"
              />

            </Card.Header>

            <Card.Body>

              <h2
                className={`h6 fw-bold mb-1 ${
                  form.nombre.trim()
                    ? 'text-success'
                    : 'text-secondary'
                }`}
              >
                {form.nombre.trim() || 'Nombre de la categoría'}
              </h2>

              <p className="text-secondary small mb-3">
                {form.descripcion.trim() || 'Sin descripción.'}
              </p>

              {/* CRITERIOS EN LA VISTA PREVIA */}
              {form.criterios.map((criterio, indice) => (

                <div
                  className="d-flex justify-content-between gap-3 small py-2 border-top"
                  key={indice}
                >

                  <span className="text-secondary">
                    {criterio.nombre || 'Criterio'}
                  </span>

                  <strong>
                    {criterio.valor || '—'}
                  </strong>

                </div>

              ))}

              {/* BOTONES */}
              <div className="d-grid gap-2 mt-3">

                <Button
                  variant="success"
                  size="sm"
                  className="d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={guardando}
                  onClick={() => void guardar()}
                >

                  {guardando ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={14} aria-hidden="true" />
                      Guardar categoría
                    </>
                  )}

                </Button>

                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={volver}
                  disabled={guardando}
                >
                  Cancelar
                </Button>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
}

export default NuevaCategoria;
