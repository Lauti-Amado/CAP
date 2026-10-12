import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './DetalleCorredor.css'
import {
  UserRound,
  CircleDollarSign,
  PackageCheck,
  Info,
  BadgeCheck,
} from 'lucide-react'
//Borrar lo siguiente para sacar MOCK
import { corredoresMock } from './entregaKitsMock'

function DetalleCorredor() {
  const { dni } = useParams<{ dni: string }>()
  const navigate = useNavigate()

  const [dorsal, setDorsal] = useState('')
  // MOCK TEMPORAL
  // TODO: Reemplazar la búsqueda en corredoresMock por el GET al backend.
  // GET /api/corredores/{dni}
  // const corredor = await obtenerCorredorPorDni(dni)
  const corredor = corredoresMock.find(
    (corredor) => corredor.dni === dni
  )
  //Hasta aca se borra xd
  if (!corredor) {
    return (
      <main className="detalle-corredor">
        <h1>Corredor no encontrado</h1>
        <button
          type="button"
          onClick={() => navigate('/entrega-kits')}
        >
          Volver al buscador
        </button>
      </main>
    )
  }

  const puedeEntregar =
    corredor.habilitadoParaRetirarKit &&
    dorsal.trim() !== ''

  const entregarKit = () => {
    if (!puedeEntregar) {
      return
    }

    console.log('Entregar kit', {
      dni: corredor.dni,
      dorsal: dorsal.trim(),
    })
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
          onClick={() => navigate('/entrega-kits')}
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
              <UserRound size={32} />
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
                <CircleDollarSign size={22} />
              </span>

              <strong>ESTADO DE PAGO</strong>

            </div>

            <div className="detalle-corredor__estado">

              <span>Inscripción</span>

              <small>
                {corredor.inscripcion.estado === 'pagado' ? (
                  <>
                    <BadgeCheck size={16} />
                    PAGADO
                  </>
                ) : (
                  'PENDIENTE'
                )}
              </small>

            </div>

            {corredor.aptoMedico && (
              <div className="detalle-corredor__estado">

                <span>Apto Médico</span>

                <small>
                  {corredor.aptoMedico.estado === 'verificado' ? (
                    <>
                      <BadgeCheck size={16} />
                      VERIFICADO
                    </>
                  ) : (
                    'PENDIENTE'
                  )}
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
                  placeholder={
                    corredor.habilitadoParaRetirarKit
                      ? 'Ej. 125'
                      : 'No habilitado'
                  }
                  disabled={!corredor.habilitadoParaRetirarKit}
                />

              </div>


              {/* Chip RFID */}

              <div className="detalle-corredor__kit-dato">

                <span>CHIP RFID</span>

                <strong>—</strong>
                {/*
                  TODO: Implementar cuando se conecte el backend.

                  El CHIP RFID dependerá del dorsal asignado.
                  Al ingresar/asignar el dorsal, se deberá obtener
                  el CHIP RFID correspondiente.

                  Por ahora no se muestra ningún chip.
                */}
              </div>

            </div>


            {/* Aviso */}

            <div className="detalle-corredor__aviso">

              <span>
                <Info size={20} />
              </span>

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
              <PackageCheck size={20} />
              Entregar kit
            </button>

          </div>

        </article>

      </section>

    </main>
  )
}

export default DetalleCorredor