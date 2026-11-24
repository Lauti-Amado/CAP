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
      size="lg"
      backdrop="static"
      keyboard={false}
      aria-labelledby="corredor-no-encontrado-titulo"
    >
      <Modal.Body className="text-center p-5">
        <span className="d-inline-flex rounded-circle bg-danger-subtle text-danger p-4 mb-4">
          <AlertTriangle size={48} />
        </span>

        <h1 id="corredor-no-encontrado-titulo" className="h3 fw-bold mb-3">
          Corredor no encontrado
        </h1>

        <p className="fs-6 text-secondary mb-4">
          No se encontró ningún corredor inscripto con el DNI <strong className="text-body">{dni}</strong>.
          Verifique el número ingresado o proceda a realizar una nueva inscripción.
        </p>

        <div className="bg-body-tertiary rounded p-4 mb-4 fs-6 d-flex flex-column gap-3 text-start">
          <div className="d-flex justify-content-between">
            <span className="text-secondary">DNI ingresado:</span>
            <strong>{dni}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-secondary">Estado:</span>
            <strong className="text-danger">No inscripto</strong>
          </div>
        </div>

        <div className="d-grid gap-3">
          <Button type="button" variant="success" size="lg" onClick={onInscribir}>
            Inscribir corredor
          </Button>
          <Button type="button" variant="outline-secondary" size="lg" onClick={onVolver}>
            Ingresar otro DNI
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default CorredorNoEncontrado
