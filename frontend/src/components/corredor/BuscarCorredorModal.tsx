//frontend/src/components/corredor/BuscarCorredorModal.tsx
import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import BuscarCorredorForm from './BuscarCorredorForm'

type BuscarCorredorModalProps = {
  show: boolean
  titulo?: string
  descripcion?: string
  /**
   * Recibe el DNI ingresado. Devuelve un mensaje de error si no se pudo continuar,
   * o null si salió bien (en ese caso el contenedor decide qué hacer y cierra el modal).
   */
  onBuscar: (dni: string) => string | null
  onCerrar: () => void
}

function BuscarCorredorModal({
  show,
  titulo = 'Buscar corredor',
  descripcion = 'Ingrese el DNI del participante.',
  onBuscar,
  onCerrar,
}: BuscarCorredorModalProps) {
  const [error, setError] = useState<string | null>(null)

  const cerrar = () => {
    setError(null)
    onCerrar()
  }

  return (
    <Modal
      show={show}
      onHide={cerrar}
      centered
      dialogClassName="buscar-corredor-modal__dialog"
      contentClassName="buscar-corredor-modal"
      aria-labelledby="buscar-corredor-titulo"
    >
      <Modal.Header closeButton className="border-0 pb-0" />
      <Modal.Body className="pt-0 pb-4 px-4">
        <BuscarCorredorForm
          titulo={titulo}
          descripcion={descripcion}
          error={error}
          onCambio={() => setError(null)}
          onBuscar={(dni) => setError(onBuscar(dni))}
        />
      </Modal.Body>
    </Modal>
  )
}

export default BuscarCorredorModal