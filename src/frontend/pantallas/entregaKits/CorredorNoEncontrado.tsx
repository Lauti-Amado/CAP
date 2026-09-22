import './CorredorNoEncontrado.css'

type CorredorNoEncontradoProps = {
  onInscribir: () => void
  onVolver: () => void
}

function CorredorNoEncontrado({
  onInscribir,
  onVolver,
}: CorredorNoEncontradoProps) {
  return (
    <div className="corredor-no-encontrado__overlay">
      <section className="corredor-no-encontrado">

        <div className="corredor-no-encontrado__icono">
          !
        </div>

        <h1>Corredor no encontrado</h1>

        <p>
          No se encontró un corredor asociado al DNI ingresado.
        </p>

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
            Volver al buscador de corredores
          </button>
        </div>

      </section>
    </div>
  )
}

export default CorredorNoEncontrado