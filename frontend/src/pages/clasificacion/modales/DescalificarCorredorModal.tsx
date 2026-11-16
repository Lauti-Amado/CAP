//frontend/src/pages/clasificacion/modales/DescalificarCorredorModal.tsx
import { ArrowRight, UserX } from 'lucide-react'
import ConfirmacionModal from '../../../components/modales/ConfirmacionModal'
import { Badge, ListGroup } from 'react-bootstrap'
import type { EstadoClasificacion, ResumenCorredor } from '../../../types/clasificacion'

type DescalificarCorredorModalProps = {
  corredores: ResumenCorredor[]
  onConfirmar: () => void
  onCancelar: () => void
}

const colorEstado: Record<EstadoClasificacion, string> = {
  Oficial: 'success',
  'En revisión': 'warning',
  Descalificado: 'danger',
  'No largó': 'secondary',
}

function PillEstado({ estado }: { estado: EstadoClasificacion }) {
  const color = colorEstado[estado]
  return <Badge pill bg={`${color}-subtle`} text={`${color}-emphasis`}>{estado}</Badge>
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
        <section className="bg-body-tertiary border rounded p-3">
          <h3 className="h6 fw-bold text-success mb-3">Resumen del Corredor</h3>

          <div className="row g-2">
            <div className="col-6">
              <div className="small text-secondary">Dorsal</div>
              <div className="fw-bold">{unico.dorsal}</div>
            </div>
            <div className="col-6">
              <div className="small text-secondary">Corredor</div>
              <div className="fw-bold">{unico.nombre}</div>
            </div>
            <div className="col-6">
              <div className="small text-secondary">DNI</div>
              <div className="fw-bold">{unico.dni}</div>
            </div>
            <div className="col-6">
              <div className="small text-secondary">Categoría</div>
              <div className="fw-bold">{unico.categoria}</div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
            <div>
              <div className="small text-secondary">Estado actual</div>
              <PillEstado estado={unico.estado} />
            </div>
            <ArrowRight size={14} className="text-secondary" aria-hidden="true" />
            <div className="text-end">
              <div className="small text-secondary">Estado posterior</div>
              <PillEstado estado="Descalificado" />
            </div>
          </div>
        </section>
      )}

      {cantidad > 1 && (
        <section className="bg-body-tertiary border rounded p-3">
          <h3 className="h6 fw-bold text-success mb-3">Corredores seleccionados</h3>
          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            <ListGroup variant="flush">
              {corredores.map((corredor) => (
                <ListGroup.Item
                  key={corredor.id}
                  className="d-flex justify-content-between align-items-center bg-transparent px-0"
                >
                  <span><strong>{corredor.dorsal}</strong> {corredor.nombre}</span>
                  <PillEstado estado={corredor.estado} />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </section>
      )}
    </ConfirmacionModal>
  )
}

export default DescalificarCorredorModal