//frontend/src/pages/clasificacion/modClasifCorredor/modClasifCorredor.tsx
import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import { Clock, Lock, Pencil, Save, User } from 'lucide-react'
import { useRutasClasificacion } from '../../../hooks/useRutasClasificacion'
import { llegadasMock } from '../llegadasMock'
import { resultadoClasificacionSchema } from '../../../schemas/clasificacionSchema'
import { validar, type ErroresFormulario } from '../../../utils/validar'

const ModClasifCorredor: React.FC = () => {
  const { id, corredorId } = useParams()
  const llegadaId = corredorId ?? id
  return <FormularioModificacion key={llegadaId} id={llegadaId} />
}

// Campo de solo lectura (datos que vienen de la inscripción)
const CampoBloqueado: React.FC<{ id: string; etiqueta: string; valor: string }> = ({ id, etiqueta, valor }) => (
  <Form.Group controlId={id}>
    <Form.Label className="small fw-semibold text-secondary">{etiqueta}</Form.Label>
    <Form.Control type="text" value={valor} disabled readOnly />
  </Form.Group>
)

const FormularioModificacion: React.FC<{ id?: string }> = ({ id }) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const rutas = useRutasClasificacion()

  // TODO BACKEND: GET /api/clasificaciones/{id}
  const llegada = llegadasMock.find((l) => String(l.id) === id)

  const [errores, setErrores] = useState<ErroresFormulario>({})
  const [tiempoOficial, setTiempoOficial] = useState(llegada?.tiempo ?? '01:45:23.450')
  const [puestoGeneral, setPuestoGeneral] = useState(String(llegada?.puesto ?? 42))
  const [categoria, setCategoria] = useState('Masc 35 a 39 años')

  const handleGuardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validacion = validar(resultadoClasificacionSchema, { tiempoOficial, puestoGeneral })
    if (!validacion.ok) {
      setErrores(validacion.errores)
      return
    }

    // TODO BACKEND: PUT /api/clasificaciones/{id}/resultado con validacion.datos
    // ({ puestoGeneral, tiempoLlegada en milisegundos })
    console.log('Guardando modificaciones para el registro:', id, validacion.datos)
    // Pasa al siguiente corredor de la cola o, si era el último, a tiempo real
    navigate(rutas.trasGuardar(search), { replace: true })
  }

  const handleCancelar = () => {
    navigate(rutas.listado, { replace: true })
  }

  return (
    <Container as="main" className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {/* Encabezado y botones superiores */}
          <header className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1">Modificar Clasificación del corredor</h1>
              <p className="small text-secondary mb-0">ID Registro: #{id ? `CL-2024-${id}` : 'CL-2024-8921'}</p>
            </div>

            <div className="d-flex gap-2">
              <Button type="button" variant="outline-secondary" onClick={handleCancelar}>
                Cancelar
              </Button>

              <Button type="submit" form="form-clasificacion" variant="success" className="d-inline-flex align-items-center gap-2">
                <Save size={16} aria-hidden="true" />
                Guardar modificación
              </Button>
            </div>
          </header>

          <Form id="form-clasificacion" onSubmit={handleGuardar} noValidate>
            {/* Sección 1: información del corredor (solo lectura) */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
                  <User size={18} aria-hidden="true" />
                  Información del Corredor
                </h2>

                <Badge bg="secondary-subtle" text="secondary-emphasis" className="d-inline-flex align-items-center gap-1">
                  <Lock size={12} aria-hidden="true" />
                  Datos de Inscripción
                </Badge>
              </Card.Header>

              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <CampoBloqueado id="infoNombre" etiqueta="Nombre y apellido" valor={llegada?.apellidosNombres ?? 'Juan Pérez Mónaco'} />
                  </Col>
                  <Col md={4}>
                    <CampoBloqueado id="infoDni" etiqueta="DNI" valor={llegada?.dni ?? '34.567.890'} />
                  </Col>
                  <Col md={4}>
                    <CampoBloqueado id="infoSexo" etiqueta="Sexo" valor={llegada?.sexo ?? 'Masculino'} />
                  </Col>
                  <Col md={4}>
                    <CampoBloqueado id="infoDorsal" etiqueta="Dorsal" valor={`# ${llegada?.dorsal ?? '1045'}`} />
                  </Col>
                  <Col md={4}>
                    <CampoBloqueado id="infoClub" etiqueta="Organización / Club" valor={llegada?.club ?? 'Running Team Sur'} />
                  </Col>
                  <Col md={4}>
                    <CampoBloqueado id="infoEquipo" etiqueta="Equipo" valor={llegada?.equipo ?? 'Elite'} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Sección 2: datos de clasificación (editables) */}
            <Card className="border-start border-success border-4">
              <Card.Body>
                <h2 className="h6 fw-bold d-flex align-items-center gap-2 mb-1">
                  <Pencil size={18} className="text-success" aria-hidden="true" />
                  Datos de Clasificación
                </h2>
                <p className="small text-secondary">Modifique los resultados oficiales de carrera.</p>

                <div className="bg-body-tertiary border rounded p-3">
                  <Form.Group controlId="tipoClasificacion" className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Tipo de clasificación</Form.Label>
                    <Form.Control type="text" value="General" disabled readOnly />
                  </Form.Group>

                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Group controlId="tiempoOficial">
                        <Form.Label className="small fw-semibold text-secondary">Tiempo Oficial</Form.Label>

                        <InputGroup hasValidation>
                          <Form.Control
                            type="text"
                            value={tiempoOficial}
                            placeholder="HH:MM:SS.mmm"
                            isInvalid={!!errores.tiempoOficial}
                            onChange={(e) => {
                              setTiempoOficial(e.target.value)
                              setErrores({})
                            }}
                          />

                          <InputGroup.Text>
                            <Clock size={16} aria-hidden="true" />
                          </InputGroup.Text>

                          <Form.Control.Feedback type="invalid">{errores.tiempoOficial}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="puestoGeneral">
                        <Form.Label className="small fw-semibold text-secondary">Puesto General</Form.Label>

                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          value={puestoGeneral}
                          isInvalid={!!errores.puestoGeneral}
                          onChange={(e) => {
                            setPuestoGeneral(e.target.value)
                            setErrores({})
                          }}
                        />

                        <Form.Control.Feedback type="invalid">{errores.puestoGeneral}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="categoria">
                        <Form.Label className="small fw-semibold text-secondary">Categoría</Form.Label>

                        <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                          <option value="Masc 18 a 29 años">Masc 18 a 29 años</option>
                          <option value="Masc 30 a 34 años">Masc 30 a 34 años</option>
                          <option value="Masc 35 a 39 años">Masc 35 a 39 años</option>
                          <option value="Masc 40 a 44 años">Masc 40 a 44 años</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default ModClasifCorredor