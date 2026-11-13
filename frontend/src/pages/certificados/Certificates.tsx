//frontend/src/pages/certificados/Certificates.tsx
import { useCallback, useEffect, useState } from 'react'
import { Award, Eye, FilePenLine, Plus, Save, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { certificatePreview, crearPlantillaNueva, dynamicFields, type CertificateTemplate } from './certificateData'
import './Certificates.css'
import ConfirmacionModal from '../../components/modales/ConfirmacionModal'
import { ApiError } from '../../services/apiService'
import { activarPlantilla, actualizarPlantilla, crearPlantilla, eliminarPlantilla, listarPlantillas,} from '../../services/plantillasCertificadoService'

const textoError = (error: unknown, defecto: string) =>
  error instanceof ApiError ? error.message : defecto

type Props = { onEditorChange: (editing: boolean) => void }

function CertificateCanvas({ template, editor = false }: { template: CertificateTemplate; editor?: boolean }) {
  const data = certificatePreview
  return (
    <div className={`certificate-paper${editor ? ' certificate-paper--editor' : ''}`} style={{ backgroundColor: template.style.backgroundColor, borderRadius: template.style.rounded ? 8 : 0, boxShadow: template.style.shadows ? '0 8px 20px rgba(27,41,60,.12)' : 'none', fontFamily: template.style.fontFamily }}>
      <span className="certificate-corner certificate-corner--top" style={{ borderColor: template.style.secondaryColor }} />
      <span className="certificate-corner certificate-corner--bottom" style={{ borderColor: template.style.secondaryColor }} />
      <div className="certificate-mark" style={{ color: template.style.primaryColor }}><Award size={21} /></div>
      <h3 style={{ color: template.style.primaryColor }}>{editor ? 'CERTIFICADO DE PARTICIPACIÓN' : 'CERTIFICADO'}</h3>
      {!editor && <div className="certificate-subtitle">DE PARTICIPACIÓN</div>}
      <p>Se otorga el presente reconocimiento a:</p>
      <strong className={editor ? 'certificate-token' : ''}>{editor ? '{{nombre}}' : data.participantName}</strong>
      <div className="certificate-rule" style={{ background: template.style.primaryColor }} />
      <p>Por su destacada participación y haber<br />completado exitosamente la carrera <b>{data.raceName}</b><br />el día {data.participationDate}.</p>
      {!editor && <div className="certificate-signatures"><span>{data.signerName}</span><span style={{ color: template.style.primaryColor }}>{data.sealText}</span></div>}
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
    <div className="certificates-page">
      <div className="certificate-titlebar">
        <div><h1>Plantillas de Certificados</h1><p>Gestión y personalización de diplomas atléticos.</p></div>
        <Button variant="success" size="sm" onClick={() => onEdit(crearPlantillaNueva())}><Plus size={14} className="me-1" /> Nueva plantilla</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : !selected ? (
        <Alert variant="info">Todavía no hay plantillas. Creá la primera con “Nueva plantilla”.</Alert>
      ) : (
        <div className="certificate-layout">
          <section className="certificate-workspace">
            <article className="certificate-summary">
              <div><b>{selected.name}</b> {selected.active && <span>ACTIVA</span>}<small>Última modificación: {date}</small></div>
              <div className="certificate-summary-actions d-flex gap-2">
                {!selected.active && (
                  <Button variant="outline-success" size="sm" disabled={procesando}
                    onClick={() => ejecutar(() => activarPlantilla(selected.id), 'No se pudo activar la plantilla.')}>
                    Usar como activa
                  </Button>
                )}
                <Button variant="outline-secondary" size="sm"><Eye size={13} className="me-1" /> Vista previa</Button>
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(selected)}><FilePenLine size={13} className="me-1" /> Editar</Button>
              </div>
            </article>
            <h2>Vista Previa Generada</h2>
            <div className="certificate-preview-shell"><CertificateCanvas template={selected} /></div>
          </section>
          <aside className="certificate-rightbar">
            <section className="certificate-sidecard"><h2>Campos Dinámicos</h2><p>Variables disponibles para insertar en la plantilla.</p><ul className="dynamic-field-list">{dynamicFields.map((field) => <li key={field.id}><span>{field.label}</span><code>{field.token}</code></li>)}</ul></section>
            <section className="certificate-sidecard">
              <h2>Mis Plantillas</h2>
              <div className="template-list">
                {templates.map((template) => {
                  const noSePuedeEliminar = template.active || templates.length === 1
                  return (
                    <div className={`template-item${selectedId === template.id ? ' selected' : ''}`} key={template.id}>
                      <button type="button" onClick={() => setSelectedId(template.id)}>
                        <b>{template.name}</b>
                        <span>{template.active ? 'En uso' : 'Inactiva'}</span>
                        <small>{selectedId === template.id ? 'Seleccionada' : 'Ver esta plantilla'}</small>
                      </button>
                      <Button
                        variant="link"
                        size="sm"
                        className="template-item__eliminar p-0 text-danger"
                        aria-label={`Eliminar ${template.name}`}
                        title={noSePuedeEliminar ? 'No se puede eliminar la plantilla en uso ni la última plantilla' : 'Eliminar plantilla'}
                        disabled={noSePuedeEliminar || procesando}
                        onClick={() => setPorEliminar(template)}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </section>
          </aside>
        </div>
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

function Toggle({ value, onChange, label }: { value: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button className={`style-toggle${value ? ' enabled' : ''}`} type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)}><span /></button>
}

function CertificateEditor({ initial, onClose }: { initial: CertificateTemplate; onClose: () => void }) {
  const [template, setTemplate] = useState(initial)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nombreValido = template.name.trim().length > 0

  const setStyle = <K extends keyof CertificateTemplate['style']>(key: K, value: CertificateTemplate['style'][K]) => setTemplate((current) => ({ ...current, style: { ...current.style, [key]: value } }))

  const guardar = async () => {
    if (!nombreValido) return
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
    <div className="certificate-editor">
      <div className="editor-titlebar">
        <h1>{template.id ? 'Editar' : 'Nueva'} Plantilla de Certificado</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" disabled={guardando} onClick={onClose}><X size={13} className="me-1" /> Cancelar</Button>
          <Button variant="success" size="sm" disabled={guardando || !nombreValido} onClick={guardar}>
            {guardando ? <Spinner size="sm" className="me-1" /> : <Save size={13} className="me-1" />} Guardar Cambios
          </Button>
        </div>
      </div>
      {error && <Alert variant="danger" className="m-3 mb-0">{error}</Alert>}
      <div className="editor-layout">
        <aside className="editor-controls">
          <h2>◉ Estilo Visual</h2>
          <Form.Group className="mb-2">
            <Form.Label htmlFor="certificate-name">NOMBRE</Form.Label>
            <Form.Control id="certificate-name" size="sm" maxLength={100} value={template.name} isInvalid={!nombreValido}
              onChange={(event) => setTemplate((current) => ({ ...current, name: event.target.value }))} />
            <Form.Control.Feedback type="invalid">El nombre es obligatorio.</Form.Control.Feedback>
          </Form.Group>
          <label>COLORES</label><div className="color-controls">{(['primaryColor', 'secondaryColor', 'backgroundColor'] as const).map((key) => <input key={key} type="color" aria-label={key} value={template.style[key]} onChange={(event) => setStyle(key, event.target.value)} />)}</div>
          <label htmlFor="certificate-font">TIPOGRAFÍA</label><select id="certificate-font" value={template.style.fontFamily} onChange={(event) => setStyle('fontFamily', event.target.value)}><option value="Arial, Helvetica, sans-serif">Inter (Predefinida)</option><option value="Georgia, serif">Clásica</option><option value="Verdana, sans-serif">Verdana</option></select>
          <label>DETALLES</label><div className="style-option"><span>Esquinas Redondeadas</span><Toggle label="Esquinas redondeadas" value={template.style.rounded} onChange={(value) => setStyle('rounded', value)} /></div><div className="style-option"><span>Sombras Suaves</span><Toggle label="Sombras suaves" value={template.style.shadows} onChange={(value) => setStyle('shadows', value)} /></div><div className="style-option"><span>Marca de Agua</span><Toggle label="Marca de agua" value={template.style.watermark} onChange={(value) => setStyle('watermark', value)} /></div>
          <h2 className="fields-heading">◉ Campos Dinámicos</h2><p>Estas variables se completarán automáticamente para cada corredor.</p><ul className="editor-fields">{dynamicFields.map((field) => <li key={field.id}><code>{field.token}</code><span>{field.label}</span></li>)}</ul>
        </aside>
        <section className="editor-canvas"><CertificateCanvas template={template} editor /><div className="zoom-controls"><button type="button"><ZoomOut size={13} /></button><span>85%</span><button type="button"><ZoomIn size={13} /></button></div></section>
      </div>
    </div>
  )
}

export default function Certificates({ onEditorChange }: Props) {
  const [editing, setEditing] = useState<CertificateTemplate | null>(null)
  const openEditor = (template: CertificateTemplate) => { setEditing(template); onEditorChange(true) }
  const closeEditor = () => { setEditing(null); onEditorChange(false) }
  return editing ? <CertificateEditor initial={editing} onClose={closeEditor} /> : <TemplateManager onEdit={openEditor} />
}
