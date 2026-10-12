import './CorredorNoEncontrado.css'
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
    <div className="corredor-no-encontrado__overlay">
      <section className="corredor-no-encontrado">

        <div className="corredor-no-encontrado__icono">
          <AlertTriangle size={28} />
        </div>

        <h1>Corredor no encontrado</h1>

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
          <button
            type="button"
            onClick={onInscribir}
          >
            Inscribir corredor
          </button>

          <button
            type="button"
            onClick={onVolver}
          >
            Ingresar otro DNI
          </button>
        </div>

      </section>
    </div>
  )
}

export default CorredorNoEncontrado