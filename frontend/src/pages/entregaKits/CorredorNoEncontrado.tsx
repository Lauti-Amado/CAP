
import { Modal, Button } from 'react-bootstrap'
import { AlertTriangle } from 'lucide-react'
import './CorredorNoEncontrado.css'

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
      show={true}
      onHide={onVolver}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="corredor-no-encontrado__dialog"
      contentClassName="corredor-no-encontrado"
      aria-labelledby="corredor-no-encontrado-titulo"
    >
      <Modal.Body>
        <div className="corredor-no-encontrado__icono">
          <AlertTriangle size={28} />
        </div>

        <h1 id="corredor-no-encontrado-titulo">
          Corredor no encontrado
        </h1>

        <p>
          No se encontró ningún corredor inscripto con el DNI{' '}
          <strong>{dni}</strong>. Verifique el número ingresado o
          proceda a realizar una nueva inscripción.
        </p>

        <div className="corredor-no-encontrado__datos">
          <div>
            <span>DNI ingresado:</span>
            <strong>{dni}</strong>
          </div>

          <div>
            <span>Estado:</span>
            <strong>No inscripto</strong>
          </div>
        </div>

        <div className="corredor-no-encontrado__acciones">
          <Button
            type="button"
            variant="success"
            onClick={onInscribir}
          >
            Inscribir corredor
          </Button>

          <Button
            type="button"
            variant="outline-secondary"
            onClick={onVolver}
          >
            Ingresar otro DNI
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default CorredorNoEncontrado
