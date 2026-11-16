//frontend/src/components/modales/ClavesRespaldoModal.tsx
import { useEffect, useRef, useState } from 'react'
import { Alert, Badge, Button, Col, Dropdown, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap'
import { Check, Copy, Info, KeyRound, RefreshCw, Search } from 'lucide-react'
import { listarClavesDeCuenta, listarCuentasConClaves, reemplazarClavesDeCuenta } from '../../services/claveRespaldoService'
import type { ClaveRespaldo, CuentaClaves, EstadoClaveRespaldo } from '../../types/claveRespaldo'

type Props = {
  show: boolean
  onCerrar: () => void
}

const MAX_RESULTADOS = 6

const etiquetaEstado: Record<EstadoClaveRespaldo, string> = {
  Disponible: 'Disponible',
  Utilizada: 'Utilizada',
  Invalidada: 'Anulada',
}

// Para buscar sin importar mayúsculas ni tildes
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function ClavesRespaldoModal({ show, onCerrar }: Props) {
  const [cuentas, setCuentas] = useState<CuentaClaves[]>([])
  const [seleccionada, setSeleccionada] = useState<CuentaClaves | null>(null)
  const [claves, setClaves] = useState<ClaveRespaldo[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargandoCuentas, setCargandoCuentas] = useState(false)
  const [cargandoClaves, setCargandoClaves] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiada, setCopiada] = useState<string | null>(null)
  const campoBusqueda = useRef<HTMLInputElement>(null)

  const [confirmando, setConfirmando] = useState(false)
  const [reemplazando, setReemplazando] = useState(false)

  const cuentaId = seleccionada?.id

  // Al abrir, carga las cuentas
  useEffect(() => {
    if (!show) return undefined
    let activo = true

    setCargandoCuentas(true)
    setError(null)
    listarCuentasConClaves()
      .then((respuesta) => { if (activo) setCuentas(respuesta) })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar las cuentas')
      })
      .finally(() => { if (activo) setCargandoCuentas(false) })

    return () => { activo = false }
  }, [show])

  // Al elegir una cuenta, carga sus claves
  useEffect(() => {
    if (!show || !cuentaId) return undefined
    let activo = true

    setCargandoClaves(true)
    setError(null)
    listarClavesDeCuenta(cuentaId)
      .then((respuesta) => { if (activo) setClaves(respuesta) })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar las claves')
      })
      .finally(() => { if (activo) setCargandoClaves(false) })

    return () => { activo = false }
  }, [show, cuentaId])

  const coincidencias = cuentas.filter((c) =>
    normalizar(`${c.nombre} ${c.dni} ${c.correo}`).includes(normalizar(busqueda.trim()))
  )
  const disponibles = claves.filter((c) => c.estado === 'Disponible').length

  const elegirCuenta = (id: string | null) => {
    const cuenta = cuentas.find((c) => c.id === id)
    if (!cuenta) return
    setSeleccionada(cuenta)
    setClaves([])
    setBusqueda('')
    setConfirmando(false)
  }

  const copiar = async (clave: ClaveRespaldo) => {
    if (!clave.clave) return
    try {
      await navigator.clipboard.writeText(clave.clave)
      setCopiada(clave.id)
      setTimeout(() => setCopiada(null), 1500)
    } catch {
      setError('No se pudo copiar la clave. Copiala manualmente.')
    }
  }

  const reemplazar = async () => {
    if (!cuentaId) return
    setReemplazando(true)
    setError(null)
    try {
      const nuevas = await reemplazarClavesDeCuenta(cuentaId)
      const cantidad = nuevas.filter((c) => c.estado === 'Disponible').length
      setClaves(nuevas)
      setCuentas((actuales) => actuales.map((c) => (c.id === cuentaId ? { ...c, disponibles: cantidad } : c)))
      setConfirmando(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron reemplazar las claves')
    } finally {
      setReemplazando(false)
    }
  }

  return (
    <Modal show={show} onHide={onCerrar} centered size="lg" aria-labelledby="claves-modal-titulo">
      <Modal.Header closeButton>
        <Modal.Title as="h2" id="claves-modal-titulo" className="h4 d-flex align-items-center gap-2 mb-0">
          <span className="d-inline-flex rounded bg-primary-subtle text-primary p-2">
            <KeyRound size={20} aria-hidden="true" />
          </span>
          Claves de Respaldo
          <Badge pill bg="primary-subtle" text="primary-emphasis">Uso Único</Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <p className="text-secondary">
          Listado de claves de seguridad de uso único para restablecer accesos operativos en
          estaciones de cronometraje y control de carrera. Cada clave solo permite ingresar a la
          cuenta a la que pertenece.
        </p>

        {/* Selector de cuenta con buscador */}
        <Dropdown
          className="mb-3"
          onSelect={elegirCuenta}
          onToggle={(abierto) => { if (abierto) setTimeout(() => campoBusqueda.current?.focus(), 0) }}
        >
          <Dropdown.Toggle
            variant="outline-secondary"
            className="w-100 d-flex justify-content-between align-items-center text-start"
            disabled={cargandoCuentas}
          >
            {seleccionada ? (
              <span>
                {seleccionada.nombre}
                <span className="text-secondary small"> · {seleccionada.correo}</span>
              </span>
            ) : (
              'Seleccionar cuenta...'
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="w-100 p-2 shadow">
            <InputGroup size="sm" className="mb-2">
              <InputGroup.Text><Search size={14} aria-hidden="true" /></InputGroup.Text>
              <Form.Control
                ref={campoBusqueda}
                placeholder="Buscar por nombre, DNI o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </InputGroup>

            {coincidencias.length === 0 && (
              <div className="text-secondary small px-2 py-1">No hay cuentas que coincidan.</div>
            )}

            {coincidencias.slice(0, MAX_RESULTADOS).map((c) => (
              <Dropdown.Item
                key={c.id}
                eventKey={c.id}
                active={c.id === cuentaId}
                className="d-flex justify-content-between align-items-center gap-2"
              >
                <span>
                  {c.nombre}
                  <span className="d-block small text-secondary">{c.correo} · DNI {c.dni}</span>
                </span>
                <Badge
                  pill
                  bg={c.disponibles > 0 ? 'success-subtle' : 'secondary-subtle'}
                  text={c.disponibles > 0 ? 'success-emphasis' : 'secondary-emphasis'}
                >
                  {c.disponibles} disp.
                </Badge>
              </Dropdown.Item>
            ))}

            {coincidencias.length > MAX_RESULTADOS && (
              <div className="text-secondary small px-2 pt-1">
                Mostrando {MAX_RESULTADOS} de {coincidencias.length}. Seguí escribiendo para filtrar.
              </div>
            )}
          </Dropdown.Menu>
        </Dropdown>

        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

        {!seleccionada ? (
          <p className="text-center text-secondary py-4 mb-0">
            Seleccioná una cuenta para ver sus claves de respaldo.
          </p>
        ) : cargandoClaves ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-primary-subtle rounded p-3 mb-3">
              <span className="fw-semibold">{disponibles} de {claves.length} claves disponibles</span>
              <Button
                variant="outline-danger"
                size="sm"
                className="d-inline-flex align-items-center gap-2"
                disabled={reemplazando}
                onClick={() => setConfirmando(true)}
              >
                <RefreshCw size={14} aria-hidden="true" />
                Reemplazar claves
              </Button>
            </div>

            {confirmando && (
              <Alert variant="warning" className="mb-3">
                <p className="mb-2">
                  ¿Anular las {disponibles} claves disponibles de <strong>{seleccionada.nombre}</strong> y
                  generar 8 nuevas? Las anteriores dejarán de funcionar.
                </p>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="secondary" disabled={reemplazando} onClick={() => setConfirmando(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" variant="danger" disabled={reemplazando} onClick={reemplazar}>
                    {reemplazando ? 'Reemplazando...' : 'Reemplazar claves'}
                  </Button>
                </div>
              </Alert>
            )}

            {claves.length === 0 ? (
              <p className="text-center text-secondary py-3 mb-0">
                Esta cuenta todavía no tiene claves. Se generan automáticamente antes de la carrera.
              </p>
            ) : (
              <Row className="g-3">
                {claves.map((c, indice) => {
                  const usada = c.estado !== 'Disponible'
                  return (
                    <Col xs={12} md={6} key={c.id}>
                      <div
                        className={`d-flex align-items-center gap-3 border rounded p-3 ${
                          usada ? 'bg-body-tertiary' : 'bg-body'
                        }`}
                      >
                        <Badge bg="primary-subtle" text="primary-emphasis">
                          {String(indice + 1).padStart(2, '0')}
                        </Badge>
                        {c.clave ? (
                          <span
                            className={`font-monospace fs-5 fw-bold flex-grow-1 ${
                              usada ? 'text-decoration-line-through text-body-tertiary' : ''
                            }`}
                          >
                            {c.clave}
                          </span>
                        ) : (
                          <span className="text-danger fst-italic flex-grow-1">No se pudo leer</span>
                        )}
                        {c.usos > 1 && (
                          <Badge pill bg="warning" text="dark">Usada {c.usos} veces</Badge>
                        )}
                        <Badge pill bg={usada ? 'secondary-subtle' : 'success-subtle'} text={usada ? 'secondary-emphasis' : 'success-emphasis'}>
                          {etiquetaEstado[c.estado]}
                        </Badge>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-secondary"
                          aria-label={`Copiar la clave ${indice + 1}`}
                          disabled={usada || !c.clave}
                          onClick={() => copiar(c)}
                        >
                          {copiada === c.id ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                      </div>
                    </Col>
                  )
                })}
              </Row>
            )}
          </>
        )}

        <Alert variant="primary" className="d-flex gap-2 mt-4 mb-0">
          <Info size={18} className="flex-shrink-0 mt-1" aria-hidden="true" />
          <div>
            <strong className="d-block mb-1">Instrucción de Seguridad Institucional</strong>
            Las claves se generan automáticamente para cada clasificador y son de uso único: una
            vez utilizada, queda inhabilitada de forma permanente. Solo habilitan el ingreso a la
            cuenta a la que pertenecen; los administradores siempre ingresan con su contraseña.
            Entregue a cada persona sus propias claves y guarde esta información en una ubicación
            segura y confidencial.
          </div>
        </Alert>
      </Modal.Body>
    </Modal>
  )
}

export default ClavesRespaldoModal