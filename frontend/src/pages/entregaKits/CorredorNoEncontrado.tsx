//frontend/src/pages/entregaKits/CorredorNoEncontrado.tsx
import { Modal, Button } from 'react-bootstrap'
import { AlertTriangle } from 'lucide-react'

type CorredorNoEncontradoProps = {
  dni: string
  onInscribir: () => void
  onVolver: () => void
}

function CorredorNoEncontrado({
  dni,
  onInscribir,
  onVolver,
}: CorredorNoEncontradoProps) {
  return (
    <Modal
      show
      onHide={onVolver}
      centered
      size="sm"
      backdrop="static"
      keyboard={false}
      aria-labelledby="corredor-no-encontrado-titulo"
    >
      <Modal.Body className="text-center p-4">
        <span className="d-inline-flex rounded-circle bg-danger-subtle text-danger p-3 mb-3">
          <AlertTriangle size={28} />
        </span>

        <h1 id="corredor-no-encontrado-titulo" className="h5 fw-bold">
          Corredor no encontrado
        </h1>

        <p className="small text-secondary">
          No se encontró ningún corredor inscripto con el DNI <strong className="text-body">{dni}</strong>.
          Verifique el número ingresado o proceda a realizar una nueva inscripción.
        </p>

        <div className="bg-body-tertiary rounded p-3 mb-3 small d-flex flex-column gap-2 text-start">
          <div className="d-flex justify-content-between">
            <span className="text-secondary">DNI ingresado:</span>
            <strong>{dni}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-secondary">Estado:</span>
            <strong className="text-danger">No inscripto</strong>
          </div>
        </div>

        <div className="d-grid gap-2">
          <Button type="button" variant="success" onClick={onInscribir}>
            Inscribir corredor
          </Button>
          <Button type="button" variant="outline-secondary" onClick={onVolver}>
            Ingresar otro DNI
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default CorredorNoEncontrado
