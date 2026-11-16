//frontend/src/pages/clasificacion/modales/FinalizarCarreraModal.tsx
import { AlertTriangle, Flag } from 'lucide-react'
import ConfirmacionModal from '../../../components/modales/ConfirmacionModal'
import { Alert, Badge } from 'react-bootstrap'

type FinalizarCarreraModalProps = {
  show: boolean
  nombreCarrera: string
  tiempoTranscurrido: string
  estadoActual: string
  onConfirmar: () => void
  onCancelar: () => void
}

function FinalizarCarreraModal({
  show,
  nombreCarrera,
  tiempoTranscurrido,
  estadoActual,
  onConfirmar,
  onCancelar,
}: FinalizarCarreraModalProps) {
  return (
    <ConfirmacionModal
      show={show}
      encabezado="simple"
      titulo="¿Desea finalizar la carrera?"
      textoConfirmar="Finalizar carrera"
      iconoConfirmar={<Flag size={16} aria-hidden="true" />}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      <p className="text-secondary mb-3">
        Al finalizar la carrera se detendrá el cronómetro oficial y la carrera quedará marcada como finalizada.
      </p>

      <section className="bg-body-tertiary border rounded p-3">
        <div className="row g-3">
          <div className="col-6">
            <div className="small text-secondary">Carrera</div>
            <div className="fw-bold">{nombreCarrera}</div>
          </div>
          <div className="col-6">
            <div className="small text-secondary">Tiempo transcurrido</div>
            <div className="fs-4 fw-bold font-monospace text-success">{tiempoTranscurrido}</div>
          </div>
          <div className="col-12">
            <div className="small text-secondary">Estado actual</div>
            <Badge pill bg="success-subtle" text="success-emphasis">{estadoActual}</Badge>
          </div>
        </div>
      </section>

      <Alert variant="danger" className="d-flex gap-3 mt-3 mb-0" role="alert">
        <AlertTriangle size={20} className="flex-shrink-0" aria-hidden="true" />
        <div>
          <strong className="d-block">Advertencia</strong>
          Esta acción finalizará el tiempo oficial de la carrera.
        </div>
      </Alert>
    </ConfirmacionModal>
  )
}

export default FinalizarCarreraModal