//frontend/src/pages/clasificacion/modales/FinalizarCarreraModal.tsx
import { AlertTriangle, Flag } from 'lucide-react'
import ConfirmacionModal from '../../../components/modales/ConfirmacionModal'
import './ModalesClasificacion.css'

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
      variante="danger-oscuro"
      titulo="¿Desea finalizar la carrera?"
      textoConfirmar="Finalizar carrera"
      iconoConfirmar={<Flag size={13} aria-hidden="true" />}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      <p className="small text-secondary mb-3">
        Al finalizar la carrera se detendrá el cronómetro oficial y la carrera quedará marcada como finalizada.
      </p>

      <section className="modal-resumen">
        <div className="row g-2">
          <div className="col-6">
            <div className="modal-resumen__etiqueta">Carrera</div>
            <div className="modal-resumen__valor">{nombreCarrera}</div>
          </div>
          <div className="col-6">
            <div className="modal-resumen__etiqueta">Tiempo transcurrido</div>
            <div className="modal-resumen__tiempo">{tiempoTranscurrido}</div>
          </div>
          <div className="col-12">
            <div className="modal-resumen__etiqueta">Estado actual</div>
            <span className="modal-pill modal-pill--verde">{estadoActual}</span>
          </div>
        </div>
      </section>

      <div className="modal-advertencia" role="alert">
        <AlertTriangle size={14} className="flex-shrink-0" aria-hidden="true" />
        <div>
          <strong className="d-block">Advertencia</strong>
          Esta acción finalizará el tiempo oficial de la carrera.
        </div>
      </div>
    </ConfirmacionModal>
  )
}

export default FinalizarCarreraModal