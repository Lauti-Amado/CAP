//frontend/src/pages/inscripciones/NuevaInscripcion.tsx
import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, Modal, Row, ToggleButton, ToggleButtonGroup,} from 'react-bootstrap'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Eye, Footprints, Plus, Search, UserRoundPlus } from 'lucide-react'
import { contactoEmergenciaSchema, inscripcionPaso1Schema } from '../../schemas/inscripcionSchema'
import { validar, type ErroresFormulario } from '../../utils/validar'
import type { ContactoEmergencia, CrearInscripcionPayload, OpcionesInscripcionDTO } from '../../types/inscripcion'
import { ApiError } from '../../services/apiService'
import {
  buscarContactoEmergencia as buscarContactoEmergenciaAPI,
  crearInscripcion,
  obtenerOpcionesInscripcion,
} from '../../services/inscripcionService'
import { useCarreraActual } from '../../hooks/useCarreraActual'

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
  valor: string
  onCambio: (valor: string) => void
  error?: string
  obligatorio?: boolean
  placeholder?: string
  tipo?: 'text' | 'date'
  modo?: 'numeric' | 'tel'
  min?: string
}

function CampoTexto({ id, etiqueta, valor, onCambio, error, obligatorio, placeholder, tipo = 'text', modo, min }: CampoTextoProps) {
  return (
    <Form.Group controlId={id}>
      <Form.Label className="small fw-semibold">
        {etiqueta} {obligatorio && <span className="text-danger">*</span>}
      </Form.Label>

      <Form.Control
        type={tipo}
        inputMode={modo}
        min={min}
        value={valor}
        placeholder={placeholder}
        isInvalid={!!error}
        onChange={(e) => onCambio(e.target.value)}
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

  const [datosCorredor, setDatosCorredor] = useState<DatosCorredor>({
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

  /* ---------- Contacto de emergencia ---------- */

  const [dniContacto, setDniContacto] = useState('')
  const [contactoEmergencia, setContactoEmergencia] = useState<ContactoEmergencia | null>(null)
  const [mostrarModalContacto, setMostrarModalContacto] = useState(false)
  const [nuevoContacto, setNuevoContacto] = useState<ContactoEmergencia>({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  })

  const [mostrarErrores, setMostrarErrores] = useState(false)
  const [erroresContacto, setErroresContacto] = useState<ErroresFormulario>({})
  const [buscandoContacto, setBuscandoContacto] = useState(false)
  const [errorBusquedaContacto, setErrorBusquedaContacto] = useState<string | null>(null)

  /* ---------- Datos de la inscripción ---------- */

  const [distanciaSeleccionada, setDistanciaSeleccionada] = useState('')
  const [productoDinamico, setProductoDinamico] = useState<'si' | 'no'>('no')
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('')
  const [varianteProducto, setVarianteProducto] = useState('')
  const [cantidadProducto, setCantidadProducto] = useState('1')
  const [errorAptoMedico, setErrorAptoMedico] = useState<string | null>(null)

  const actualizarDato = (campo: keyof DatosCorredor, valor: string | boolean) => {
    setDatosCorredor((anterior) => ({ ...anterior, [campo]: valor }))
  }

  const volverAInscripciones = () => {
    navigate(`/clasificador/entrega-kits/${nombreCarrera}/inscripciones`)
  }

  /* =====================================================
     BÚSQUEDA DE CONTACTO
  ===================================================== */

  const buscarContactoEmergencia = async () => {
    const dni = dniContacto.trim()

    if (!/^\d{7,8}$/.test(dni)) {
      setErrorBusquedaContacto('Ingresá un DNI válido de 7 u 8 números.')
      return
    }

    try {
      setBuscandoContacto(true)
      setErrorBusquedaContacto(null)

      const contactoEncontrado = await buscarContactoEmergenciaAPI(dni)
      setContactoEmergencia(contactoEncontrado)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setNuevoContacto({ nombre: '', apellido: '', dni, telefono: '' })
        setErroresContacto({})
        setMostrarModalContacto(true)
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
  }

  const abrirModalNuevoContacto = () => {
    setNuevoContacto({ nombre: '', apellido: '', dni: dniContacto.trim(), telefono: '' })
    setErroresContacto({})
    setMostrarModalContacto(true)
  }

  const actualizarContacto = (campo: keyof ContactoEmergencia, valor: string) => {
    setNuevoContacto((anterior) => ({ ...anterior, [campo]: valor }))
    setErroresContacto((anteriores) => ({ ...anteriores, [campo]: '' }))
  }

  // El contacto nuevo se envía junto con la inscripción; el backend lo crea en esa operación.
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
  const errorPaso1 = (campo: string) => (mostrarErrores ? validacionPaso1.errores[campo] : undefined)

  const errorContactoPaso1 = errorPaso1('contactoEmergencia') ?? errorPaso1('contactoEmergencia.dni')

  const continuarPaso1 = () => {
    if (!validacionPaso1.ok) {
      setMostrarErrores(true)
      return
    }

    if (datosCorredor.aptoMedico && !aptoMedicoValido) {
      setErrorAptoMedico('El apto médico debe estar vigente hasta la fecha de la carrera.')
      return
    }

    setErrorAptoMedico(null)
    setPaso(2)
  }

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const mananaISO = new Date(manana.getTime() - manana.getTimezoneOffset() * 60000).toISOString().slice(0, 10)

  /* =====================================================
     DATOS DEL PASO 2
  ===================================================== */

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
    setDistanciaSeleccionada(claveDistancia(kilometraje, tipoDistancia))
    setErrorAptoMedico(null)
  }

  const fechaCarrera = opciones ? new Date(opciones.carrera.fechaHoraCarrera) : null
  const fechaCarreraISO = fechaCarrera
    ? new Date(fechaCarrera.getTime() - fechaCarrera.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    : undefined
  const fechaMinimaApto = fechaCarreraISO && fechaCarreraISO > mananaISO
    ? fechaCarreraISO
    : mananaISO

  const aptoMedicoValido = datosCorredor.aptoMedico &&
    datosCorredor.vencimientoAptoMedico !== '' &&
    datosCorredor.vencimientoAptoMedico >= fechaMinimaApto

  const errorAptoMedicoVisible = datosCorredor.aptoMedico && !aptoMedicoValido
    ? `El apto médico debe estar vigente hasta la fecha de la carrera (${fechaCarreraISO ?? 'fecha no disponible'}).`
    : errorAptoMedico ?? undefined

  const faltaAptoRequerido = requiereAptoMedico && !aptoMedicoValido

  const puedeContinuarPaso2 = Boolean(
    distanciaSeleccionadaData &&
    (productoDinamico === 'no' || (
      productoSeleccionadoId !== '' &&
      varianteProducto !== '' &&
      cantidadProducto !== '' &&
      varianteSeleccionada &&
      varianteSeleccionada.stock >= cantidad
    )) &&
    (!datosCorredor.aptoMedico || aptoMedicoValido) &&
    (!requiereAptoMedico || aptoMedicoValido)
  )

  const cambiarProductoDinamico = (valor: 'si' | 'no') => {
    setProductoDinamico(valor)

    if (valor === 'no') {
      setProductoSeleccionadoId('')
      setVarianteProducto('')
      setCantidadProducto('1')
    }
  }

  const continuarPaso2 = () => {
    if (requiereAptoMedico && !aptoMedicoValido) {
      setErrorAptoMedico('Para esta distancia necesitás registrar un apto médico aprobado y vigente hasta la fecha de la carrera.')
      setPaso(1)
      return
    }

    if (datosCorredor.aptoMedico && !aptoMedicoValido) {
      setErrorAptoMedico('Ingresá una fecha de vencimiento que cubra la fecha de la carrera.')
      setPaso(1)
      return
    }

    if (!opciones?.carrera.admiteInscripciones) return
    if (opciones.cupo.ocupados >= opciones.cupo.maximo) return
    if (!puedeContinuarPaso2) return

    setErrorAptoMedico(null)
    setPaso(3)
    setInscripcionConfirmada(false)
  }

  /* =====================================================
     CONFIRMAR INSCRIPCIÓN
  ===================================================== */

  const confirmarInscripcion = async () => {
    if (!carreraSeleccionada || !distanciaSeleccionadaData || !contactoEmergencia) {
      setErrorCreacion('Faltan datos para registrar la inscripción.')
      return
    }

    if (requiereAptoMedico && !aptoMedicoValido) {
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
        sexo: datosCorredor.genero as 'Femenino' | 'Masculino',
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

          {opciones && opciones.cupo.ocupados >= opciones.cupo.maximo && (
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
                <>
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
                        valor={datosCorredor.nombre}
                        onCambio={(valor) => actualizarDato('nombre', valor)}
                        error={errorPaso1('corredor.nombre')}
                      />
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="apellido"
                        etiqueta="Apellido"
                        obligatorio
                        placeholder="Ingrese el apellido"
                        valor={datosCorredor.apellido}
                        onCambio={(valor) => actualizarDato('apellido', valor)}
                        error={errorPaso1('corredor.apellido')}
                      />
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="genero">
                        <Form.Label className="small fw-semibold">
                          Género <span className="text-danger">*</span>
                        </Form.Label>

                        <Form.Select
                          value={datosCorredor.genero}
                          isInvalid={!!errorPaso1('corredor.genero')}
                          onChange={(e) => actualizarDato('genero', e.target.value)}
                        >
                          <option value="" disabled>Seleccione género</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Masculino">Masculino</option>
                        </Form.Select>

                        <Form.Control.Feedback type="invalid">
                          {errorPaso1('corredor.genero')}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="fechaNacimiento"
                        etiqueta="Fecha de nacimiento"
                        obligatorio
                        tipo="date"
                        valor={datosCorredor.fechaNacimiento}
                        onCambio={(valor) => actualizarDato('fechaNacimiento', valor)}
                        error={errorPaso1('corredor.fechaNacimiento')}
                      />
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="dni"
                        etiqueta="DNI"
                        obligatorio
                        modo="numeric"
                        placeholder="Ej. 12345678"
                        valor={datosCorredor.dni}
                        onCambio={(valor) => actualizarDato('dni', valor)}
                        error={errorPaso1('corredor.dni')}
                      />
                    </Col>

                    <Col md={6}>
                      <CampoTexto
                        id="telefono"
                        etiqueta="Número de teléfono"
                        obligatorio
                        modo="tel"
                        placeholder="Ej. +54 9 11 1234-5678"
                        valor={datosCorredor.telefono}
                        onCambio={(valor) => actualizarDato('telefono', valor)}
                        error={errorPaso1('corredor.telefono')}
                      />
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="discapacidad">
                        <Form.Label className="small fw-semibold">Discapacidad</Form.Label>

                        <Form.Select
                          value={datosCorredor.discapacidad}
                          onChange={(e) => actualizarDato('discapacidad', e.target.value)}
                        >
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
                      checked={datosCorredor.aptoMedico}
                      onChange={(e) => {
                        const aprobado = e.currentTarget.checked
                        actualizarDato('aptoMedico', aprobado)
                        if (!aprobado) actualizarDato('vencimientoAptoMedico', '')
                        setErrorAptoMedico(null)
                      }}
                    />

                    {datosCorredor.aptoMedico && (
                      <div className="mt-3">
                        <CampoTexto
                          id="vencimientoAptoMedico"
                          etiqueta="Fecha de vencimiento del apto médico"
                          obligatorio
                          tipo="date"
                          min={fechaMinimaApto}
                          valor={datosCorredor.vencimientoAptoMedico}
                          onCambio={(valor) => {
                            actualizarDato('vencimientoAptoMedico', valor)
                            setErrorAptoMedico(null)
                          }}
                          error={errorAptoMedicoVisible}
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
                        value={dniContacto}
                        placeholder="Buscar por DNI"
                        aria-label="DNI del contacto de emergencia"
                        onChange={(e) => setDniContacto(e.target.value)}
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
                        onClick={abrirModalNuevoContacto}
                      >
                        <UserRoundPlus size={14} aria-hidden="true" />
                        Nuevo contacto
                      </Button>
                    </InputGroup>

                    {errorBusquedaContacto && (
                      <div className="text-danger small mt-2" role="alert">{errorBusquedaContacto}</div>
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
                    <Button type="button" variant="success" onClick={continuarPaso1}>
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
                                value={productoSeleccionadoId}
                                onChange={(e) => {
                                  setProductoSeleccionadoId(e.target.value)
                                  setVarianteProducto('')
                                  setCantidadProducto('1')
                                }}
                              >
                                <option value="">Seleccione producto</option>
                                {(opciones?.productos ?? []).map((producto) => (
                                  <option key={producto.id} value={producto.id}>
                                    {producto.nombre}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col sm={4}>
                            <Form.Group controlId="varianteProducto">
                              <Form.Label className="small fw-semibold">Variante</Form.Label>
                              <Form.Select
                                value={varianteProducto}
                                disabled={!productoSeleccionado}
                                onChange={(e) => {
                                  setVarianteProducto(e.target.value)
                                  setCantidadProducto('1')
                                }}
                              >
                                <option value="">Seleccione variante</option>
                                {(productoSeleccionado?.variantes ?? []).map((variante) => (
                                  <option key={variante.id} value={variante.id} disabled={variante.stock <= 0}>
                                    {variante.nombre} — ${variante.precio.toLocaleString('es-AR')} (stock: {variante.stock})
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col sm={4}>
                            <Form.Group controlId="cantidadProducto">
                              <Form.Label className="small fw-semibold">Cantidad</Form.Label>
                              <Form.Select
                                value={cantidadProducto}
                                disabled={!varianteSeleccionada || varianteSeleccionada.stock <= 0}
                                onChange={(e) => setCantidadProducto(e.target.value)}
                              >
                                {Array.from({ length: Math.min(10, varianteSeleccionada?.stock ?? 0) }, (_, i) => i + 1).map((opcion) => (
                                  <option key={opcion} value={opcion}>{opcion}</option>
                                ))}
                              </Form.Select>
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

                    <Button type="button" variant="success" disabled={!puedeContinuarPaso2 || cargandoOpciones || !opciones?.carrera.admiteInscripciones || (opciones.cupo.ocupados >= opciones.cupo.maximo)} onClick={continuarPaso2}>
                      Continuar
                    </Button>
                  </div>
                </>
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

        <Modal.Body>
          <Row className="g-3">
            <Col xs={6}>
              <CampoTexto
                id="contactoNombre"
                etiqueta="Nombre"
                obligatorio
                placeholder="Ej. Juan"
                valor={nuevoContacto.nombre}
                onCambio={(valor) => actualizarContacto('nombre', valor)}
                error={erroresContacto.nombre}
              />
            </Col>

            <Col xs={6}>
              <CampoTexto
                id="contactoApellido"
                etiqueta="Apellido"
                obligatorio
                placeholder="Ej. Pérez"
                valor={nuevoContacto.apellido}
                onCambio={(valor) => actualizarContacto('apellido', valor)}
                error={erroresContacto.apellido}
              />
            </Col>

            <Col xs={6}>
              <CampoTexto
                id="contactoDni"
                etiqueta="DNI"
                obligatorio
                modo="numeric"
                placeholder="Ej. 12345678"
                valor={nuevoContacto.dni}
                onCambio={(valor) => actualizarContacto('dni', valor)}
                error={erroresContacto.dni}
              />
            </Col>

            <Col xs={6}>
              <CampoTexto
                id="contactoTelefono"
                etiqueta="Número de teléfono"
                obligatorio
                modo="tel"
                placeholder="Ej. +54 9 11 1234567"
                valor={nuevoContacto.telefono}
                onCambio={(valor) => actualizarContacto('telefono', valor)}
                error={erroresContacto.telefono}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={() => setMostrarModalContacto(false)}>
            Cancelar
          </Button>

          <Button type="button" variant="success" onClick={guardarNuevoContacto}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default NuevaInscripcion