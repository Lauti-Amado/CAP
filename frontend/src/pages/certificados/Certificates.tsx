//frontend/src/pages/certificados/Certificates.tsx
import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Award, Eye, FilePenLine, Plus, Save, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Alert, Badge, Button, ButtonGroup, Card, Col, Form, ListGroup, Row, Spinner } from 'react-bootstrap'
import { certificatePreview, crearPlantillaNueva, dynamicFields, type CertificateTemplate } from './certificateData'
import ConfirmacionModal from '../../components/modales/ConfirmacionModal'
import { ApiError } from '../../services/apiService'
import { activarPlantilla, actualizarPlantilla, crearPlantilla, eliminarPlantilla, listarPlantillas } from '../../services/plantillasCertificadoService'
import { plantillaCertificadoSchema } from '../../schemas/plantillaCertificadoSchema'
import { validar } from '../../utils/validar'

const textoError = (error: unknown, defecto: string) =>
  error instanceof ApiError ? error.message : defecto

type Props = { onEditorChange: (editing: boolean) => void }

function CertificateCanvas({ template, editor = false }: { template: CertificateTemplate; editor?: boolean }) {
  const data = certificatePreview
  const { primaryColor, secondaryColor, backgroundColor, rounded, shadows, fontFamily } = template.style
  const esquina = { '--bs-border-color': secondaryColor, width: 84, height: 84 } as CSSProperties

  return (
    <div
      className="ratio mx-auto overflow-hidden border"
      style={{
        '--bs-aspect-ratio': editor ? '57%' : '127%',
        maxWidth: editor ? 620 : 390,
        backgroundColor,
        borderRadius: rounded ? 8 : 0,
        boxShadow: shadows ? '0 8px 20px rgba(27,41,60,.12)' : 'none',
        fontFamily,
      } as CSSProperties}
    >
      <div className="d-flex flex-column align-items-center justify-content-center text-center p-5">
        <span className="position-absolute top-0 start-0 m-3 border-top border-start border-4 opacity-25" style={esquina} />
        <span className="position-absolute bottom-0 end-0 m-3 border-bottom border-end border-4 opacity-25" style={esquina} />

        {!editor && (
          <div className="d-inline-flex rounded-circle bg-primary-subtle p-2 mb-4" style={{ color: primaryColor }}>
            <Award size={21} />
          </div>
        )}

        <h3 className={`fw-bold mb-0 ${editor ? 'fs-3' : 'fs-4'}`} style={{ color: primaryColor }}>
          {editor ? 'CERTIFICADO DE PARTICIPACIÓN' : 'CERTIFICADO'}
        </h3>
        {!editor && <div className="small text-secondary text-uppercase mt-2">DE PARTICIPACIÓN</div>}

        <p className="small my-3">Se otorga el presente reconocimiento a:</p>
        <strong className={editor ? 'd-block w-50 p-2 bg-success-subtle fs-5' : 'fs-5'}>
          {editor ? '{{nombre}}' : data.participantName}
        </strong>
        <hr className="w-25 my-2 opacity-50" style={{ color: primaryColor }} />
        <p className="small my-3">
          Por su destacada participación y haber<br />completado exitosamente la carrera <b>{data.raceName}</b><br />el día {data.participationDate}.
        </p>

        {!editor && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 w-75 d-flex justify-content-between small">
            <span>{data.signerName}</span>
            <span style={{ color: primaryColor }}>{data.sealText}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateManager({ onEdit }: { onEdit: (template: CertificateTemplate) => void }) {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [porEliminar, setPorEliminar] = useState<CertificateTemplate | null>(null)

  const cargar = useCallback(async () => {
    try {
      const lista = await listarPlantillas()
      setTemplates(lista)
      setSelectedId((actual) =>
        lista.some((item) => item.id === actual) ? actual : (lista.find((item) => item.active) ?? lista[0])?.id ?? null,
      )
    } catch (e) {
      setError(textoError(e, 'No se pudieron cargar las plantillas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const selected = templates.find((item) => item.id === selectedId) ?? null

  const ejecutar = async (accion: () => Promise<unknown>, mensajeError: string) => {
    setProcesando(true)
    setError(null)
    try {
      await accion()
      await cargar()
    } catch (e) {
      setError(textoError(e, mensajeError))
    } finally {
      setProcesando(false)
    }
  }

  const confirmarEliminacion = async () => {
    if (!porEliminar) return
    const plantilla = porEliminar
    setPorEliminar(null)
    await ejecutar(() => eliminarPlantilla(plantilla.id), 'No se pudo eliminar la plantilla.')
  }

  const date = selected
    ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(selected.updatedAt))
    : ''

  return (
    <div className="p-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Plantillas de Certificados</h1>
          <p className="small text-secondary mb-0">Gestión y personalización de diplomas atléticos.</p>
        </div>
        <Button variant="success" size="sm" onClick={() => onEdit(crearPlantillaNueva())}>
          <Plus size={14} className="me-1" /> Nueva plantilla
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : !selected ? (
        <Alert variant="info">Todavía no hay plantillas. Creá la primera con “Nueva plantilla”.</Alert>
      ) : (
        <Row className="g-3">
          <Col xs={12} lg={8} xl={9}>
            <Card as="section" className="shadow-sm">
              <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-white">
                <div>
                  <b>{selected.name}</b>
                  {selected.active && (
                    <Badge pill bg="success-subtle" text="success-emphasis" className="ms-2">ACTIVA</Badge>
                  )}
                  <small className="d-block text-secondary">Última modificación: {date}</small>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {!selected.active && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      disabled={procesando}
                      onClick={() => ejecutar(() => activarPlantilla(selected.id), 'No se pudo activar la plantilla.')}
                    >
                      Usar como activa
                    </Button>
                  )}
                  <Button variant="outline-secondary" size="sm"><Eye size={13} className="me-1" /> Vista previa</Button>
                  <Button variant="outline-primary" size="sm" onClick={() => onEdit(selected)}>
                    <FilePenLine size={13} className="me-1" /> Editar
                  </Button>
                </div>
              </Card.Header>

              <Card.Body>
                <Card.Title as="h2" className="h6 fw-bold mb-3">Vista Previa Generada</Card.Title>
                <div className="bg-body-tertiary border rounded p-3">
                  <CertificateCanvas template={selected} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4} xl={3}>
            <div className="d-flex flex-column gap-3">
              <Card as="section" className="shadow-sm">
                <Card.Body>
                  <Card.Title as="h2" className="h6 fw-bold">Campos Dinámicos</Card.Title>
                  <Card.Text className="small text-secondary">
                    Variables disponibles para insertar en la plantilla.
                  </Card.Text>
                  <ListGroup variant="flush" className="small">
                    {dynamicFields.map((field) => (
                      <ListGroup.Item key={field.id} className="d-flex justify-content-between gap-2 px-0">
                        <span className="text-success">{field.label}</span>
                        <code>{field.token}</code>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>

              <Card as="section" className="shadow-sm">
                <Card.Body>
                  <Card.Title as="h2" className="h6 fw-bold mb-3">Mis Plantillas</Card.Title>
                  <ListGroup>
                    {templates.map((template) => {
                      const noSePuedeEliminar = template.active || templates.length === 1
                      return (
                        <ListGroup.Item
                          key={template.id}
                          variant={selectedId === template.id ? 'success' : undefined}
                          className="d-flex align-items-center gap-2"
                        >
                          <Button
                            variant="link"
                            className="flex-grow-1 p-0 text-start text-decoration-none text-body"
                            onClick={() => setSelectedId(template.id)}
                          >
                            <span className="d-block fw-bold small">{template.name}</span>
                            <span className="d-block small text-secondary">{template.active ? 'En uso' : 'Inactiva'}</span>
                            <small className="text-secondary">
                              {selectedId === template.id ? 'Seleccionada' : 'Ver esta plantilla'}
                            </small>
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-danger"
                            aria-label={`Eliminar ${template.name}`}
                            title={noSePuedeEliminar ? 'No se puede eliminar la plantilla en uso ni la última plantilla' : 'Eliminar plantilla'}
                            disabled={noSePuedeEliminar || procesando}
                            onClick={() => setPorEliminar(template)}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </Button>
                        </ListGroup.Item>
                      )
                    })}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      )}

      <ConfirmacionModal
        show={porEliminar !== null}
        titulo="¿Está seguro de que desea eliminar esta plantilla?"
        descripcion="La plantilla se eliminará completamente del sistema."
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  )
}

function CertificateEditor({ initial, onClose }: { initial: CertificateTemplate; onClose: () => void }) {
  const [template, setTemplate] = useState(initial)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const validacion = validar(plantillaCertificadoSchema, template)
  const errorNombre = validacion.errores.name

  const setStyle = <K extends keyof CertificateTemplate['style']>(key: K, value: CertificateTemplate['style'][K]) =>
    setTemplate((current) => ({ ...current, style: { ...current.style, [key]: value } }))

  const guardar = async () => {
    if (!validacion.ok) return
    setGuardando(true)
    setError(null)
    try {
      if (template.id) await actualizarPlantilla(template)
      else await crearPlantilla(template)
      onClose()
    } catch (e) {
      setError(textoError(e, 'No se pudo guardar la plantilla.'))
      setGuardando(false)
    }
  }

  return (
    <div className="d-flex flex-column">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-white border-bottom px-4 py-3">
        <h1 className="h4 fw-bold mb-0">{template.id ? 'Editar' : 'Nueva'} Plantilla de Certificado</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" disabled={guardando} onClick={onClose}>
            <X size={13} className="me-1" /> Cancelar
          </Button>
          <Button variant="success" size="sm" disabled={guardando || !validacion.ok} onClick={guardar}>
            {guardando ? <Spinner size="sm" className="me-1" /> : <Save size={13} className="me-1" />} Guardar Cambios
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="m-3 mb-0">{error}</Alert>}

      <Row className="g-0">
        <Col as="aside" xs={12} md={4} lg={3} className="bg-white border-end p-3">
          <h2 className="h6 fw-bold mb-3">◉ Estilo Visual</h2>

          <Form.Group className="mb-3" controlId="certificate-name">
            <Form.Label className="small fw-bold text-secondary">NOMBRE</Form.Label>
            <Form.Control
              size="sm"
              maxLength={100}
              value={template.name}
              isInvalid={!!errorNombre}
              onChange={(event) => setTemplate((current) => ({ ...current, name: event.target.value }))}
            />
            <Form.Control.Feedback type="invalid">{errorNombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Label className="small fw-bold text-secondary">COLORES</Form.Label>
          <div className="d-flex gap-3 mb-3">
            {(['primaryColor', 'secondaryColor', 'backgroundColor'] as const).map((key) => (
              <Form.Control
                key={key}
                type="color"
                className="form-control-color"
                aria-label={key}
                title={key}
                value={template.style[key]}
                onChange={(event) => setStyle(key, event.target.value)}
              />
            ))}
          </div>

          <Form.Group className="mb-3" controlId="certificate-font">
            <Form.Label className="small fw-bold text-secondary">TIPOGRAFÍA</Form.Label>
            <Form.Select size="sm" value={template.style.fontFamily} onChange={(event) => setStyle('fontFamily', event.target.value)}>
              <option value="Arial, Helvetica, sans-serif">Inter (Predefinida)</option>
              <option value="Georgia, serif">Clásica</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </Form.Select>
          </Form.Group>

          <Form.Label className="small fw-bold text-secondary">DETALLES</Form.Label>
          <Form.Check
            type="switch"
            id="certificate-rounded"
            className="small"
            label="Esquinas Redondeadas"
            checked={template.style.rounded}
            onChange={(event) => setStyle('rounded', event.target.checked)}
          />
          <Form.Check
            type="switch"
            id="certificate-shadows"
            className="small"
            label="Sombras Suaves"
            checked={template.style.shadows}
            onChange={(event) => setStyle('shadows', event.target.checked)}
          />
          <Form.Check
            type="switch"
            id="certificate-watermark"
            className="small"
            label="Marca de Agua"
            checked={template.style.watermark}
            onChange={(event) => setStyle('watermark', event.target.checked)}
          />

          <h2 className="h6 fw-bold mt-4 mb-2">◉ Campos Dinámicos</h2>
          <p className="small text-secondary">Estas variables se completarán automáticamente para cada corredor.</p>
          <ListGroup variant="flush" className="small">
            {dynamicFields.map((field) => (
              <ListGroup.Item key={field.id} className="d-flex justify-content-between align-items-center gap-2 px-0">
                <code>{field.token}</code>
                <span className="text-secondary">{field.label}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col as="section" xs={12} md={8} lg={9} className="position-relative d-flex align-items-center justify-content-center bg-body-tertiary p-4">
          <div className="w-100">
            <CertificateCanvas template={template} editor />
          </div>
          <ButtonGroup size="sm" className="position-absolute bottom-0 end-0 m-3 bg-white">
            <Button variant="outline-secondary" aria-label="Alejar"><ZoomOut size={13} /></Button>
            <Button variant="outline-secondary" disabled>85%</Button>
            <Button variant="outline-secondary" aria-label="Acercar"><ZoomIn size={13} /></Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
  )
}

export default function Certificates({ onEditorChange }: Props) {
  const [editing, setEditing] = useState<CertificateTemplate | null>(null)
  const openEditor = (template: CertificateTemplate) => { setEditing(template); onEditorChange(true) }
  const closeEditor = () => { setEditing(null); onEditorChange(false) }
  return editing ? <CertificateEditor initial={editing} onClose={closeEditor} /> : <TemplateManager onEdit={openEditor} />
}