//frontend/src/pages/inscripciones/NuevaInscripcion.tsx
import { useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, Modal, Row, ToggleButton, ToggleButtonGroup,} from 'react-bootstrap'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Eye, Footprints, Plus, Search, UserRoundPlus } from 'lucide-react'
import { contactoEmergenciaSchema, inscripcionPaso1Schema } from '../../schemas/inscripcionSchema'
import { validar, type ErroresFormulario } from '../../utils/validar'
import type { ContactoEmergencia } from '../../types/inscripcion'

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

  /* ---------- Datos de la inscripción ---------- */

  const [distanciaSeleccionada, setDistanciaSeleccionada] = useState('')
  const [productoDinamico, setProductoDinamico] = useState<'si' | 'no'>('no')
  const [varianteProducto, setVarianteProducto] = useState('')
  const [cantidadProducto, setCantidadProducto] = useState('1')

  const actualizarDato = (campo: keyof DatosCorredor, valor: string | boolean) => {
    setDatosCorredor((anterior) => ({ ...anterior, [campo]: valor }))
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

    if (!dni) return

    const contactoEncontrado = contactosEmergenciaMock.find((contacto) => contacto.dni === dni)

    if (contactoEncontrado) {
      setContactoEmergencia(contactoEncontrado)
      return
    }

    setNuevoContacto({ nombre: '', apellido: '', dni, telefono: '' })
    setErroresContacto({})
    setMostrarModalContacto(true)
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

  /*
   * TODO BACKEND:
   *
   * POST /api/contactos-emergencia
   *
   * Actualmente solamente se guarda en el estado local.
   */
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

    setPaso(2)
  }

  /* =====================================================
     DATOS DEL PASO 2
  ===================================================== */

  const distanciaSeleccionadaData = distanciasInscripcionMock.find(
    (distancia) => distancia.id === distanciaSeleccionada,
  )

  const productoSeleccionado = productosDinamicosMock[0]
  const cantidad = Number(cantidadProducto) || 1
  const precioDistancia = distanciaSeleccionadaData?.precio ?? 0
  const precioProducto = productoDinamico === 'si' ? productoSeleccionado.precio * cantidad : 0
  const totalPagar = precioDistancia + precioProducto

  const puedeContinuarPaso2 =
    distanciaSeleccionada !== '' &&
    (productoDinamico === 'no' || (varianteProducto !== '' && cantidadProducto !== ''))

  const cambiarProductoDinamico = (valor: 'si' | 'no') => {
    setProductoDinamico(valor)

    if (valor === 'no') {
      setVarianteProducto('')
      setCantidadProducto('1')
    }
  }

  const continuarPaso2 = () => {
    if (!puedeContinuarPaso2) return

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

  const hoyISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

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

                    <Col md={6}>
                      <div className="small fw-semibold mb-2">Apto médico</div>

                      <Form.Check
                        type="checkbox"
                        id="aptoMedico"
                        label="Apto médico aprobado"
                        checked={datosCorredor.aptoMedico}
                        onChange={(e) => actualizarDato('aptoMedico', e.currentTarget.checked)}
                      />
                    </Col>

                    {datosCorredor.aptoMedico && (
                      <Col md={6}>
                        <CampoTexto
                          id="vencimientoAptoMedico"
                          etiqueta="Fecha de vencimiento del apto médico"
                          tipo="date"
                          min={hoyISO}
                          valor={datosCorredor.vencimientoAptoMedico}
                          onCambio={(valor) => actualizarDato('vencimientoAptoMedico', valor)}
                          error={errorPaso1('corredor.vencimientoAptoMedico')}
                        />
                      </Col>
                    )}
                  </Row>

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
                        onClick={buscarContactoEmergencia}
                      >
                        <Search size={14} aria-hidden="true" />
                        Buscar
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
                          {distanciasInscripcionMock.map((distancia) => (
                            <Col key={distancia.id}>
                              <Button
                                type="button"
                                variant={distanciaSeleccionada === distancia.id ? 'success' : 'outline-success'}
                                className="w-100 py-3 d-flex flex-column align-items-center"
                                onClick={() => setDistanciaSeleccionada(distancia.id)}
                              >
                                <span className="fs-4 fw-bold lh-1 mb-1">{distancia.nombre}</span>
                                <small>{distancia.descripcion}</small>
                              </Button>
                            </Col>
                          ))}
                        </Row>
                      </div>

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
                          <Col sm={6}>
                            <Form.Group controlId="varianteProducto">
                              <Form.Label className="small fw-semibold">Variante del producto</Form.Label>

                              <Form.Select value={varianteProducto} onChange={(e) => setVarianteProducto(e.target.value)}>
                                <option value="">Seleccione variante</option>
                                {variantesProductoMock.map((variante) => (
                                  <option key={variante} value={variante}>
                                    {variante}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col sm={6}>
                            <Form.Group controlId="cantidadProducto">
                              <Form.Label className="small fw-semibold">Cantidad</Form.Label>

                              <Form.Select value={cantidadProducto} onChange={(e) => setCantidadProducto(e.target.value)}>
                                {cantidadesProductoMock.map((opcion) => (
                                  <option key={opcion} value={opcion}>
                                    {opcion}
                                  </option>
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
                            <DatoResumen etiqueta="Carrera">{carreraInscripcionMock.nombre}</DatoResumen>
                            <small className="text-secondary">Edición {carreraInscripcionMock.edicion}</small>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <DatoResumen etiqueta="Distancia">
                              {distanciaSeleccionadaData ? distanciaSeleccionadaData.nombre : 'Sin seleccionar'}
                            </DatoResumen>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <DatoResumen etiqueta="Adicionales">
                              {productoDinamico === 'si' ? `${cantidad} ${productoSeleccionado.nombre}` : 'Ninguno'}
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

                    <Button type="button" variant="success" disabled={!puedeContinuarPaso2} onClick={continuarPaso2}>
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
                          <DatoResumen etiqueta="Evento">{carreraInscripcionMock.nombre}</DatoResumen>

                          <Row>
                            <Col>
                              <DatoResumen etiqueta="Distancia">{distanciaSeleccionadaData?.nombre}</DatoResumen>
                            </Col>
                            <Col>
                              <DatoResumen etiqueta="Tipo">{distanciaSeleccionadaData?.descripcion}</DatoResumen>
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
                          onClick={confirmarInscripcion}
                        >
                          <Check size={14} aria-hidden="true" />
                          Confirmar inscripción
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