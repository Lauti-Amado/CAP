import { useState } from 'react'
import './DetalleCorredor.css'

type EstadoVerificacion = {
  estado: 'pagado' | 'verificado' | 'pendiente'
}

type CorredorDetalle = {
  nombre: string
  dni: string
  categoria: string
  distancia: string
  talleRemera: string
  clubTeam: string

  inscripcion: EstadoVerificacion
  aptoMedico?: EstadoVerificacion

  habilitadoParaRetirarKit: boolean

  chipRfid: string
}

type DetalleCorredorProps = {
  corredor: CorredorDetalle | null
  onVolver: () => void
  onEntregarKit: (dorsal: string) => void
}

function DetalleCorredor({
  corredor,
  onVolver,
  onEntregarKit,
}: DetalleCorredorProps) {
  const [dorsal, setDorsal] = useState('')

  if (!corredor) {
    return null
  }

  const puedeEntregar =
    corredor.habilitadoParaRetirarKit &&
    dorsal.trim() !== ''

  const entregarKit = () => {
    if (!puedeEntregar) {
      return
    }

    onEntregarKit(dorsal.trim())
  }

  return (
    <main className="detalle-corredor">

      {/* =========================
          ENCABEZADO
          ========================= */}

      <header className="detalle-corredor__encabezado">

        <div>
          <h1>Detalle de Corredor</h1>

          <p>
            Verificando datos para entrega de material.
          </p>
        </div>

        <button
          type="button"
          className="detalle-corredor__volver"
          onClick={onVolver}
        >
          ← Volver al buscador
        </button>

      </header>


      {/* =========================
          CONTENIDO
          ========================= */}

      <section className="detalle-corredor__contenido">

        {/* =========================
            COLUMNA IZQUIERDA
            ========================= */}

        <div className="detalle-corredor__columna-izquierda">

          {/* Datos del corredor */}

          <article className="detalle-corredor__tarjeta corredor">

            <div className="detalle-corredor__avatar">
              ♙
            </div>

            <h2>{corredor.nombre}</h2>

            <p className="detalle-corredor__dni">
              DNI: {corredor.dni}
            </p>

            <div className="detalle-corredor__separador" />

            <div className="detalle-corredor__datos">

              <div>
                <span>CATEGORÍA</span>
                <strong>{corredor.categoria}</strong>
              </div>

              <div>
                <span>DISTANCIA</span>
                <strong>{corredor.distancia}</strong>
              </div>

              <div>
                <span>TALLE REMERA</span>
                <strong>{corredor.talleRemera}</strong>
              </div>

              <div>
                <span>CLUB/TEAM</span>
                <strong>{corredor.clubTeam}</strong>
              </div>

            </div>

          </article>


          {/* Estado de pago */}

          <article className="detalle-corredor__tarjeta pago">

            <div className="detalle-corredor__titulo-pago">

              <span className="detalle-corredor__icono-pago">
                $
              </span>

              <strong>ESTADO DE PAGO</strong>

            </div>

            <div className="detalle-corredor__estado">

              <span>Inscripción</span>

              <small>
                {corredor.inscripcion.estado === 'pagado'
                  ? '✓ PAGADO'
                  : 'PENDIENTE'}
              </small>

            </div>

            {corredor.aptoMedico && (
              <div className="detalle-corredor__estado">

                <span>Apto Médico</span>

                <small>
                  {corredor.aptoMedico.estado === 'verificado'
                    ? '✓ VERIFICADO'
                    : 'PENDIENTE'}
                </small>

              </div>
            )}

          </article>

        </div>


        {/* =========================
            COLUMNA DERECHA
            ========================= */}

        <article className="detalle-corredor__kit">

          <div
            className={
              corredor.habilitadoParaRetirarKit
                ? 'detalle-corredor__kit-header habilitado'
                : 'detalle-corredor__kit-header no-habilitado'
            }
          >
            {corredor.habilitadoParaRetirarKit
              ? '● HABILITADO PARA RETIRAR KIT'
              : '● NO HABILITADO PARA RETIRAR KIT'}
          </div>


          <div className="detalle-corredor__kit-contenido">

            <span className="detalle-corredor__kit-titulo">
              DATOS DEL KIT ASIGNADO
            </span>


            <div className="detalle-corredor__kit-datos">

              {/* Dorsal ingresado manualmente */}

              <div className="detalle-corredor__kit-dato">

                <label htmlFor="dorsal">
                  DORSAL A ASIGNAR
                </label>

                <input
                  id="dorsal"
                  type="text"
                  inputMode="numeric"
                  value={dorsal}
                  onChange={(event) => setDorsal(event.target.value)}
                  placeholder="Ej. 125"
                />

              </div>


              {/* Chip RFID */}

              <div className="detalle-corredor__kit-dato">

                <span>CHIP RFID</span>

                <strong>
                  {corredor.chipRfid}
                </strong>

              </div>

            </div>


            {/* Aviso */}

            <div className="detalle-corredor__aviso">

              <span>ⓘ</span>

              <p>
                Asegúrese de verificar que el número de dorsal
                físico coincida con el número mostrado en pantalla
                antes de confirmar la entrega. El sistema registrará
                la fecha y hora exacta de esta acción.
              </p>

            </div>


            {/* Entregar kit */}

            <button
              type="button"
              className="detalle-corredor__entregar"
              disabled={!puedeEntregar}
              onClick={entregarKit}
            >
              ▣ Entregar kit
            </button>

          </div>

        </article>

      </section>

    </main>
  )
}

export default DetalleCorredor