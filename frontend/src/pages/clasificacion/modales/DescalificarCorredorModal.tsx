//frontend/src/pages/clasificacion/modales/DescalificarCorredorModal.tsx
import { ArrowRight, UserX } from 'lucide-react'
import ConfirmacionModal from '../../../components/modales/ConfirmacionModal'
import type { EstadoClasificacion, ResumenCorredor } from '../../../types/clasificacion'
import './ModalesClasificacion.css'

type DescalificarCorredorModalProps = {
  corredores: ResumenCorredor[]
  onConfirmar: () => void
  onCancelar: () => void
}

const clasePill: Record<EstadoClasificacion, string> = {
  Oficial: 'modal-pill--verde',
  'En revisión': 'modal-pill--ambar',
  Descalificado: 'modal-pill--rojo',
}

function DescalificarCorredorModal({ corredores, onConfirmar, onCancelar }: DescalificarCorredorModalProps) {
  const cantidad = corredores.length
  const unico = cantidad === 1 ? corredores[0] : null

  return (
    <ConfirmacionModal
      show={cantidad > 0}
      encabezado="destacado"
      titulo={
        unico
          ? '¿Está seguro de que desea descalificar al corredor?'
          : `¿Está seguro de que desea descalificar a ${cantidad} corredores?`
      }
      descripcion={
        unico
          ? 'El corredor será marcado como descalificado en la clasificación.'
          : 'Los corredores serán marcados como descalificados en la clasificación.'
      }
      textoConfirmar={unico ? 'Descalificar' : `Descalificar (${cantidad})`}
      iconoConfirmar={<UserX size={13} aria-hidden="true" />}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      {unico && (
        <section className="modal-resumen">
          <h3 className="modal-resumen__titulo">Resumen del Corredor</h3>

          <div className="row g-2">
            <div className="col-6">
              <div className="modal-resumen__etiqueta">Dorsal</div>
              <div className="modal-resumen__valor">{unico.dorsal}</div>
            </div>
            <div className="col-6">
              <div className="modal-resumen__etiqueta">Corredor</div>
              <div className="modal-resumen__valor">{unico.nombre}</div>
            </div>
            <div className="col-6">
              <div className="modal-resumen__etiqueta">DNI</div>
              <div className="modal-resumen__valor">{unico.dni}</div>
            </div>
            <div className="col-6">
              <div className="modal-resumen__etiqueta">Categoría</div>
              <div className="modal-resumen__valor">{unico.categoria}</div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
            <div>
              <div className="modal-resumen__etiqueta">Estado actual</div>
              <span className={`modal-pill ${clasePill[unico.estado]}`}>{unico.estado}</span>
            </div>
            <ArrowRight size={14} className="text-secondary" aria-hidden="true" />
            <div className="text-end">
              <div className="modal-resumen__etiqueta">Estado posterior</div>
              <span className={`modal-pill ${clasePill.Descalificado}`}>Descalificado</span>
            </div>
          </div>
        </section>
      )}

      {cantidad > 1 && (
        <section className="modal-resumen">
          <h3 className="modal-resumen__titulo">Corredores seleccionados</h3>
          <ul className="modal-lista">
            {corredores.map((corredor) => (
              <li key={corredor.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span>
                  <strong>{corredor.dorsal}</strong> {corredor.nombre}
                </span>
                <span className={`modal-pill ${clasePill[corredor.estado]}`}>{corredor.estado}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ConfirmacionModal>
  )
}

export default DescalificarCorredorModal