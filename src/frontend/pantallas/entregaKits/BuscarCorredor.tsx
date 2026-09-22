import { useState } from 'react'
import './BuscarCorredor.css'
import Sidebar from '../../componentes/Sidebar'

type CarreraActiva = {
  id: number
  nombre: string
  edicion: number
}

type UltimaEntrega = {
  id: number
  nombreCorredor: string
  numeroKit: number
  distancia: string
}

type ResultadoBusqueda = 'encontrado' | 'no-encontrado' | null

function BuscarCorredor() {
  const [dni, setDni] = useState('')

  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)

  const [resultadoBusqueda, setResultadoBusqueda] = useState<ResultadoBusqueda>(null)

  const [carreraActiva] = useState<CarreraActiva | null>(null)

  const [ultimasEntregas] = useState<UltimaEntrega[]>([])

  const buscarCorredor = () => {
    if (dni.trim() === '') {
      setErrorBusqueda('Por favor, ingrese un DNI válido.')
      return
    }
    setErrorBusqueda(null)
    // Aquí puedes agregar la lógica para buscar al corredor por DNI
  }

  return (
    <main className="buscar-corredor">

      <section className="buscar-corredor__cabecera">
        <div>
          {carreraActiva && (
            <>
              <span>
                {carreraActiva.nombre}
              </span>

              <small>
                Edición {carreraActiva.edicion}
              </small>
            </>
          )}
        </div>

        <button type="button">
          Ingresar a lista de inscripciones
        </button>
      </section>

      <section className="buscar-corredor__contenido">

        <div className="buscar-corredor__icono">
          ♧
        </div>

        <h1>Buscar corredor</h1>

        <p>
          Ingrese el DNI del participante para asignar su kit de carrera.
        </p>

        <div className="buscar-corredor__busqueda">
          <input
            type="text"
            value={dni}
            onChange={(event) => setDni(event.target.value)}
            placeholder="Ej. 35123456"
          />

          <button type="button"
            onClick={buscarCorredor}>
            Buscar
          </button>
        </div>
        {errorBusqueda && (
          <p className="buscar-corredor__error">
            {errorBusqueda}
          </p>
        )}
      </section>

      {ultimasEntregas.length > 0 && (
        <section className="buscar-corredor__ultimas">

          <span>Últimas entregas</span>

          {ultimasEntregas.map((entrega) => (
            <div key={entrega.id}>
              <strong>
                {entrega.nombreCorredor}
              </strong>

              <small>
                Kit #{entrega.numeroKit} · {entrega.distancia}
              </small>
            </div>
          ))}

        </section>
      )}

      <Sidebar />
    </main>
  )
}

export default BuscarCorredor