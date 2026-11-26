//frontend/src/components/modales/ConfirmacionModal.tsx
import type { ReactNode } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { AlertTriangle } from 'lucide-react'

type ConfirmacionModalProps = {
  show: boolean
  titulo: string
  descripcion?: string
  textoConfirmar: string
  iconoConfirmar?: ReactNode
  /** destacado: encabezado rosado. simple: encabezado blanco con botón de cerrar. */
  encabezado?: 'destacado' | 'simple'
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
  cargando = false,
  children,
  onConfirmar,
  onCancelar,
}: ConfirmacionModalProps) {
  const destacado = encabezado === 'destacado'

  return (
    <Modal show={show} onHide={onCancelar} centered aria-labelledby="confirmacion-modal-titulo">
      <Modal.Header
        closeButton={!destacado}
        className={destacado ? 'bg-danger-subtle border-danger-subtle' : undefined}
      >
        <div className="d-flex align-items-center gap-3">
          <span
            className={`d-inline-flex text-danger rounded-circle ${
              destacado ? 'bg-danger bg-opacity-10 p-2' : ''
            }`}
          >
            <AlertTriangle size={destacado ? 22 : 18} aria-hidden="true" />
          </span>
          <Modal.Title as="h2" id="confirmacion-modal-titulo" className="h5 fw-bold mb-0">
            {titulo}
          </Modal.Title>
        </div>
      </Modal.Header>

      {(descripcion || children) && (
        <Modal.Body>
          {descripcion && (
            <p className={`text-secondary ${children ? 'mb-3' : 'mb-0'}`}>{descripcion}</p>
          )}
          {children}
        </Modal.Body>
      )}

      <Modal.Footer className="bg-body-tertiary border-0">
        <Button variant="outline-secondary" disabled={cargando} onClick={onCancelar}>
          Cancelar
        </Button>

        <Button
          variant="danger"
          className="d-inline-flex align-items-center gap-2"
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