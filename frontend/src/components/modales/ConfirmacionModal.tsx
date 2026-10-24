//frontend/src/components/modales/ConfirmacionModal.tsx
import type { ReactNode } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { AlertTriangle } from 'lucide-react'
import './ConfirmacionModal.css'

type ConfirmacionModalProps = {
  show: boolean
  titulo: string
  descripcion?: string
  textoConfirmar: string
  iconoConfirmar?: ReactNode
  /** destacado: encabezado rosado con descripción. simple: encabezado blanco con botón de cerrar. */
  encabezado?: 'destacado' | 'simple'
  /** danger: rojo. danger-oscuro: rojo oscuro. */
  variante?: 'danger' | 'danger-oscuro'
  cargando?: boolean
  children?: ReactNode
  onConfirmar: () => void
  onCancelar: () => void
}

function ConfirmacionModal({
  show,
  titulo,
  descripcion,
  textoConfirmar,
  iconoConfirmar,
  encabezado = 'destacado',
  variante = 'danger',
  cargando = false,
  children,
  onConfirmar,
  onCancelar,
}: ConfirmacionModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancelar}
      centered
      dialogClassName="confirmacion-modal__dialog"
      contentClassName="confirmacion-modal"
      aria-labelledby="confirmacion-modal-titulo"
    >
      <div className={`confirmacion-modal__encabezado confirmacion-modal__encabezado--${encabezado}`}>
        <span className="confirmacion-modal__icono">
          <AlertTriangle size={encabezado === 'destacado' ? 18 : 14} aria-hidden="true" />
        </span>

        <div className="confirmacion-modal__textos">
          <h2 id="confirmacion-modal-titulo">{titulo}</h2>
          {descripcion && <p>{descripcion}</p>}
        </div>

        {encabezado === 'simple' && (
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCancelar} />
        )}
      </div>

      {children && <Modal.Body className="confirmacion-modal__cuerpo">{children}</Modal.Body>}

      <Modal.Footer className="confirmacion-modal__pie">
        <Button variant="outline-secondary" size="sm" disabled={cargando} onClick={onCancelar}>
          Cancelar
        </Button>

        <Button
          variant="danger"
          size="sm"
          className={`confirmacion-modal__confirmar confirmacion-modal__confirmar--${variante}`}
          disabled={cargando}
          onClick={onConfirmar}
        >
          {cargando ? <Spinner animation="border" size="sm" aria-hidden="true" /> : iconoConfirmar}
          {textoConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmacionModal