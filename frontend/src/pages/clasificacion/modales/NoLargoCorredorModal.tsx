//frontend/src/pages/clasificacion/modales/NoLargoCorredorModal.tsx
import { UserMinus } from 'lucide-react'
import ConfirmacionModal from '../../../components/modales/ConfirmacionModal'
import { Badge, ListGroup } from 'react-bootstrap'
import type { ResumenCorredor } from '../../../types/clasificacion'

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
      <section className="bg-body-tertiary border rounded p-3">
        <h3 className="h6 fw-bold text-success mb-3">
          {unico ? 'Resumen del Corredor' : 'Corredores seleccionados'}
        </h3>
        <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
          <ListGroup variant="flush">
            {corredores.map((corredor) => (
              <ListGroup.Item
                key={corredor.id}
                className="d-flex justify-content-between align-items-center bg-transparent px-0"
              >
                <span>
                  <strong>{corredor.dorsal}</strong> {corredor.nombre}
                  <span className="d-block text-secondary small">DNI {corredor.dni} · {corredor.categoria}</span>
                </span>
                <Badge pill bg="secondary-subtle" text="secondary-emphasis">No largó</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </section>
    </ConfirmacionModal>
  )
}

export default NoLargoCorredorModal