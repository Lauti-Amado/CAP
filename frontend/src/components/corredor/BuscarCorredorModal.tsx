
import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import BuscarCorredorForm from './BuscarCorredorForm'

type BuscarCorredorModalProps = {
  show: boolean
  titulo?: string
  descripcion?: string
  onBuscar: (dni: string) => string | null | Promise<string | null>
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
  const [cargando, setCargando] = useState(false)

  const cerrar = () => {
    setError(null)
    onCerrar()
  }

  const buscar = async (dni: string) => {
    if (cargando) return

    setCargando(true)
    setError(null)

    try {
      const mensaje = await onBuscar(dni)
      setError(mensaje)
    } catch {
      setError('Ocurrió un error al buscar el corredor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      show={show}
      onHide={cerrar}
      centered
      aria-labelledby="buscar-corredor-titulo"
    >
      <Modal.Header closeButton className="border-0 pb-0" />
      <Modal.Body className="pt-0 pb-4 px-4">
        <BuscarCorredorForm
          titulo={titulo}
          descripcion={descripcion}
          error={error}
          textoBoton={cargando ? 'Buscando...' : 'Buscar'}
          onCambio={() => setError(null)}
          onBuscar={buscar}
        />
      </Modal.Body>
    </Modal>
  )
}

export default BuscarCorredorModal
