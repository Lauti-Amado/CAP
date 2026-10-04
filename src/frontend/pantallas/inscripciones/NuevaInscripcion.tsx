import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  Check,
  Eye,
  Plus,
  Search,
  UserRoundPlus,
  X,
  Footprints,
  CreditCard,
} from 'lucide-react'

import type { ContactoEmergencia } from '../../types/inscripcion'

import './NuevaInscripcion.css'

// MOCK TEMPORAL
//
// Los contactos, carrera, distancias y productos
// se obtienen actualmente desde nuevaInscripcionMock.
//
// TODO BACKEND:
// Reemplazar estas fuentes por consultas reales
// al backend.

import {
  contactosEmergenciaMock,
  carreraInscripcionMock,
  distanciasInscripcionMock,
  productosDinamicosMock,
  variantesProductoMock,
  cantidadesProductoMock,
} from './nuevaInscripcionMock'


type DatosCorredor = {
  nombre: string
  apellido: string
  genero: string
  fechaNacimiento: string
  dni: string
  telefono: string
  discapacidad: string
  aptoMedico: boolean
}


function NuevaInscripcion() {
  const navigate = useNavigate()

  const [paso, setPaso] = useState(1)

  const [inscripcionConfirmada, setInscripcionConfirmada] =
    useState(false)

  const [datosCorredor, setDatosCorredor] =
    useState<DatosCorredor>({
      nombre: '',
      apellido: '',
      genero: '',
      fechaNacimiento: '',
      dni: '',
      telefono: '',
      discapacidad: '',
      aptoMedico: false,
    })


  /* =====================================================
     CONTACTO DE EMERGENCIA
  ===================================================== */

  const [dniContacto, setDniContacto] = useState('')

  const [contactoEmergencia, setContactoEmergencia] =
    useState<ContactoEmergencia | null>(null)

  const [mostrarModalContacto, setMostrarModalContacto] =
    useState(false)

  const [nuevoContacto, setNuevoContacto] =
    useState<ContactoEmergencia>({
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
    })


  /* =====================================================
     DATOS DE INSCRIPCIÓN
  ===================================================== */

  const [distanciaSeleccionada, setDistanciaSeleccionada] =
    useState('')

  const [productoDinamico, setProductoDinamico] =
    useState<'si' | 'no'>('no')

  const [varianteProducto, setVarianteProducto] =
    useState('')

  const [cantidadProducto, setCantidadProducto] =
    useState('1')


  /* =====================================================
     DATOS DEL CORREDOR
  ===================================================== */

  const actualizarDato = (
    campo: keyof DatosCorredor,
    valor: string | boolean
  ) => {
    setDatosCorredor((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }


  const volverAInscripciones = () => {
    navigate('/entrega-kits/inscripciones')
  }


  /* =====================================================
     BÚSQUEDA DE CONTACTO
  ===================================================== */

  /*
   * MOCK TEMPORAL:
   * Actualmente la búsqueda se realiza sobre
   * contactosEmergenciaMock.
   *
   * TODO BACKEND:
   *
   * GET /api/contactos-emergencia?dni={dni}
   */

  const buscarContactoEmergencia = () => {
    const dni = dniContacto.trim()

    if (!dni) {
      return
    }

    const contactoEncontrado =
      contactosEmergenciaMock.find(
        (contacto) => contacto.dni === dni
      )

    if (contactoEncontrado) {
      setContactoEmergencia(contactoEncontrado)
      return
    }

    setNuevoContacto({
      nombre: '',
      apellido: '',
      dni,
      telefono: '',
    })

    setMostrarModalContacto(true)
  }


  const abrirModalNuevoContacto = () => {
    setNuevoContacto({
      nombre: '',
      apellido: '',
      dni: dniContacto.trim(),
      telefono: '',
    })

    setMostrarModalContacto(true)
  }


  /*
   * TODO BACKEND:
   *
   * POST /api/contactos-emergencia
   *
   * Actualmente solamente se guarda en el estado local.
   */

  const guardarNuevoContacto = () => {
    if (
      !nuevoContacto.nombre.trim() ||
      !nuevoContacto.apellido.trim() ||
      !nuevoContacto.dni.trim() ||
      !nuevoContacto.telefono.trim()
    ) {
      return
    }

    setContactoEmergencia({
      nombre: nuevoContacto.nombre.trim(),
      apellido: nuevoContacto.apellido.trim(),
      dni: nuevoContacto.dni.trim(),
      telefono: nuevoContacto.telefono.trim(),
    })

    setDniContacto(nuevoContacto.dni.trim())

    setMostrarModalContacto(false)
  }


  /* =====================================================
     VALIDACIÓN PASO 1
  ===================================================== */

  const puedeContinuarPaso1 =
    datosCorredor.nombre.trim() !== '' &&
    datosCorredor.apellido.trim() !== '' &&
    datosCorredor.genero !== '' &&
    datosCorredor.fechaNacimiento !== '' &&
    datosCorredor.dni.trim() !== '' &&
    datosCorredor.telefono.trim() !== '' &&
    contactoEmergencia !== null


  const continuarPaso1 = () => {
    if (!puedeContinuarPaso1) {
      return
    }

    setPaso(2)
  }


  /* =====================================================
     DATOS DEL PASO 2
  ===================================================== */

  const distanciaSeleccionadaData =
    distanciasInscripcionMock.find(
      (distancia) =>
        distancia.id === distanciaSeleccionada
    )


  const productoSeleccionado =
    productosDinamicosMock[0]


  const cantidad =
    Number(cantidadProducto) || 1


  const precioDistancia =
    distanciaSeleccionadaData?.precio ?? 0


  const precioProducto =
    productoDinamico === 'si'
      ? productoSeleccionado.precio * cantidad
      : 0


  const totalPagar =
    precioDistancia + precioProducto


  const puedeContinuarPaso2 =
    distanciaSeleccionada !== '' &&
    (
      productoDinamico === 'no' ||
      (
        productoDinamico === 'si' &&
        varianteProducto !== '' &&
        cantidadProducto !== ''
      )
    )


  const continuarPaso2 = () => {
    if (!puedeContinuarPaso2) {
      return
    }

    setPaso(3)
    setInscripcionConfirmada(false)
  }


  /* =====================================================
     CONFIRMAR INSCRIPCIÓN
  ===================================================== */

  /*
   * MOCK TEMPORAL:
   * Actualmente la confirmación solamente cambia
   * el estado visual de la pantalla.
   *
   * TODO BACKEND:
   *
   * POST /api/inscripciones
   *
   * El backend deberá recibir los datos del corredor,
   * contacto de emergencia y datos de inscripción,
   * y devolver la inscripción creada.
   */

  const confirmarInscripcion = () => {
    setInscripcionConfirmada(true)
  }


  const nuevaInscripcion = () => {
    window.location.reload()
  }


  /*
   * TODO BACKEND:
   *
   * Cuando exista el ID real de la inscripción,
   * "Ver inscripción" deberá navegar a:
   *
   * /entrega-kits/inscripciones/:id
   *
   * Por ahora volvemos a la lista de inscripciones.
   */

  const verInscripcion = () => {
    navigate('/entrega-kits/inscripciones')
  }


  return (
    <main className="nueva-inscripcion">

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="nueva-inscripcion__encabezado">

        <button
          type="button"
          onClick={volverAInscripciones}
        >
          <ArrowLeft size={15} />

          <span>
            Volver a inscripciones
          </span>
        </button>

        <h1>
          Nueva inscripción
        </h1>

        <p>
          Complete los datos para registrar una nueva inscripción.
        </p>

      </div>


      {/* =========================
          PASOS
      ========================= */}

      <div className="nueva-inscripcion__pasos">

        <div
          className={`nueva-inscripcion__paso ${
            paso === 1 ? 'activo' : ''
          } ${
            paso > 1 ? 'completado' : ''
          }`}
        >
          <span>
            {paso > 1
              ? <Check size={13} />
              : '1'
            }
          </span>

          <strong>
            Datos del corredor
          </strong>
        </div>


        <div className="nueva-inscripcion__separador" />


        <div
          className={`nueva-inscripcion__paso ${
            paso === 2 ? 'activo' : ''
          } ${
            paso > 2 ? 'completado' : ''
          }`}
        >
          <span>
            {paso > 2
              ? <Check size={13} />
              : '2'
            }
          </span>

          <strong>
            Datos de inscripción
          </strong>
        </div>


        <div className="nueva-inscripcion__separador" />


        <div
          className={`nueva-inscripcion__paso ${
            paso === 3 ? 'activo' : ''
          }`}
        >
          <span>
            3
          </span>

          <strong>
            Confirmación
          </strong>
        </div>

      </div>


      {/* =========================
          CONTENIDO
      ========================= */}

      <section className="nueva-inscripcion__contenido">


        {/* =====================================================
            PASO 1
        ===================================================== */}

        {paso === 1 && (
          <>

            <div className="nueva-inscripcion__titulo">

              <h2>
                Datos del corredor
              </h2>

              <p>
                Ingrese los datos personales del corredor.
              </p>

            </div>


            <div className="nueva-inscripcion__formulario">


              {/* NOMBRE */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="nombre">
                  Nombre <span>*</span>
                </label>

                <input
                  id="nombre"
                  type="text"
                  value={datosCorredor.nombre}
                  onChange={(e) =>
                    actualizarDato(
                      'nombre',
                      e.target.value
                    )
                  }
                  placeholder="Ingrese el nombre"
                />

              </div>


              {/* APELLIDO */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="apellido">
                  Apellido <span>*</span>
                </label>

                <input
                  id="apellido"
                  type="text"
                  value={datosCorredor.apellido}
                  onChange={(e) =>
                    actualizarDato(
                      'apellido',
                      e.target.value
                    )
                  }
                  placeholder="Ingrese el apellido"
                />

              </div>


              {/* GENERO */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="genero">
                  Género <span>*</span>
                </label>

                <select
                  id="genero"
                  value={datosCorredor.genero}
                  onChange={(e) =>
                    actualizarDato(
                      'genero',
                      e.target.value
                    )
                  }
                >

                  <option value="" disabled>
                    Seleccione género
                  </option>

                  <option value="Femenino">
                    Femenino
                  </option>

                  <option value="Masculino">
                    Masculino
                  </option>

                  <option value="Otro">
                    Otro
                  </option>

                </select>

              </div>


              {/* FECHA */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="fechaNacimiento">
                  Fecha de nacimiento <span>*</span>
                </label>

                <input
                  id="fechaNacimiento"
                  type="date"
                  value={datosCorredor.fechaNacimiento}
                  onChange={(e) =>
                    actualizarDato(
                      'fechaNacimiento',
                      e.target.value
                    )
                  }
                />

              </div>


              {/* DNI */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="dni">
                  DNI <span>*</span>
                </label>

                <input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  value={datosCorredor.dni}
                  onChange={(e) =>
                    actualizarDato(
                      'dni',
                      e.target.value
                    )
                  }
                  placeholder="Ej. 12345678"
                />

              </div>


              {/* TELEFONO */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="telefono">
                  Número de teléfono <span>*</span>
                </label>

                <input
                  id="telefono"
                  type="text"
                  inputMode="tel"
                  value={datosCorredor.telefono}
                  onChange={(e) =>
                    actualizarDato(
                      'telefono',
                      e.target.value
                    )
                  }
                  placeholder="Ej. +54 9 11 1234-5678"
                />

              </div>


              {/* DISCAPACIDAD */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="discapacidad">
                  Discapacidad
                </label>

                <select
                  id="discapacidad"
                  value={datosCorredor.discapacidad}
                  onChange={(e) =>
                    actualizarDato(
                      'discapacidad',
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Seleccione discapacidad
                  </option>

                  <option value="Ninguna">
                    Ninguna
                  </option>

                  <option value="Visual">
                    Visual
                  </option>

                  <option value="Silla de ruedas">
                    Silla de ruedas
                  </option>

                  <option value="Otra">
                    Otra
                  </option>

                </select>

              </div>


              {/* APTO MEDICO */}

              <div className="nueva-inscripcion__campo">

                <label>
                  Apto médico
                </label>

                <label className="nueva-inscripcion__checkbox">

                  <input
                    type="checkbox"
                    checked={datosCorredor.aptoMedico}
                    onChange={(e) =>
                      actualizarDato(
                        'aptoMedico',
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Apto médico aprobado
                  </span>

                </label>

              </div>

            </div>


            {/* CONTACTO DE EMERGENCIA */}

            <div className="nueva-inscripcion__emergencia">

              <div className="nueva-inscripcion__emergencia-titulo">

                <h3>
                  Contacto de emergencia <span>*</span>
                </h3>

                <p>
                  Busque un contacto existente por DNI o cree uno nuevo.
                </p>

              </div>


              <div className="nueva-inscripcion__emergencia-buscador">

                <div className="nueva-inscripcion__buscador">

                  <Search size={15} />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={dniContacto}
                    onChange={(e) =>
                      setDniContacto(
                        e.target.value
                      )
                    }
                    placeholder="Buscar por DNI"
                  />

                </div>


                <button
                  type="button"
                  onClick={buscarContactoEmergencia}
                >
                  <Search size={14} />
                  Buscar
                </button>


                <button
                  type="button"
                  className="nueva-inscripcion__crear-contacto"
                  onClick={abrirModalNuevoContacto}
                >
                  <UserRoundPlus size={14} />
                  Nuevo contacto
                </button>

              </div>


              {contactoEmergencia && (

                <div className="nueva-inscripcion__contacto-encontrado">

                  <div className="nueva-inscripcion__contacto-principal">

                    <span>
                      Contacto seleccionado
                    </span>

                    <strong>
                      {contactoEmergencia.nombre}{' '}
                      {contactoEmergencia.apellido}
                    </strong>

                  </div>


                  <div className="nueva-inscripcion__contacto-dato">

                    <span>
                      DNI
                    </span>

                    <strong>
                      {contactoEmergencia.dni}
                    </strong>

                  </div>


                  <div className="nueva-inscripcion__contacto-dato">

                    <span>
                      Teléfono
                    </span>

                    <strong>
                      {contactoEmergencia.telefono}
                    </strong>

                  </div>

                </div>

              )}

            </div>


            <div className="nueva-inscripcion__acciones">

              <button
                type="button"
                onClick={continuarPaso1}
                disabled={!puedeContinuarPaso1}
              >
                Continuar
              </button>

            </div>

          </>
        )}


        {/* =====================================================
            PASO 2
        ===================================================== */}

        {paso === 2 && (
          <>

            <div className="nueva-inscripcion__titulo">

              <h2>
                Datos de la inscripción
              </h2>

              <p>
                Complete los datos correspondientes a la carrera.
              </p>

            </div>


            <div className="nueva-inscripcion__paso2-layout">


              <div className="nueva-inscripcion__paso2-formulario">


                {/* DISTANCIA */}

                <div className="nueva-inscripcion__paso2-seccion">

                  <label className="nueva-inscripcion__paso2-label">
                    Distancia <span>*</span>
                  </label>


                  <div className="nueva-inscripcion__distancias">

                    {distanciasInscripcionMock.map(
                      (distancia) => (

                        <button
                          key={distancia.id}
                          type="button"
                          className={`nueva-inscripcion__distancia ${
                            distanciaSeleccionada === distancia.id
                              ? 'seleccionada'
                              : ''
                          }`}
                          onClick={() =>
                            setDistanciaSeleccionada(
                              distancia.id
                            )
                          }
                        >

                          <strong>
                            {distancia.nombre}
                          </strong>

                          <span>
                            {distancia.descripcion}
                          </span>

                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* PRODUCTO DINÁMICO */}

                <div className="nueva-inscripcion__paso2-seccion">

                  <label className="nueva-inscripcion__paso2-label">
                    Producto dinámico
                  </label>


                  <div className="nueva-inscripcion__producto-opciones">

                    <button
                      type="button"
                      className={`nueva-inscripcion__producto-opcion ${
                        productoDinamico === 'si'
                          ? 'seleccionada'
                          : ''
                      }`}
                      onClick={() =>
                        setProductoDinamico('si')
                      }
                    >

                      <span className="nueva-inscripcion__radio">

                        {productoDinamico === 'si' && (
                          <span />
                        )}

                      </span>

                      Sí

                    </button>


                    <button
                      type="button"
                      className={`nueva-inscripcion__producto-opcion ${
                        productoDinamico === 'no'
                          ? 'seleccionada'
                          : ''
                      }`}
                      onClick={() => {
                        setProductoDinamico('no')
                        setVarianteProducto('')
                        setCantidadProducto('1')
                      }}
                    >

                      <span className="nueva-inscripcion__radio">

                        {productoDinamico === 'no' && (
                          <span />
                        )}

                      </span>

                      No

                    </button>

                  </div>

                </div>


                {/* VARIANTE Y CANTIDAD */}

                {productoDinamico === 'si' && (

                  <div className="nueva-inscripcion__producto-detalle">

                    <div className="nueva-inscripcion__campo">

                      <label htmlFor="varianteProducto">
                        Variante del producto
                      </label>

                      <select
                        id="varianteProducto"
                        value={varianteProducto}
                        onChange={(e) =>
                          setVarianteProducto(
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Seleccione variante
                        </option>

                        {variantesProductoMock.map(
                          (variante) => (

                            <option
                              key={variante}
                              value={variante}
                            >
                              {variante}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    <div className="nueva-inscripcion__campo">

                      <label htmlFor="cantidadProducto">
                        Cantidad
                      </label>

                      <select
                        id="cantidadProducto"
                        value={cantidadProducto}
                        onChange={(e) =>
                          setCantidadProducto(
                            e.target.value
                          )
                        }
                      >

                        {cantidadesProductoMock.map(
                          (cantidad) => (

                            <option
                              key={cantidad}
                              value={cantidad}
                            >
                              {cantidad}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </div>

                )}

              </div>


              {/* RESUMEN */}

              <aside className="nueva-inscripcion__resumen">

                <div className="nueva-inscripcion__resumen-titulo">

                  <h3>
                    Resumen
                  </h3>

                </div>


                <div className="nueva-inscripcion__resumen-contenido">

                  <div className="nueva-inscripcion__resumen-bloque">

                    <span>
                      Corredor
                    </span>

                    <strong>
                      {datosCorredor.nombre}{' '}
                      {datosCorredor.apellido}
                    </strong>

                    <small>
                      DNI: {datosCorredor.dni}
                    </small>

                  </div>


                  <div className="nueva-inscripcion__resumen-bloque">

                    <span>
                      Carrera
                    </span>

                    <strong>
                      {carreraInscripcionMock.nombre}
                    </strong>

                    <small>
                      Edición {carreraInscripcionMock.edicion}
                    </small>

                  </div>


                  <div className="nueva-inscripcion__resumen-bloque">

                    <span>
                      Distancia
                    </span>

                    <strong>
                      {distanciaSeleccionadaData
                        ? distanciaSeleccionadaData.nombre
                        : 'Sin seleccionar'}
                    </strong>

                  </div>


                  <div className="nueva-inscripcion__resumen-bloque">

                    <span>
                      Adicionales
                    </span>

                    <strong>
                      {productoDinamico === 'si'
                        ? `${cantidad} ${productoSeleccionado.nombre}`
                        : 'Ninguno'}
                    </strong>

                  </div>


                  <div className="nueva-inscripcion__resumen-total">

                    <span>
                      Total a pagar
                    </span>

                    <strong>
                      ${totalPagar.toLocaleString('es-AR')}
                    </strong>

                  </div>

                </div>

              </aside>

            </div>


            <div className="nueva-inscripcion__acciones">

              <button
                type="button"
                onClick={() => setPaso(1)}
              >
                Volver
              </button>

              <button
                type="button"
                onClick={continuarPaso2}
                disabled={!puedeContinuarPaso2}
              >
                Continuar
              </button>

            </div>

          </>
        )}


        {/* =====================================================
            PASO 3 - CONFIRMACIÓN
        ===================================================== */}

        {paso === 3 && (
          <div className="nueva-inscripcion__confirmacion">

            {/* =========================
                ENCABEZADO CONFIRMACIÓN
            ========================= */}

            <div className="nueva-inscripcion__confirmacion-encabezado">

              <div className="nueva-inscripcion__confirmacion-icono">

                <Check size={22} />

              </div>

              <h2>
                Confirmar inscripción
              </h2>

              <p>
                Revisa los detalles antes de finalizar el registro.
              </p>

            </div>


            {/* =========================
                TARJETAS
            ========================= */}

            <div className="nueva-inscripcion__confirmacion-grid">


              {/* CORREDOR */}

              <div className="nueva-inscripcion__confirmacion-card">

                <div className="nueva-inscripcion__confirmacion-card-header">

                  <div className="nueva-inscripcion__confirmacion-card-icono">
                    <UserRoundPlus size={14} />
                  </div>

                  <h3>
                    Corredor
                  </h3>

                </div>


                <div className="nueva-inscripcion__confirmacion-datos">

                  <div>

                    <span>
                      Nombre completo
                    </span>

                    <strong>
                      {datosCorredor.nombre}{' '}
                      {datosCorredor.apellido}
                    </strong>

                  </div>


                  <div>

                    <span>
                      DNI
                    </span>

                    <strong>
                      {datosCorredor.dni}
                    </strong>

                  </div>

                </div>

              </div>


              {/* CARRERA */}

              <div className="nueva-inscripcion__confirmacion-card">

                <div className="nueva-inscripcion__confirmacion-card-header">

                  <div className="nueva-inscripcion__confirmacion-card-icono">
                    <Footprints size={14} />
                  </div>

                  <h3>
                    Carrera
                  </h3>

                </div>


                <div className="nueva-inscripcion__confirmacion-datos">

                  <div>

                    <span>
                      Evento
                    </span>

                    <strong>
                      {carreraInscripcionMock.nombre}
                    </strong>

                  </div>


                  <div className="nueva-inscripcion__confirmacion-datos-doble">

                    <div>

                      <span>
                        Distancia
                      </span>

                      <strong>
                        {distanciaSeleccionadaData?.nombre}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Tipo
                      </span>

                      <strong>
                        {distanciaSeleccionadaData?.descripcion}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>


              {/* DETALLES DE PAGO */}

              <div className="nueva-inscripcion__confirmacion-card nueva-inscripcion__confirmacion-card--pago">

                <div className="nueva-inscripcion__confirmacion-card-header">

                  <div className="nueva-inscripcion__confirmacion-card-icono">
                    <CreditCard size={14} />
                  </div>

                  <h3>
                    Detalles de pago
                  </h3>

                </div>


                <div className="nueva-inscripcion__confirmacion-pago">

                  <div>

                    <span>
                      Estado
                    </span>

                    <strong className="nueva-inscripcion__estado-pagado">
                      <span />
                      Pagado
                    </strong>

                  </div>


                  <div>

                    <span>
                      Método
                    </span>

                    <strong>
                      Pago presencial
                    </strong>

                  </div>


                  <div className="nueva-inscripcion__confirmacion-total">

                    <span>
                      Total a pagar
                    </span>

                    <strong>
                      ${totalPagar.toLocaleString('es-AR')}
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* =========================
                ACCIONES
            ========================= */}

            {!inscripcionConfirmada ? (

              <div className="nueva-inscripcion__confirmacion-acciones">

                <button
                  type="button"
                  className="nueva-inscripcion__confirmacion-volver"
                  onClick={() => setPaso(2)}
                >
                  Volver
                </button>


                <button
                  type="button"
                  className="nueva-inscripcion__confirmacion-confirmar"
                  onClick={confirmarInscripcion}
                >
                  <Check size={14} />
                  Confirmar inscripción
                </button>

              </div>

            ) : (

              <div className="nueva-inscripcion__confirmacion-acciones">

                <button
                  type="button"
                  className="nueva-inscripcion__confirmacion-ver"
                  onClick={verInscripcion}
                >
                  <Eye size={14} />
                  Ver inscripción
                </button>


                <button
                  type="button"
                  className="nueva-inscripcion__confirmacion-nueva"
                  onClick={nuevaInscripcion}
                >
                  <Plus size={14} />
                  Nueva inscripción
                </button>

              </div>

            )}

          </div>
        )}

      </section>


      {/* =====================================================
          MODAL NUEVO CONTACTO
      ===================================================== */}

      {mostrarModalContacto && (

        <div
          className="nueva-inscripcion__modal-overlay"
          onClick={() =>
            setMostrarModalContacto(false)
          }
        >

          <div
            className="nueva-inscripcion__modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="nueva-inscripcion__modal-header">

              <h2>
                Nuevo contacto de emergencia
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMostrarModalContacto(false)
                }
                aria-label="Cerrar"
              >
                <X size={15} />
              </button>

            </div>


            <div className="nueva-inscripcion__modal-formulario">

              <div className="nueva-inscripcion__modal-campo">

                <label htmlFor="contactoNombre">
                  Nombre <span>*</span>
                </label>

                <input
                  id="contactoNombre"
                  type="text"
                  value={nuevoContacto.nombre}
                  onChange={(e) =>
                    setNuevoContacto(
                      (anterior) => ({
                        ...anterior,
                        nombre: e.target.value,
                      })
                    )
                  }
                  placeholder="Ej. Juan"
                />

              </div>


              <div className="nueva-inscripcion__modal-campo">

                <label htmlFor="contactoApellido">
                  Apellido <span>*</span>
                </label>

                <input
                  id="contactoApellido"
                  type="text"
                  value={nuevoContacto.apellido}
                  onChange={(e) =>
                    setNuevoContacto(
                      (anterior) => ({
                        ...anterior,
                        apellido: e.target.value,
                      })
                    )
                  }
                  placeholder="Ej. Pérez"
                />

              </div>


              <div className="nueva-inscripcion__modal-campo">

                <label htmlFor="contactoDni">
                  DNI <span>*</span>
                </label>

                <input
                  id="contactoDni"
                  type="text"
                  inputMode="numeric"
                  value={nuevoContacto.dni}
                  onChange={(e) =>
                    setNuevoContacto(
                      (anterior) => ({
                        ...anterior,
                        dni: e.target.value,
                      })
                    )
                  }
                  placeholder="Ej. 12345678"
                />

              </div>


              <div className="nueva-inscripcion__modal-campo">

                <label htmlFor="contactoTelefono">
                  Número de teléfono <span>*</span>
                </label>

                <input
                  id="contactoTelefono"
                  type="text"
                  inputMode="tel"
                  value={nuevoContacto.telefono}
                  onChange={(e) =>
                    setNuevoContacto(
                      (anterior) => ({
                        ...anterior,
                        telefono: e.target.value,
                      })
                    )
                  }
                  placeholder="Ej. +54 9 11 1234567"
                />

              </div>

            </div>


            <div className="nueva-inscripcion__modal-acciones">

              <button
                type="button"
                className="nueva-inscripcion__modal-cancelar"
                onClick={() =>
                  setMostrarModalContacto(false)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="nueva-inscripcion__modal-guardar"
                onClick={guardarNuevoContacto}
              >
                Guardar
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}

export default NuevaInscripcion