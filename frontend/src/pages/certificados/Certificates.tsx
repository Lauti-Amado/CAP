import { useState } from 'react'
import { Award, Eye, FilePenLine, Plus, Save, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { certificatePreview, certificateTemplates, dynamicFields, type CertificateTemplate } from './certificateData'

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
      <strong className={editor ? 'certificate-token' : ''}>{editor ? '{{nombre}} {{apellido}}' : data.participantName}</strong>
      <div className="certificate-rule" style={{ background: template.style.primaryColor }} />
      <p>Por su destacada participación y haber<br />completado exitosamente la carrera <b>{data.raceName}</b><br />el día {data.participationDate}.</p>
      {!editor && <div className="certificate-signatures"><span>{data.signerName}</span><span style={{ color: template.style.primaryColor }}>{data.sealText}</span></div>}
    </div>
  )
}

function TemplateManager({ onEdit }: { onEdit: (template: CertificateTemplate) => void }) {
  const [selectedId, setSelectedId] = useState(certificateTemplates[0].id)
  const selected = certificateTemplates.find((item) => item.id === selectedId) ?? certificateTemplates[0]
  const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(selected.updatedAt))

  return (
    <div className="certificates-page container-fluid">
      <div className="certificate-titlebar d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div><h1>Plantillas de Certificados</h1><p>Gestión y personalización de diplomas atléticos.</p></div>
        <button className="btn btn-success btn-sm d-inline-flex align-items-center gap-2" type="button" onClick={() => onEdit(certificateTemplates[2])}><Plus size={14} /> Nueva plantilla</button>
      </div>
      <div className="row g-3">
        <div className="col-12 col-lg-8"><section className="certificate-workspace card h-100">
          <article className="certificate-summary">
            <div><b>{selected.name}</b> {selected.active && <span>ACTIVA</span>}<small>Última modificación: {date}</small></div>
            <div className="d-flex flex-wrap gap-2"><button className="btn btn-outline-secondary btn-sm" type="button"><Eye size={13} /> Vista previa</button><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => onEdit(selected)}><FilePenLine size={13} /> Editar</button></div>
          </article>
          <h2>Vista Previa Generada</h2>
          <div className="certificate-preview-shell"><CertificateCanvas template={selected} /></div>
        </section></div>
        <aside className="col-12 col-lg-4 d-flex flex-column gap-3">
          <section className="certificate-sidecard card"><h2>Campos Dinámicos</h2><p>Variables disponibles para insertar en la plantilla.</p><ul className="dynamic-field-list">{dynamicFields.map((field) => <li key={field.id}><span>{field.label}</span><code>{field.token}</code></li>)}</ul></section>
          <section className="certificate-sidecard card"><h2>Mis Plantillas</h2><div className="template-list list-group list-group-flush">{certificateTemplates.map((template) => <div className={`template-item${selectedId === template.id ? ' selected' : ''}`} key={template.id}><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setSelectedId(template.id)}><b>{template.name}</b><span>{template.active ? 'En uso' : 'Inactiva'}</span><small>{selectedId === template.id ? 'Configurar' : 'Usar esta plantilla'}</small></button><Trash2 size={13} aria-label={`Eliminar ${template.name}`} /></div>)}</div></section>
        </aside>
      </div>
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (value: boolean) => void; label: string }) {
  return <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" role="switch" checked={value} aria-label={label} onChange={(event) => onChange(event.target.checked)} /></div>
}

function CertificateEditor({ initial, onClose }: { initial: CertificateTemplate; onClose: () => void }) {
  const [template, setTemplate] = useState(initial)
  const setStyle = <K extends keyof CertificateTemplate['style']>(key: K, value: CertificateTemplate['style'][K]) => setTemplate((current) => ({ ...current, style: { ...current.style, [key]: value } }))
  return (
    <div className="certificate-editor">
      <div className="editor-titlebar d-flex flex-wrap justify-content-between align-items-center gap-3"><h1>Editar Plantilla de Certificado</h1><div><button className="btn btn-outline-secondary btn-sm" type="button" onClick={onClose}><X size={13} /> Cancelar</button><button className="btn btn-success btn-sm d-inline-flex align-items-center gap-2" type="button" onClick={onClose}><Save size={13} /> Guardar Cambios</button></div></div>
      <div className="row g-0 flex-grow-1">
        <aside className="editor-controls col-12 col-md-4 col-xl-3">
          <h2>◉ Estilo Visual</h2>
          <label>COLORES</label><div className="color-controls d-flex gap-3">{(['primaryColor', 'secondaryColor', 'backgroundColor'] as const).map((key) => <input className="form-control form-control-color" key={key} type="color" aria-label={key} value={template.style[key]} onChange={(event) => setStyle(key, event.target.value)} />)}</div>
          <label htmlFor="certificate-font">TIPOGRAFÍA</label><select className="form-select form-select-sm" id="certificate-font" value={template.style.fontFamily} onChange={(event) => setStyle('fontFamily', event.target.value)}><option value="Arial, Helvetica, sans-serif">Inter (Predefinida)</option><option value="Georgia, serif">Clásica</option><option value="Verdana, sans-serif">Verdana</option></select>
          <label>DETALLES</label><div className="style-option"><span>Esquinas Redondeadas</span><Toggle label="Esquinas redondeadas" value={template.style.rounded} onChange={(value) => setStyle('rounded', value)} /></div><div className="style-option"><span>Sombras Suaves</span><Toggle label="Sombras suaves" value={template.style.shadows} onChange={(value) => setStyle('shadows', value)} /></div><div className="style-option"><span>Marca de Agua</span><Toggle label="Marca de agua" value={template.style.watermark} onChange={(value) => setStyle('watermark', value)} /></div>
          <h2 className="fields-heading">◉ Campos Dinámicos</h2><p>Estas variables se completarán automáticamente para cada corredor.</p><ul className="editor-fields">{dynamicFields.map((field) => <li key={field.id}><code>{field.token}</code><span>{field.label}</span></li>)}</ul>
        </aside>
        <section className="editor-canvas col-12 col-md-8 col-xl-9"><CertificateCanvas template={template} editor /><div className="zoom-controls"><button className="btn btn-outline-secondary btn-sm" type="button"><ZoomOut size={13} /></button><span>85%</span><button className="btn btn-outline-secondary btn-sm" type="button"><ZoomIn size={13} /></button></div></section>
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
