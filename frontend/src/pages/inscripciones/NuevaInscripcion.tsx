//frontend/src/pages/inscripciones/NuevaInscripcion.tsx
import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, Modal, Row, ToggleButton, ToggleButtonGroup,} from 'react-bootstrap'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Eye, Footprints, Plus, Search, UserRoundPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactoEmergenciaSchema, crearInscripcionPaso1Schema, inscripcionPaso2Schema } from '../../schemas/inscripcionSchema'
import type { ContactoEmergenciaForm, InscripcionPaso1Form, InscripcionPaso2Form } from '../../schemas/inscripcionSchema'
import { dniBusquedaSchema } from '../../schemas/kitSchema'
import type { DniBusquedaForm } from '../../schemas/kitSchema'
import type { CrearInscripcionPayload, OpcionesInscripcionDTO } from '../../types/inscripcion'
import { ApiError } from '../../services/apiService'
import {
  buscarContactoEmergencia as buscarContactoEmergenciaAPI,
  crearInscripcion,
  obtenerOpcionesInscripcion,
} from '../../services/inscripcionService'
import { useCarreraActual } from '../../hooks/useCarreraActual'

/* =====================================================
   COMPONENTES AUXILIARES
===================================================== */

const PASOS = ['Datos del corredor', 'Datos de inscripción', 'Confirmación']

function Pasos({ actual }: { actual: number }) {
  return (
    <Card className="mb-4">
      <Card.Body className="d-flex align-items-center gap-3 overflow-auto py-3">
        {PASOS.map((titulo, indice) => {
          const numero = indice + 1
          const completado = actual > numero
          const activo = actual === numero
          const resaltado = completado || activo

          return (
            <div key={titulo} className={`d-flex align-items-center gap-2 ${indice < PASOS.length - 1 ? 'flex-grow-1' : ''}`}>
              <Badge pill bg={resaltado ? 'success' : 'light'} text={resaltado ? undefined : 'dark'}>
                {completado ? <Check size={12} aria-hidden="true" /> : numero}
              </Badge>

              <span className={`small fw-semibold text-nowrap ${activo ? 'text-success' : 'text-secondary'}`}>
                {titulo}
              </span>

              {indice < PASOS.length - 1 && <div className="flex-grow-1 border-top ms-2" />}
            </div>
          )
        })}
      </Card.Body>
    </Card>
  )
}

type CampoTextoProps = {
  id: string
  etiqueta: string
  registro: UseFormRegisterReturn
  error?: string
  obligatorio?: boolean
  placeholder?: string
  tipo?: 'text' | 'date'
  modo?: 'numeric' | 'tel'
  min?: string
}

function CampoTexto({ id, etiqueta, registro, error, obligatorio, placeholder, tipo = 'text', modo, min }: CampoTextoProps) {
  return (
    <Form.Group controlId={id}>
      <Form.Label className="small fw-semibold">
        {etiqueta} {obligatorio && <span className="text-danger">*</span>}
      </Form.Label>

      <Form.Control
        type={tipo}
        inputMode={modo}
        min={min}
        placeholder={placeholder}
        isInvalid={!!error}
        {...registro}
      />

      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  )
}

function DatoResumen({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="small text-uppercase text-secondary">{etiqueta}</div>
      <strong>{children}</strong>
    </div>
  )
}

/* =====================================================
   PANTALLA
===================================================== */

function NuevaInscripcion() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { nombreCarrera } = useParams()
  const carreraSeleccionada = useCarreraActual()

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
  const [inscripcionConfirmada, setInscripcionConfirmada] = useState(false)
  const [inscripcionCreadaId, setInscripcionCreadaId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null)

  /* ---------- Opciones reales de la carrera ---------- */

  const [opciones, setOpciones] = useState<OpcionesInscripcionDTO | null>(null)
  const [cargandoOpciones, setCargandoOpciones] = useState(true)
  const [errorOpciones, setErrorOpciones] = useState<string | null>(null)

  useEffect(() => {
    const carreraId = carreraSeleccionada?.id

    if (!carreraId) {
      setOpciones(null)
      setCargandoOpciones(false)
      setErrorOpciones('No hay una carrera seleccionada. Volvé a seleccionar la carrera.')
      return
    }

    let cancelado = false

    async function cargarOpciones(idCarrera: string) {
      try {
        setCargandoOpciones(true)
        setErrorOpciones(null)

        const resultado = await obtenerOpcionesInscripcion(idCarrera)

        if (!cancelado) setOpciones(resultado)
      } catch (error) {
        if (!cancelado) {
          setErrorOpciones(
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar las opciones de inscripción.'
          )
        }
      } finally {
        if (!cancelado) setCargandoOpciones(false)
      }
    }

    void cargarOpciones(carreraId)
    return () => {
      cancelado = true
    }
  }, [carreraSeleccionada?.id])

  /* ---------- Fechas de la carrera (el apto médico debe cubrirla) ---------- */

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const mananaISO = new Date(manana.getTime() - manana.getTimezoneOffset() * 60000).toISOString().slice(0, 10)

  const fechaCarrera = opciones ? new Date(opciones.carrera.fechaHoraCarrera) : null
  const fechaCarreraISO = fechaCarrera
    ? new Date(fechaCarrera.getTime() - fechaCarrera.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    : undefined
  const fechaMinimaApto = fechaCarreraISO && fechaCarreraISO > mananaISO
    ? fechaCarreraISO
    : mananaISO

  /* =====================================================
     FORMULARIO PASO 1: corredor + contacto de emergencia
  ===================================================== */

  const schemaPaso1 = useMemo(() => crearInscripcionPaso1Schema(fechaCarreraISO), [fechaCarreraISO])

  const {
    register: registrarPaso1,
    handleSubmit: enviarPaso1,
    setValue: setValuePaso1,
    watch: watchPaso1,
    formState: { errors: erroresPaso1, isSubmitted: paso1Enviado },
  } = useForm<InscripcionPaso1Form>({
    resolver: zodResolver(schemaPaso1),
    defaultValues: {
      corredor: {
        nombre: '',
        apellido: '',
        genero: '' as InscripcionPaso1Form['corredor']['genero'],
        fechaNacimiento: '',
        dni: dniInicial,
        telefono: '',
        discapacidad: '',
        aptoMedico: false,
        vencimientoAptoMedico: '',
      },
      contactoEmergencia: null,
    },
  })

  const datosCorredor = watchPaso1('corredor')
  const contactoEmergencia = watchPaso1('contactoEmergencia')

  const errorContactoPaso1 = erroresPaso1.contactoEmergencia?.message ?? erroresPaso1.contactoEmergencia?.dni?.message

  const [errorAptoMedico, setErrorAptoMedico] = useState<string | null>(null)

  const aptoMedicoValido = datosCorredor.aptoMedico &&
    datosCorredor.vencimientoAptoMedico !== '' &&
    datosCorredor.vencimientoAptoMedico >= fechaMinimaApto

  const continuarPaso1 = enviarPaso1(() => {
    setErrorAptoMedico(null)
    setPaso(2)
  })

  /* ---------- Búsqueda de contacto de emergencia ---------- */

  const {
    register: registrarBusqueda,
    handleSubmit: enviarBusqueda,
    setValue: setValueBusqueda,
    getValues: getValuesBusqueda,
    formState: { errors: erroresBusqueda },
  } = useForm<DniBusquedaForm>({
    resolver: zodResolver(dniBusquedaSchema),
    defaultValues: { dni: '' },
  })

  const [buscandoContacto, setBuscandoContacto] = useState(false)
  const [errorBusquedaContacto, setErrorBusquedaContacto] = useState<string | null>(null)

  /* ---------- Modal: nuevo contacto de emergencia ---------- */

  const [mostrarModalContacto, setMostrarModalContacto] = useState(false)

  const {
    register: registrarContacto,
    handleSubmit: enviarContacto,
    reset: resetContacto,
    formState: { errors: erroresContacto },
  } = useForm<ContactoEmergenciaForm>({
    resolver: zodResolver(contactoEmergenciaSchema),
    defaultValues: { nombre: '', apellido: '', dni: '', telefono: '' },
  })

  const volverAInscripciones = () => {
    navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)
  }

  const abrirModalContacto = (dni: string) => {
    resetContacto({ nombre: '', apellido: '', dni, telefono: '' })
    setMostrarModalContacto(true)
  }

  const buscarContactoEmergencia = enviarBusqueda(async ({ dni }) => {
    try {
      setBuscandoContacto(true)
      setErrorBusquedaContacto(null)

      const contactoEncontrado = await buscarContactoEmergenciaAPI(dni)
      setValuePaso1('contactoEmergencia', contactoEncontrado, { shouldValidate: paso1Enviado })
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        abrirModalContacto(dni)
        return
      }

      setErrorBusquedaContacto(
        error instanceof Error
          ? error.message
          : 'No se pudo buscar el contacto de emergencia.'
      )
    } finally {
      setBuscandoContacto(false)
    }
  })

  // El contacto nuevo se envía junto con la inscripción; el backend lo crea en esa operación.
  const guardarNuevoContacto = enviarContacto((contacto) => {
    setValuePaso1('contactoEmergencia', contacto, { shouldValidate: paso1Enviado })
    setValueBusqueda('dni', contacto.dni)
    setMostrarModalContacto(false)
  })

  /* =====================================================
     FORMULARIO PASO 2: distancia + producto
  ===================================================== */

  const {
    register: registrarPaso2,
    handleSubmit: enviarPaso2,
    setValue: setValuePaso2,
    watch: watchPaso2,
    formState: { errors: erroresPaso2 },
  } = useForm<InscripcionPaso2Form>({
    resolver: zodResolver(inscripcionPaso2Schema),
    defaultValues: {
      distancia: '',
      productoDinamico: 'no',
      productoId: '',
      varianteId: '',
      cantidad: '1',
    },
  })

  const distanciaSeleccionada = watchPaso2('distancia')
  const productoDinamico = watchPaso2('productoDinamico')
  const productoSeleccionadoId = watchPaso2('productoId')
  const varianteProducto = watchPaso2('varianteId')
  const cantidadProducto = watchPaso2('cantidad')

  // Se ofrecen todas las distancias configuradas para la carrera.
  const distanciasDisponibles = opciones?.distancias ?? []

  const claveDistancia = (kilometraje: number, tipoDistancia: string) =>
    `${kilometraje}|${tipoDistancia}`

  const distanciaSeleccionadaData = distanciasDisponibles.find(
    (distancia) => claveDistancia(distancia.kilometraje, distancia.tipoDistancia) === distanciaSeleccionada
  )

  const requiereAptoMedico = Boolean(
    distanciaSeleccionadaData &&
    distanciaSeleccionadaData.kilometraje >= 10 &&
    distanciaSeleccionadaData.tipoDistancia === 'Competitiva'
  )

  const productoSeleccionado = opciones?.productos.find(
    (producto) => producto.id === productoSeleccionadoId
  )

  const varianteSeleccionada = productoSeleccionado?.variantes.find(
    (variante) => variante.id === varianteProducto
  )

  const cantidad = Number(cantidadProducto) || 1
  const precioDistancia = distanciaSeleccionadaData?.precio ?? 0
  const precioProducto = productoDinamico === 'si'
    ? (varianteSeleccionada?.precio ?? 0) * cantidad
    : 0
  const totalPagar = precioDistancia + precioProducto

  const seleccionarDistancia = (kilometraje: number, tipoDistancia: string) => {
    setValuePaso2('distancia', claveDistancia(kilometraje, tipoDistancia), { shouldValidate: true })
    setErrorAptoMedico(null)
  }

  const faltaAptoRequerido = requiereAptoMedico && !aptoMedicoValido

  // Reglas que dependen del stock y del cupo de la carrera (vienen del backend, no del schema)
  const stockInsuficiente = productoDinamico === 'si' &&
    Boolean(varianteSeleccionada) &&
    (varianteSeleccionada?.stock ?? 0) < cantidad

  const cupoCompleto = Boolean(opciones && opciones.cupo.ocupados >= opciones.cupo.maximo)

  const cambiarProductoDinamico = (valor: 'si' | 'no') => {
    setValuePaso2('productoDinamico', valor)

    if (valor === 'no') {
      setValuePaso2('productoId', '')
      setValuePaso2('varianteId', '')
      setValuePaso2('cantidad', '1')
    }
  }

  const continuarPaso2 = enviarPaso2(() => {
    if (faltaAptoRequerido) {
      setErrorAptoMedico('Para esta distancia necesitás registrar un apto médico aprobado y vigente hasta la fecha de la carrera.')
      setPaso(1)
      return
    }

    if (!opciones?.carrera.admiteInscripciones) return
    if (cupoCompleto) return
    if (stockInsuficiente) return

    setErrorAptoMedico(null)
    setPaso(3)
    setInscripcionConfirmada(false)
  })

  /* =====================================================
     CONFIRMAR INSCRIPCIÓN
  ===================================================== */

  const confirmarInscripcion = async () => {
    if (!carreraSeleccionada || !distanciaSeleccionadaData || !contactoEmergencia) {
      setErrorCreacion('Faltan datos para registrar la inscripción.')
      return
    }

    if (faltaAptoRequerido) {
      setPaso(1)
      setErrorAptoMedico('Para esta distancia necesitás registrar un apto médico aprobado y vigente hasta la fecha de la carrera.')
      return
    }

    const discapacidadMapeada: Record<string, CrearInscripcionPayload['corredor']['discapacidad']> = {
      Ninguna: undefined,
      Visual: 'Discapacidad_visual',
      'Silla de ruedas': 'Discapacidad_silla',
      Otra: 'Discapacidad_general',
    }

    const productos = productoDinamico === 'si' && varianteSeleccionada
      ? [{ varianteId: varianteSeleccionada.id, cantidad }]
      : []

    const datos: CrearInscripcionPayload = {
      corredor: {
        dni: datosCorredor.dni.trim(),
        nombre: datosCorredor.nombre.trim(),
        apellido: datosCorredor.apellido.trim(),
        telefono: datosCorredor.telefono.trim(),
        sexo: datosCorredor.genero,
        fechaNacimiento: datosCorredor.fechaNacimiento,
        ...(discapacidadMapeada[datosCorredor.discapacidad]
          ? { discapacidad: discapacidadMapeada[datosCorredor.discapacidad] }
          : {}),
      },
      contactoEmergencia: {
        dni: contactoEmergencia.dni,
        nombre: contactoEmergencia.nombre,
        apellido: contactoEmergencia.apellido,
        telefono: contactoEmergencia.telefono,
      },
      ...(datosCorredor.aptoMedico
        ? {
            aptoMedico: {
              // El certificado debe cubrir todo el día de la carrera.
              fechaVencimiento: new Date(`${datosCorredor.vencimientoAptoMedico}T23:59:59.999`).toISOString(),
            },
          }
        : {}),
      distancia: {
        kilometraje: distanciaSeleccionadaData.kilometraje,
        tipoDistancia: distanciaSeleccionadaData.tipoDistancia as 'Participativa' | 'Competitiva',
      },
      productos,
    }

    try {
      setGuardando(true)
      setErrorCreacion(null)

      const creada = await crearInscripcion(carreraSeleccionada.id, datos)
      setInscripcionCreadaId(creada.id)
      setInscripcionConfirmada(true)
    } catch (error) {
      setErrorCreacion(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la inscripción.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const nuevaInscripcion = () => {
    window.location.reload()
  }

  const verInscripcion = () => {
    if (!inscripcionCreadaId) return
    navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones/${inscripcionCreadaId}`)
  }

  return (
    <Container as="main" className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {/* ENCABEZADO */}
          <header className="mb-4">
            <Button
              type="button"
              variant="link"
              className="d-inline-flex align-items-center gap-1 p-0 text-success text-decoration-none small"
              onClick={volverAInscripciones}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Volver a inscripciones
            </Button>

            <h1 className="h3 fw-bold mt-2 mb-1">Nueva inscripción</h1>
            <p className="text-secondary small mb-0">Complete los datos para registrar una nueva inscripción.</p>
          </header>

          <Pasos actual={paso} />

          {cargandoOpciones && (
            <div className="alert alert-info">Cargando las distancias y productos disponibles...</div>
          )}

          {errorOpciones && <div className="alert alert-danger" role="alert">{errorOpciones}</div>}

          {opciones && !opciones.carrera.admiteInscripciones && (
            <div className="alert alert-warning" role="alert">
              Esta carrera no admite inscripciones en este momento.
            </div>
          )}

          {cupoCompleto && (
            <div className="alert alert-warning" role="alert">
              La carrera alcanzó el cupo máximo.
            </div>
          )}

          <Card>
            <Card.Body className="p-4">
              {/* =====================================================
                  PASO 1
              ===================================================== */}
              {paso === 1 && (
                <Form onSubmit={continuarPaso1} noValidate>
                  {errorAptoMedico && (
                    <Alert variant="warning" role="alert">{errorAptoMedico}</Alert>
                  )}

                  <div className="border-bottom pb-3 mb-4">
                    <h2 className="h5 fw-bold mb-1">Datos del corredor</h2>
                    <p className="text-secondary small mb-0">Ingrese los datos personales del corredor.</p>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <CampoTexto
                        id="nombre"
                        etiqueta="Nombre"
                        obligatorio
                        placeholder="Ingrese el nombre"
                        registro={registrarPaso1('corredor.nombre')}
                        error={erroresPaso1.corredor?.nombre?.message}
                      />
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="apellido"
                        etiqueta="Apellido"
                        obligatorio
                        placeholder="Ingrese el apellido"
                        registro={registrarPaso1('corredor.apellido')}
                        error={erroresPaso1.corredor?.apellido?.message}
                      />
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="genero">
                        <Form.Label className="small fw-semibold">
                          Género <span className="text-danger">*</span>
                        </Form.Label>

                        <Form.Select
                          isInvalid={!!erroresPaso1.corredor?.genero}
                          {...registrarPaso1('corredor.genero')}
                        >
                          <option value="" disabled>Seleccione género</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Masculino">Masculino</option>
                        </Form.Select>

                        <Form.Control.Feedback type="invalid">
                          {erroresPaso1.corredor?.genero?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="fechaNacimiento"
                        etiqueta="Fecha de nacimiento"
                        obligatorio
                        tipo="date"
                        registro={registrarPaso1('corredor.fechaNacimiento')}
                        error={erroresPaso1.corredor?.fechaNacimiento?.message}
                      />
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="dni"
                        etiqueta="DNI"
                        obligatorio
                        modo="numeric"
                        placeholder="Ej. 12345678"
                        registro={registrarPaso1('corredor.dni')}
                        error={erroresPaso1.corredor?.dni?.message}
                      />
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="telefono"
                        etiqueta="Número de teléfono"
                        obligatorio
                        modo="tel"
                        placeholder="Ej. +54 9 11 1234-5678"
                        registro={registrarPaso1('corredor.telefono')}
                        error={erroresPaso1.corredor?.telefono?.message}
                      />
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="discapacidad">
                        <Form.Label className="small fw-semibold">Discapacidad</Form.Label>

                        <Form.Select {...registrarPaso1('corredor.discapacidad')}>
                          <option value="">Seleccione discapacidad</option>
                          <option value="Ninguna">Ninguna</option>
                          <option value="Visual">Visual</option>
                          <option value="Silla de ruedas">Silla de ruedas</option>
                          <option value="Otra">Otra</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                  </Row>

                  {/* APTO MÉDICO: se registra antes de seleccionar la distancia. */}
                  <div className="border-top mt-4 pt-4">
                    <h3 className="h6 fw-bold mb-1">Apto médico</h3>
                    <p className="text-secondary small">
                      Registre el apto si el corredor lo entregó y fue aprobado.
                    </p>

                    <Form.Check
                      type="checkbox"
                      id="aptoMedico"
                      label="Apto médico aprobado"
                      {...registrarPaso1('corredor.aptoMedico', {
                        onChange: (e) => {
                          if (!e.target.checked) setValuePaso1('corredor.vencimientoAptoMedico', '')
                          setErrorAptoMedico(null)
                        },
                      })}
                    />

                    {datosCorredor.aptoMedico && (
                      <div className="mt-3">
                        <CampoTexto
                          id="vencimientoAptoMedico"
                          etiqueta="Fecha de vencimiento del apto médico"
                          obligatorio
                          tipo="date"
                          min={fechaMinimaApto}
                          registro={registrarPaso1('corredor.vencimientoAptoMedico', {
                            onChange: () => setErrorAptoMedico(null),
                          })}
                          error={erroresPaso1.corredor?.vencimientoAptoMedico?.message}
                        />
                      </div>
                    )}
                  </div>

                  {/* CONTACTO DE EMERGENCIA */}
                  <div className="border-top mt-4 pt-4">
                    <h3 className="h6 fw-bold mb-1">
                      Contacto de emergencia <span className="text-danger">*</span>
                    </h3>
                    <p className="text-secondary small">Busque un contacto existente por DNI o cree uno nuevo.</p>

                    <InputGroup className="flex-wrap">
                      <InputGroup.Text>
                        <Search size={15} aria-hidden="true" />
                      </InputGroup.Text>

                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        placeholder="Buscar por DNI"
                        aria-label="DNI del contacto de emergencia"
                        isInvalid={!!erroresBusqueda.dni}
                        {...registrarBusqueda('dni')}
                        onKeyDown={(e) => {
                          // Enter busca el contacto; no debe enviar el paso 1
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            void buscarContactoEmergencia()
                          }
                        }}
                      />

                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => void buscarContactoEmergencia()}
                        disabled={buscandoContacto}
                      >
                        <Search size={14} aria-hidden="true" />
                        {buscandoContacto ? 'Buscando...' : 'Buscar'}
                      </Button>

                      <Button
                        type="button"
                        variant="success"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => abrirModalContacto(getValuesBusqueda('dni').trim())}
                      >
                        <UserRoundPlus size={14} aria-hidden="true" />
                        Nuevo contacto
                      </Button>
                    </InputGroup>

                    {(erroresBusqueda.dni || errorBusquedaContacto) && (
                      <div className="text-danger small mt-2" role="alert">
                        {erroresBusqueda.dni?.message ?? errorBusquedaContacto}
                      </div>
                    )}

                    {contactoEmergencia && (
                      <Card bg="success-subtle" className="border-success-subtle mt-3">
                        <Card.Body className="py-2">
                          <Row xs={1} sm={3} className="g-2">
                            <Col>
                              <DatoResumen etiqueta="Contacto seleccionado">
                                {contactoEmergencia.nombre} {contactoEmergencia.apellido}
                              </DatoResumen>
                            </Col>
                            <Col>
                              <DatoResumen etiqueta="DNI">{contactoEmergencia.dni}</DatoResumen>
                            </Col>
                            <Col>
                              <DatoResumen etiqueta="Teléfono">{contactoEmergencia.telefono}</DatoResumen>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {errorContactoPaso1 && (
                      <div className="text-danger small mt-2" role="alert">
                        {errorContactoPaso1}
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end gap-2 border-top mt-4 pt-3">
                    <Button type="submit" variant="success">
                      Continuar
                    </Button>
                  </div>
                </Form>
              )}

              {/* =====================================================
                  PASO 2
              ===================================================== */}
              {paso === 2 && (
                <Form onSubmit={continuarPaso2} noValidate>
                  <div className="border-bottom pb-3 mb-4">
                    <h2 className="h5 fw-bold mb-1">Datos de la inscripción</h2>
                    <p className="text-secondary small mb-0">Complete los datos correspondientes a la carrera.</p>
                  </div>

                  <Row className="g-4">
                    <Col lg={8} className="order-2 order-lg-1">
                      {/* DISTANCIA */}
                      <div className="mb-4">
                        <div className="small fw-semibold mb-2">
                          Distancia <span className="text-danger">*</span>
                        </div>

                        <Row xs={1} sm={3} className="g-2">
                          {distanciasDisponibles.map((distancia) => {
                            const clave = claveDistancia(distancia.kilometraje, distancia.tipoDistancia)
                            return (
                              <Col key={clave}>
                                <Button
                                  type="button"
                                  variant={distanciaSeleccionada === clave ? 'success' : 'outline-success'}
                                  className="w-100 py-3 d-flex flex-column align-items-center"
                                  onClick={() => seleccionarDistancia(distancia.kilometraje, distancia.tipoDistancia)}
                                >
                                  <span className="fs-4 fw-bold lh-1 mb-1">{distancia.kilometraje}K</span>
                                  <small>{distancia.tipoDistancia}</small>
                                  <small>${distancia.precio.toLocaleString('es-AR')}</small>
                                </Button>
                              </Col>
                            )
                          })}
                        </Row>

                        {distanciasDisponibles.length === 0 && (
                          <div className="text-danger small mt-2">La carrera no tiene distancias válidas disponibles.</div>
                        )}

                        {erroresPaso2.distancia && (
                          <div className="text-danger small mt-2" role="alert">{erroresPaso2.distancia.message}</div>
                        )}

                      </div>

                      {faltaAptoRequerido && (
                        <div className="alert alert-warning" role="alert">
                          Esta distancia competitiva requiere un apto médico aprobado y vigente.
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 ms-1 align-baseline"
                            onClick={() => setPaso(1)}
                          >
                            Volver a datos del corredor
                          </Button>
                        </div>
                      )}

                      {/* PRODUCTO DINÁMICO */}
                      <div className="mb-3">
                        <div className="small fw-semibold mb-2">Producto dinámico</div>

                        <ToggleButtonGroup
                          type="radio"
                          name="productoDinamico"
                          value={productoDinamico}
                          onChange={cambiarProductoDinamico}
                          className="w-100"
                        >
                          <ToggleButton id="producto-si" value="si" variant="outline-success">
                            Sí
                          </ToggleButton>
                          <ToggleButton id="producto-no" value="no" variant="outline-success">
                            No
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>

                      {productoDinamico === 'si' && (
                        <Row className="g-2">
                          <Col sm={4}>
                            <Form.Group controlId="productoSeleccionado">
                              <Form.Label className="small fw-semibold">Producto</Form.Label>
                              <Form.Select
                                isInvalid={!!erroresPaso2.productoId}
                                {...registrarPaso2('productoId', {
                                  onChange: () => {
                                    setValuePaso2('varianteId', '')
                                    setValuePaso2('cantidad', '1')
                                  },
                                })}
                              >
                                <option value="">Seleccione producto</option>
                                {(opciones?.productos ?? []).map((producto) => (
                                  <option key={producto.id} value={producto.id}>
                                    {producto.nombre}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">{erroresPaso2.productoId?.message}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col sm={4}>
                            <Form.Group controlId="varianteProducto">
                              <Form.Label className="small fw-semibold">Variante</Form.Label>
                              <Form.Select
                                isInvalid={!!erroresPaso2.varianteId}
                                {...registrarPaso2('varianteId', {
                                  onChange: () => setValuePaso2('cantidad', '1'),
                                })}
                              >
                                <option value="">Seleccione variante</option>
                                {(productoSeleccionado?.variantes ?? []).map((variante) => (
                                  <option key={variante.id} value={variante.id} disabled={variante.stock <= 0}>
                                    {variante.nombre} — ${variante.precio.toLocaleString('es-AR')} (stock: {variante.stock})
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">{erroresPaso2.varianteId?.message}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col sm={4}>
                            <Form.Group controlId="cantidadProducto">
                              <Form.Label className="small fw-semibold">Cantidad</Form.Label>
                              <Form.Select
                                isInvalid={!!erroresPaso2.cantidad || stockInsuficiente}
                                {...registrarPaso2('cantidad')}
                              >
                                {Array.from({ length: Math.min(10, varianteSeleccionada?.stock ?? 0) }, (_, i) => i + 1).map((opcion) => (
                                  <option key={opcion} value={opcion}>{opcion}</option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {erroresPaso2.cantidad?.message ?? 'No hay stock suficiente para la cantidad elegida.'}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      )}
                    </Col>

                    {/* RESUMEN */}
                    <Col lg={4} className="order-1 order-lg-2">
                      <Card>
                        <Card.Header as="h3" className="h6 fw-bold mb-0">
                          Resumen
                        </Card.Header>

                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <DatoResumen etiqueta="Corredor">
                              {datosCorredor.nombre} {datosCorredor.apellido}
                            </DatoResumen>
                            <small className="text-secondary">DNI: {datosCorredor.dni}</small>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <DatoResumen etiqueta="Carrera">{opciones?.carrera.nombre ?? 'Cargando carrera...'}</DatoResumen>
                            <small className="text-secondary">Edición {opciones ? new Date(opciones.carrera.fechaHoraCarrera).getFullYear() : '—'}</small>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <DatoResumen etiqueta="Distancia">
                              {distanciaSeleccionadaData ? `${distanciaSeleccionadaData.kilometraje}K ${distanciaSeleccionadaData.tipoDistancia}` : 'Sin seleccionar'}
                            </DatoResumen>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <DatoResumen etiqueta="Adicionales">
                              {productoDinamico === 'si' && productoSeleccionado && varianteSeleccionada ? `${cantidad} ${productoSeleccionado.nombre} (${varianteSeleccionada.nombre})` : 'Ninguno'}
                            </DatoResumen>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <div className="small text-uppercase text-secondary">Total a pagar</div>
                            <strong className="fs-4 text-success">${totalPagar.toLocaleString('es-AR')}</strong>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 border-top mt-4 pt-3">
                    <Button type="button" variant="outline-secondary" onClick={() => setPaso(1)}>
                      Volver
                    </Button>

                    <Button
                      type="submit"
                      variant="success"
                      disabled={cargandoOpciones || !opciones?.carrera.admiteInscripciones || cupoCompleto || faltaAptoRequerido || stockInsuficiente}
                    >
                      Continuar
                    </Button>
                  </div>
                </Form>
              )}

              {/* =====================================================
                  PASO 3 - CONFIRMACIÓN
              ===================================================== */}
              {paso === 3 && (
                <>
                  <div className="text-center mb-4">
                    <span className="d-inline-flex rounded-circle bg-success text-white p-2 mb-2">
                      <Check size={22} aria-hidden="true" />
                    </span>

                    <h2 className="h4 fw-bold mb-1">Confirmar inscripción</h2>
                    <p className="text-secondary small mb-0">Revisa los detalles antes de finalizar el registro.</p>
                  </div>

                  <Row className="g-3 justify-content-center">
                    {/* CORREDOR */}
                    <Col md={6} lg={5}>
                      <Card className="h-100 border-start border-success border-3">
                        <Card.Header className="d-flex align-items-center gap-2 bg-transparent fw-bold">
                          <UserRoundPlus size={16} className="text-success" aria-hidden="true" />
                          Corredor
                        </Card.Header>

                        <Card.Body className="d-flex flex-column gap-3">
                          <DatoResumen etiqueta="Nombre completo">
                            {datosCorredor.nombre} {datosCorredor.apellido}
                          </DatoResumen>
                          <DatoResumen etiqueta="DNI">{datosCorredor.dni}</DatoResumen>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* CARRERA */}
                    <Col md={6} lg={5}>
                      <Card className="h-100 border-start border-success border-3">
                        <Card.Header className="d-flex align-items-center gap-2 bg-transparent fw-bold">
                          <Footprints size={16} className="text-success" aria-hidden="true" />
                          Carrera
                        </Card.Header>

                        <Card.Body className="d-flex flex-column gap-3">
                          <DatoResumen etiqueta="Evento">{opciones?.carrera.nombre ?? '—'}</DatoResumen>

                          <Row>
                            <Col>
                              <DatoResumen etiqueta="Distancia">{distanciaSeleccionadaData ? `${distanciaSeleccionadaData.kilometraje}K` : '—'}</DatoResumen>
                            </Col>
                            <Col>
                              <DatoResumen etiqueta="Tipo">{distanciaSeleccionadaData?.tipoDistancia ?? '—'}</DatoResumen>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* DETALLES DE PAGO */}
                    <Col xs={12} lg={10}>
                      <Card className="border-start border-secondary border-3">
                        <Card.Header className="d-flex align-items-center gap-2 bg-transparent fw-bold">
                          <CreditCard size={16} className="text-success" aria-hidden="true" />
                          Detalles de pago
                        </Card.Header>

                        <Card.Body>
                          <Row className="align-items-center g-3">
                            <Col xs={6} md={4}>
                              <div className="small text-uppercase text-secondary mb-1">Estado</div>
                              <Badge pill bg="success-subtle" text="success-emphasis">
                                ● Pagado
                              </Badge>
                            </Col>

                            <Col xs={6} md={4}>
                              <DatoResumen etiqueta="Método">Pago presencial</DatoResumen>
                            </Col>

                            <Col md={4} className="text-md-end">
                              <div className="small text-uppercase text-secondary">Total a pagar</div>
                              <strong className="fs-4 text-success">${totalPagar.toLocaleString('es-AR')}</strong>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {errorCreacion && <div className="alert alert-danger mt-3" role="alert">{errorCreacion}</div>}

                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                    {!inscripcionConfirmada ? (
                      <>
                        <Button type="button" variant="outline-secondary" onClick={() => setPaso(2)}>
                          Volver
                        </Button>

                        <Button
                          type="button"
                          variant="success"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() => void confirmarInscripcion()}
                          disabled={guardando}
                        >
                          <Check size={14} aria-hidden="true" />
                          {guardando ? 'Registrando...' : 'Confirmar inscripción'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={verInscripcion}
                        >
                          <Eye size={14} aria-hidden="true" />
                          Ver inscripción
                        </Button>

                        <Button
                          type="button"
                          variant="success"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={nuevaInscripcion}
                        >
                          <Plus size={14} aria-hidden="true" />
                          Nueva inscripción
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          MODAL NUEVO CONTACTO
      ===================================================== */}
      <Modal show={mostrarModalContacto} onHide={() => setMostrarModalContacto(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 fw-bold">
            Nuevo contacto de emergencia
          </Modal.Title>
        </Modal.Header>

        <Form
          noValidate
          onSubmit={(e) => {
            // El modal está en un portal: sin esto el submit burbujea al formulario del paso 1
            e.stopPropagation()
            void guardarNuevoContacto(e)
          }}
        >
        <Modal.Body>
          <Row className="g-3">
            <Col xs={6}>
              <CampoTexto
                id="contactoNombre"
                etiqueta="Nombre"
                obligatorio
                placeholder="Ej. Juan"
                registro={registrarContacto('nombre')}
                error={erroresContacto.nombre?.message}
              />
            </Col>

            <Col xs={6}>
              <CampoTexto
                id="contactoApellido"
                etiqueta="Apellido"
                obligatorio
                placeholder="Ej. Pérez"
                registro={registrarContacto('apellido')}
                error={erroresContacto.apellido?.message}
              />
            </Col>

            <Col xs={6}>
              <CampoTexto
                id="contactoDni"
                etiqueta="DNI"
                obligatorio
                modo="numeric"
                placeholder="Ej. 12345678"
                registro={registrarContacto('dni')}
                error={erroresContacto.dni?.message}
              />
            </Col>

            <Col xs={6}>
              <CampoTexto
                id="contactoTelefono"
                etiqueta="Número de teléfono"
                obligatorio
                modo="tel"
                placeholder="Ej. +54 9 11 1234567"
                registro={registrarContacto('telefono')}
                error={erroresContacto.telefono?.message}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={() => setMostrarModalContacto(false)}>
            Cancelar
          </Button>

          <Button type="submit" variant="success">
            Guardar
          </Button>
        </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default NuevaInscripcion