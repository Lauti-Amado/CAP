//frontend/src/pages/inscripciones/NuevaInscripcion.tsx
import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Eye, Plus, Search, UserRoundPlus, X, Footprints, CreditCard,} from 'lucide-react'
import { contactoEmergenciaSchema, inscripcionPaso1Schema } from '../../schemas/inscripcionSchema'
import { validar, type ErroresFormulario } from '../../utils/validar'
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

import { contactosEmergenciaMock, carreraInscripcionMock, distanciasInscripcionMock, productosDinamicosMock, variantesProductoMock, cantidadesProductoMock,} from './nuevaInscripcionMock'


type DatosCorredor = {
  nombre: string
  apellido: string
  genero: string
  fechaNacimiento: string
  dni: string
  telefono: string
  discapacidad: string
  aptoMedico: boolean
  vencimientoAptoMedico: string
}


function NuevaInscripcion() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { nombreCarrera } = useParams();

  /*
   * Si se llega a esta pantalla desde el modal
   * "Corredor no encontrado", el DNI viene en la URL:
   *
   * /entrega-kits/inscripciones/nueva?dni=12345678
   *
   * Si se entra normalmente a Nueva inscripción,
   * no habrá DNI y el campo quedará vacío.
   */
  const dniInicial = searchParams.get('dni') ?? ''

  const [paso, setPaso] = useState(1)

  const [inscripcionConfirmada, setInscripcionConfirmada] =
    useState(false)

  const [datosCorredor, setDatosCorredor] =
    useState<DatosCorredor>({
      nombre: '',
      apellido: '',
      genero: '',
      fechaNacimiento: '',
      dni: dniInicial,
      telefono: '',
      discapacidad: '',
      aptoMedico: false,
      vencimientoAptoMedico: '',
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

  const [mostrarErrores, setMostrarErrores] = useState(false)
  const [erroresContacto, setErroresContacto] = useState<ErroresFormulario>({})


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
    navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)
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
    setErroresContacto({})
    setMostrarModalContacto(true)
  }


  const abrirModalNuevoContacto = () => {
    setNuevoContacto({
      nombre: '',
      apellido: '',
      dni: dniContacto.trim(),
      telefono: '',
    })
    setErroresContacto({})
    setMostrarModalContacto(true)
  }


  /*
   * TODO BACKEND:
   *
   * POST /api/contactos-emergencia
   *
   * Actualmente solamente se guarda en el estado local.
   */

  const actualizarContacto = (campo: keyof ContactoEmergencia, valor: string) => {
    setNuevoContacto((anterior) => ({ ...anterior, [campo]: valor }))
    setErroresContacto((anteriores) => ({ ...anteriores, [campo]: '' }))
  }

  const guardarNuevoContacto = () => {
    const validacion = validar(contactoEmergenciaSchema, nuevoContacto)

    if (!validacion.ok) {
      setErroresContacto(validacion.errores)
      return
    }

    setContactoEmergencia(validacion.datos)
    setDniContacto(validacion.datos.dni)
    setMostrarModalContacto(false)
  }


  /* =====================================================
     VALIDACIÓN PASO 1
  ===================================================== */

  const validacionPaso1 = validar(inscripcionPaso1Schema, {
    corredor: datosCorredor,
    contactoEmergencia,
  })

  // Los errores se muestran recién después de intentar continuar
  const errorPaso1 = (campo: string) =>
    mostrarErrores ? validacionPaso1.errores[campo] : undefined

  const errorContactoPaso1 =
    errorPaso1('contactoEmergencia') ?? errorPaso1('contactoEmergencia.dni')

  const continuarPaso1 = () => {
    if (!validacionPaso1.ok) {
      setMostrarErrores(true)
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
    navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)
  }


  return (
    <main className="nueva-inscripcion">

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="nueva-inscripcion__encabezado">

        <Button
          type="button"
          onClick={volverAInscripciones}
        >
          <ArrowLeft size={15} />

          <span>
            Volver a inscripciones
          </span>
        </Button>

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

                <Form.Control
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
                  isInvalid={!!errorPaso1('corredor.nombre')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorPaso1('corredor.nombre')}
                </Form.Control.Feedback>
              </div>


              {/* APELLIDO */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="apellido">
                  Apellido <span>*</span>
                </label>

                <Form.Control
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
                  isInvalid={!!errorPaso1('corredor.apellido')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorPaso1('corredor.apellido')}
                </Form.Control.Feedback>
              </div>


              {/* GENERO */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="genero">
                  Género <span>*</span>
                </label>

                <Form.Select
                  id="genero"
                  value={datosCorredor.genero}
                  onChange={(e) =>
                    actualizarDato(
                      'genero',
                      e.target.value
                    )
                  }
                  isInvalid={!!errorPaso1('corredor.genero')}
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

                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errorPaso1('corredor.genero')}
                </Form.Control.Feedback>
              </div>


              {/* FECHA */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="fechaNacimiento">
                  Fecha de nacimiento <span>*</span>
                </label>

                <Form.Control
                  id="fechaNacimiento"
                  type="date"
                  value={datosCorredor.fechaNacimiento}
                  onChange={(e) =>
                    actualizarDato(
                      'fechaNacimiento',
                      e.target.value
                    )
                  }
                  isInvalid={!!errorPaso1('corredor.fechaNacimiento')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorPaso1('corredor.fechaNacimiento')}
                </Form.Control.Feedback>
              </div>


              {/* DNI */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="dni">
                  DNI <span>*</span>
                </label>

                <Form.Control
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
                  isInvalid={!!errorPaso1('corredor.dni')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorPaso1('corredor.dni')}
                </Form.Control.Feedback>
              </div>


              {/* TELEFONO */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="telefono">
                  Número de teléfono <span>*</span>
                </label>

                <Form.Control
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
                  isInvalid={!!errorPaso1('corredor.telefono')}
                />
                <Form.Control.Feedback type="invalid">
                  {errorPaso1('corredor.telefono')}
                </Form.Control.Feedback>
              </div>


              {/* DISCAPACIDAD */}

              <div className="nueva-inscripcion__campo">

                <label htmlFor="discapacidad">
                  Discapacidad
                </label>

                <Form.Select
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

                </Form.Select>

              </div>


              {/* APTO MEDICO */}

              <div className="nueva-inscripcion__campo">

                <label>
                  Apto médico
                </label>

                <label className="nueva-inscripcion__checkbox">

                  <Form.Check
                    type="checkbox"
                    checked={datosCorredor.aptoMedico}
                    onChange={(e) =>
                      actualizarDato(
                        'aptoMedico',
                        e.currentTarget.checked
                      )
                    }
                  />

                  <span>
                    Apto médico aprobado
                  </span>

                </label>

                </div>
                {datosCorredor.aptoMedico && (
                <div className="nueva-inscripcion__campo">
                  <label htmlFor="vencimientoAptoMedico">
                    Fecha de vencimiento del apto médico
                  </label>

                  <Form.Control
                    id="vencimientoAptoMedico"
                    type="date"
                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 10)}
                    value={datosCorredor.vencimientoAptoMedico}
                    onChange={(e) =>
                      actualizarDato('vencimientoAptoMedico', e.target.value)
                    }
                    isInvalid={!!errorPaso1('corredor.vencimientoAptoMedico')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorPaso1('corredor.vencimientoAptoMedico')}
                  </Form.Control.Feedback>
                </div>
              )}

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

                  <Form.Control
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


                <Button
                  type="button"
                  onClick={buscarContactoEmergencia}
                >
                  <Search size={14} />
                  Buscar
                </Button>


                <Button
                  type="button"
                  className="nueva-inscripcion__crear-contacto"
                  onClick={abrirModalNuevoContacto}
                >
                  <UserRoundPlus size={14} />
                  Nuevo contacto
                </Button>

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
              {errorContactoPaso1 && (
                <div className="text-danger small mt-2" role="alert">
                  {errorContactoPaso1}
                </div>
              )}

            </div>


            <div className="nueva-inscripcion__acciones">

              <Button
                type="button"
                onClick={continuarPaso1}
              >
                Continuar
              </Button>

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

                        <Button
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

                        </Button>

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

                    <Button
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

                    </Button>


                    <Button
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

                    </Button>

                  </div>

                </div>


                {/* VARIANTE Y CANTIDAD */}

                {productoDinamico === 'si' && (

                  <div className="nueva-inscripcion__producto-detalle">

                    <div className="nueva-inscripcion__campo">

                      <label htmlFor="varianteProducto">
                        Variante del producto
                      </label>

                      <Form.Select
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

                      </Form.Select>

                    </div>


                    <div className="nueva-inscripcion__campo">

                      <label htmlFor="cantidadProducto">
                        Cantidad
                      </label>

                      <Form.Select
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

                      </Form.Select>

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

              <Button
                type="button"
                onClick={() => setPaso(1)}
              >
                Volver
              </Button>

              <Button
                type="button"
                onClick={continuarPaso2}
                disabled={!puedeContinuarPaso2}
              >
                Continuar
              </Button>

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

                <Button
                  type="button"
                  className="nueva-inscripcion__confirmacion-volver"
                  onClick={() => setPaso(2)}
                >
                  Volver
                </Button>


                <Button
                  type="button"
                  className="nueva-inscripcion__confirmacion-confirmar"
                  onClick={confirmarInscripcion}
                >

                  <Check size={14} />

                  Confirmar inscripción

                </Button>

              </div>

            ) : (

              <div className="nueva-inscripcion__confirmacion-acciones">

                <Button
                  type="button"
                  className="nueva-inscripcion__confirmacion-ver"
                  onClick={verInscripcion}
                >

                  <Eye size={14} />

                  Ver inscripción

                </Button>


                <Button
                  type="button"
                  className="nueva-inscripcion__confirmacion-nueva"
                  onClick={nuevaInscripcion}
                >

                  <Plus size={14} />

                  Nueva inscripción

                </Button>

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

              <Button
                type="button"
                onClick={() =>
                  setMostrarModalContacto(false)
                }
                aria-label="Cerrar"
              >
                <X size={15} />
              </Button>

            </div>


            <div className="nueva-inscripcion__modal-formulario">
              <div className="nueva-inscripcion__modal-campo">
                <label htmlFor="contactoNombre">
                  Nombre <span>*</span>
                </label>
                <Form.Control
                  id="contactoNombre"
                  type="text"
                  value={nuevoContacto.nombre}
                  onChange={(e) => actualizarContacto('nombre', e.target.value)}
                  placeholder="Ej. Juan"
                  isInvalid={!!erroresContacto.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {erroresContacto.nombre}
                </Form.Control.Feedback>
              </div>
              <div className="nueva-inscripcion__modal-campo">
                <label htmlFor="contactoApellido">
                  Apellido <span>*</span>
                </label>
                <Form.Control
                  id="contactoApellido"
                  type="text"
                  value={nuevoContacto.apellido}
                  onChange={(e) => actualizarContacto('apellido', e.target.value)}
                  placeholder="Ej. Pérez"
                  isInvalid={!!erroresContacto.apellido}
                />
                <Form.Control.Feedback type="invalid">
                  {erroresContacto.apellido}
                </Form.Control.Feedback>
              </div>
              <div className="nueva-inscripcion__modal-campo">
                <label htmlFor="contactoDni">
                  DNI <span>*</span>
                </label>
                <Form.Control
                  id="contactoDni"
                  type="text"
                  inputMode="numeric"
                  value={nuevoContacto.dni}
                  onChange={(e) => actualizarContacto('dni', e.target.value)}
                  placeholder="Ej. 12345678"
                  isInvalid={!!erroresContacto.dni}
                />
                <Form.Control.Feedback type="invalid">
                  {erroresContacto.dni}
                </Form.Control.Feedback>
              </div>
              <div className="nueva-inscripcion__modal-campo">
                <label htmlFor="contactoTelefono">
                  Número de teléfono <span>*</span>
                </label>
                <Form.Control
                  id="contactoTelefono"
                  type="text"
                  inputMode="tel"
                  value={nuevoContacto.telefono}
                  onChange={(e) => actualizarContacto('telefono', e.target.value)}
                  placeholder="Ej. +54 9 11 1234567"
                  isInvalid={!!erroresContacto.telefono}
                />
                <Form.Control.Feedback type="invalid">
                  {erroresContacto.telefono}
                </Form.Control.Feedback>
              </div>
            </div>


            <div className="nueva-inscripcion__modal-acciones">

              <Button
                type="button"
                className="nueva-inscripcion__modal-cancelar"
                onClick={() =>
                  setMostrarModalContacto(false)
                }
              >
                Cancelar
              </Button>


              <Button
                type="button"
                className="nueva-inscripcion__modal-guardar"
                onClick={guardarNuevoContacto}
              >
                Guardar
              </Button>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}

export default NuevaInscripcion