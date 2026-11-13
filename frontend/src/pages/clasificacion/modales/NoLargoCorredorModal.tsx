//frontend/src/pages/clasificacion/modales/NoLargoCorredorModal.tsx
import { UserMinus } from 'lucide-react'
import ConfirmacionModal from '../../../components/modales/ConfirmacionModal'
import type { ResumenCorredor } from '../../../types/clasificacion'
import './ModalesClasificacion.css'

type NoLargoCorredorModalProps = {
  corredores: ResumenCorredor[]
  onConfirmar: () => void
  onCancelar: () => void
}

function NoLargoCorredorModal({ corredores, onConfirmar, onCancelar }: NoLargoCorredorModalProps) {
  const cantidad = corredores.length
  const unico = cantidad === 1

  return (
    <ConfirmacionModal
      show={cantidad > 0}
      encabezado="destacado"
      titulo={
        unico
          ? '¿Desea marcar al corredor como "No largó"?'
          : `¿Desea marcar a ${cantidad} corredores como "No largó"?`
      }
      descripcion="No se les registrará puesto ni tiempo. Se podrá corregir más adelante."
      textoConfirmar={unico ? 'Marcar No largó' : `Marcar No largó (${cantidad})`}
      iconoConfirmar={<UserMinus size={13} aria-hidden="true" />}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      <section className="modal-resumen">
        <h3 className="modal-resumen__titulo">
          {unico ? 'Resumen del Corredor' : 'Corredores seleccionados'}
        </h3>
        <ul className="modal-lista">
          {corredores.map((corredor) => (
            <li key={corredor.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span>
                <strong>{corredor.dorsal}</strong> {corredor.nombre}
                <span className="d-block text-secondary small">DNI {corredor.dni} · {corredor.categoria}</span>
              </span>
              <span className="modal-pill modal-pill--gris">No largó</span>
            </li>
          ))}
        </ul>
      </section>
    </ConfirmacionModal>
  )
}

export default NoLargoCorredorModal