import { useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  UserRound,
  Flag,
  CreditCard,
  PackageCheck,
  Stethoscope,
} from 'lucide-react'

import type { InscripcionDetalle } from '../../types/inscripcion'

import './DetalleInscripcion.css'

// MOCK TEMPORAL
// Borrar cuando se conecte con el backend.
import { inscripcionDetalleMock } from './detalleInscripcionMock'

function DetalleInscripcion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // MOCK TEMPORAL
  // Actualmente se obtiene el detalle desde el mock.
  //
  // TODO BACKEND:
  // Reemplazar esta búsqueda por:
  //
  // GET /api/inscripciones/{id}
  //
  // const respuesta = await fetch(`/api/inscripciones/${id}`)
  // const inscripcion: InscripcionDetalle = await respuesta.json()

  const inscripcion: InscripcionDetalle | undefined =
    inscripcionDetalleMock.find(
      (inscripcion) => inscripcion.id === Number(id)
    )

  const volverAInscripciones = () => {
    navigate('/entrega-kits/inscripciones')
  }

  if (!inscripcion) {
    return (
      <main className="detalle-inscripcion">
        <button
          type="button"
          className="detalle-inscripcion__volver"
          onClick={volverAInscripciones}
        >
          <ArrowLeft size={16} />
          <span>Volver a inscripciones</span>
        </button>

        <section className="detalle-inscripcion__no-encontrada">
          <h1>Inscripción no encontrada</h1>

          <p>
            No se encontró una inscripción asociada al identificador indicado.
          </p>
        </section>
      </main>
    )
  }

  /*
   * Determina si el kit ya fue entregado.
   *
   * Si está pendiente:
   * - No se muestra el dorsal.
   * - No se muestra el chip RFID.
   * - No se muestra la fecha de entrega.
   *
   * Si está entregado:
   * - Se muestran dorsal.
   * - Se muestra chip RFID.
   * - Se muestra fecha de entrega.
   */
  const kitEntregado =
    inscripcion.entrega.estadoKit.toLowerCase() === 'entregado'

  return (
    <main className="detalle-inscripcion">
      {/* =========================
          VOLVER
      ========================= */}

      <button
        type="button"
        className="detalle-inscripcion__volver"
        onClick={volverAInscripciones}
      >
        <ArrowLeft size={16} />
        <span>Volver a inscripciones</span>
      </button>

      {/* =========================
          ENCABEZADO
      ========================= */}

      <header className="detalle-inscripcion__encabezado">
        <div className="detalle-inscripcion__titulo">
          <div className="detalle-inscripcion__titulo-principal">
            <h1>Inscripción #{inscripcion.numero}</h1>

            <span className="detalle-inscripcion__estado">
              {inscripcion.estado}
            </span>
          </div>

          <p className="detalle-inscripcion__info">
            <Flag size={14} />

            <span>{inscripcion.carrera}</span>

            <span>·</span>

            <span>
              Fecha de inscripción: {inscripcion.fechaInscripcion}
            </span>
          </p>
        </div>
      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <section className="detalle-inscripcion__contenido">
        {/* =========================
            COLUMNA PRINCIPAL
        ========================= */}

        <div className="detalle-inscripcion__principal">
          {/* =========================
              DATOS DEL CORREDOR
          ========================= */}

          <article className="detalle-inscripcion__tarjeta">
            <div className="detalle-inscripcion__tarjeta-header">
              <h2>
                <UserRound size={18} />
                <span>Datos del corredor</span>
              </h2>
            </div>

            <div className="detalle-inscripcion__tarjeta-contenido">
              <div className="detalle-inscripcion__datos-corredor">
                <div>
                  <span>NOMBRE COMPLETO</span>
                  <strong>
                    {inscripcion.corredor.nombreCompleto}
                  </strong>
                </div>

                <div>
                  <span>DNI</span>
                  <strong>
                    {inscripcion.corredor.dni}
                  </strong>
                </div>

                <div>
                  <span>FECHA DE NACIMIENTO</span>
                  <strong>
                    {inscripcion.corredor.fechaNacimiento}
                  </strong>
                </div>

                <div>
                  <span>GÉNERO</span>
                  <strong>
                    {inscripcion.corredor.genero}
                  </strong>
                </div>

                <div>
                  <span>TELÉFONO</span>
                  <strong>
                    {inscripcion.corredor.telefono}
                  </strong>
                </div>

                <div>
                  <span>EMAIL</span>
                  <strong>
                    {inscripcion.corredor.email}
                  </strong>
                </div>

                <div>
                  <span>DISCAPACIDAD</span>
                  <strong>
                    {inscripcion.corredor.discapacidad}
                  </strong>
                </div>

                <div>
                  <span>EQUIPO / CLUB</span>
                  <strong>
                    {inscripcion.corredor.equipoClub}
                  </strong>
                </div>
              </div>
            </div>
          </article>

          {/* =========================
              DATOS DE PARTICIPACIÓN
          ========================= */}

          <article className="detalle-inscripcion__tarjeta">
            <div className="detalle-inscripcion__tarjeta-header">
              <h2>
                <Flag size={18} />
                <span>Datos de participación</span>
              </h2>
            </div>

            <div className="detalle-inscripcion__tarjeta-contenido">
              <div className="detalle-inscripcion__participacion">
                <div>
                  <span>CARRERA</span>
                  <strong>
                    {inscripcion.carrera}
                  </strong>
                </div>

                <div>
                  <span>DISTANCIA</span>
                  <strong>
                    {inscripcion.participacion.distancia}
                  </strong>
                </div>

                <div>
                  <span>TIPO</span>
                  <strong>
                    {inscripcion.participacion.tipo}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* =========================
            COLUMNA LATERAL
        ========================= */}

        <div className="detalle-inscripcion__lateral">
          {/* =========================
              PAGO
          ========================= */}

          <article className="detalle-inscripcion__tarjeta">
            <div className="detalle-inscripcion__tarjeta-header">
              <h2>
                <CreditCard size={18} />
                <span>Pago</span>
              </h2>
            </div>

            <div className="detalle-inscripcion__tarjeta-contenido">
              <div className="detalle-inscripcion__pago">
                <div>
                  <span>Estado</span>

                  <strong
                    className={
                      inscripcion.pago.estado.toLowerCase() === 'pagado'
                        ? 'detalle-inscripcion__badge detalle-inscripcion__badge--pagado'
                        : 'detalle-inscripcion__badge detalle-inscripcion__badge--pendiente'
                    }
                  >
                    {inscripcion.pago.estado}
                  </strong>
                </div>

                <div>
                  <span>MÉTODO</span>

                  <strong>
                    {inscripcion.pago.metodo}
                  </strong>
                </div>

                <div className="detalle-inscripcion__total">
                  <span>TOTAL</span>

                  <strong>
                    {inscripcion.pago.total}
                  </strong>
                </div>
              </div>

              <div className="detalle-inscripcion__adicionales">
                <span>ADICIONALES ADQUIRIDOS</span>

                <strong>
                  {inscripcion.pago.adicionales}
                </strong>
              </div>
            </div>
          </article>

          {/* =========================
              ENTREGA Y REQUISITOS
          ========================= */}

          <article className="detalle-inscripcion__tarjeta">
            <div className="detalle-inscripcion__tarjeta-header">
              <h2>
                <PackageCheck size={18} />
                <span>Entrega y Requisitos</span>
              </h2>
            </div>

            <div className="detalle-inscripcion__tarjeta-contenido">
              {/* KIT */}

              <div className="detalle-inscripcion__kit-header">
                <span>KIT Y DORSAL</span>

                <strong
                  className={
                    kitEntregado
                      ? 'detalle-inscripcion__badge detalle-inscripcion__badge--kit-entregado'
                      : 'detalle-inscripcion__badge detalle-inscripcion__badge--kit-pendiente'
                  }
                >
                  {inscripcion.entrega.estadoKit}
                </strong>
              </div>

              {/* DATOS DEL KIT
                  Solo aparecen si fue entregado */}

              {kitEntregado && (
                <>
                  <div className="detalle-inscripcion__kit">
                    <div>
                      <span>Dorsal</span>

                      <strong>
                        #{inscripcion.entrega.dorsal}
                      </strong>
                    </div>

                    <div>
                      <span>Chip RFID</span>

                      <strong>
                        {inscripcion.entrega.chipRfid}
                      </strong>
                    </div>
                  </div>

                  <small className="detalle-inscripcion__fecha-entrega">
                    Entregado: {inscripcion.entrega.fechaEntrega}
                  </small>
                </>
              )}

              {/* APTO MÉDICO */}

              <div className="detalle-inscripcion__apto">
                <span>
                  <Stethoscope size={14} />
                  <span>APTO MÉDICO</span>
                </span>

                <strong>
                  {inscripcion.entrega.aptoMedico}
                </strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export default DetalleInscripcion