//frontend/src/components/certificados/CertificadosSocios.tsx
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Alert, Badge, Button, Form, InputGroup, Spinner, Table } from 'react-bootstrap'
import { Award, RefreshCw, Search, Send } from 'lucide-react'
import ConfirmacionModal from '../modales/ConfirmacionModal'
import { ApiError } from '../../services/apiService'
import { buscarCandidatos, enviarCertificado, listarPendientes, reintentarPendientes,} from '../../services/certificadosService'
import type { CandidatoCertificado, EstadoCertificado } from '../../types/certificado'

type Props = { carreraId: string }
type Mensaje = { variante: 'success' | 'warning' | 'danger'; texto: string }

const ESTADOS: Record<EstadoCertificado, { bg: string; texto?: string; etiqueta: string }> = {
  Sin_enviar: { bg: 'secondary', etiqueta: 'Sin enviar' },
  Pendiente: { bg: 'warning', texto: 'dark', etiqueta: 'En cola' },
  Enviado: { bg: 'success', etiqueta: 'Enviado' },
}

const textoError = (error: unknown, defecto: string) =>
  error instanceof ApiError ? error.message : defecto

export default function CertificadosSocios({ carreraId }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('')
  const [candidatos, setCandidatos] = useState<CandidatoCertificado[]>([])
  const [cantidadPendientes, setCantidadPendientes] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [enviandoId, setEnviandoId] = useState<string | null>(null)
  const [reintentando, setReintentando] = useState(false)
  const [porEnviar, setPorEnviar] = useState<CandidatoCertificado | null>(null)
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)

  const cargar = useCallback(async (texto: string) => {
    setCargando(true)
    try {
      const [lista, pendientes] = await Promise.all([
        buscarCandidatos(carreraId, texto),
        listarPendientes(carreraId),
      ])
      setCandidatos(lista)
      setCantidadPendientes(pendientes.length)
    } catch (error) {
      setMensaje({ variante: 'danger', texto: textoError(error, 'No se pudieron cargar los socios.') })
    } finally {
      setCargando(false)
    }
  }, [carreraId])

  useEffect(() => {
    void cargar('')
  }, [cargar])

  const buscar = (evento: FormEvent) => {
    evento.preventDefault()
    setFiltro(busqueda)
    void cargar(busqueda)
  }

  const confirmarEnvio = async () => {
    if (!porEnviar) return
    const socio = porEnviar
    setPorEnviar(null)
    setEnviandoId(socio.inscripcionId)
    setMensaje(null)

    try {
      const resultado = await enviarCertificado(socio.inscripcionId)
      setMensaje({
        variante: resultado.estado === 'Enviado' ? 'success' : 'warning',
        texto: resultado.mensaje,
      })
      await cargar(filtro)
    } catch (error) {
      setMensaje({ variante: 'danger', texto: textoError(error, 'No se pudo enviar el certificado.') })
    } finally {
      setEnviandoId(null)
    }
  }

  const reintentar = async () => {
    setReintentando(true)
    setMensaje(null)
    try {
      const { enviados, pendientes } = await reintentarPendientes(carreraId)
      setMensaje({
        variante: pendientes > 0 ? 'warning' : 'success',
        texto:
          pendientes > 0
            ? `Se enviaron ${enviados}. Siguen en cola ${pendientes} (revisá la conexión).`
            : `Se enviaron ${enviados} certificados en cola.`,
      })
      await cargar(filtro)
    } catch (error) {
      setMensaje({ variante: 'danger', texto: textoError(error, 'No se pudo reintentar el envío.') })
    } finally {
      setReintentando(false)
    }
  }

  return (
    <section className="card shadow-sm border">
      <div className="card-body">
        <div className="d-flex align-items-start gap-3 mb-3">
          <span className="d-inline-flex align-items-center justify-content-center rounded-3 text-white bg-success flex-shrink-0" style={{ width: 44, height: 44 }}>
            <Award size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="h6 fw-bold mb-1">Certificados para socios</h2>
            <p className="small text-secondary mb-0">
              Cada certificado se puede enviar una sola vez.
            </p>
          </div>
        </div>

        {mensaje && (
          <Alert variant={mensaje.variante} dismissible onClose={() => setMensaje(null)}>
            {mensaje.texto}
          </Alert>
        )}

        {cantidadPendientes > 0 && (
          <Alert variant="warning" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span>
              Hay <strong>{cantidadPendientes}</strong> certificado(s) en cola por falta de conexión.
            </span>
            <Button variant="warning" size="sm" disabled={reintentando} onClick={reintentar}>
              {reintentando ? <Spinner size="sm" className="me-2" /> : <RefreshCw size={14} className="me-2" aria-hidden="true" />}
              Reintentar envío
            </Button>
          </Alert>
        )}

        <Form onSubmit={buscar} className="mb-3">
          <InputGroup>
            <InputGroup.Text><Search size={16} aria-hidden="true" /></InputGroup.Text>
            <Form.Control
              placeholder="Buscar socio por nombre, apellido, DNI o dorsal..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Button type="submit" variant="success" disabled={cargando}>Buscar</Button>
          </InputGroup>
        </Form>

        {cargando ? (
          <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
        ) : (
          <Table responsive hover size="sm" className="align-middle mb-0">
            <thead>
              <tr>
                <th>Puesto</th><th>Dorsal</th><th>Socio</th><th>Distancia</th><th>Tiempo</th><th>Estado</th><th />
              </tr>
            </thead>
            <tbody>
              {candidatos.length === 0 && (
                <tr><td colSpan={7} className="text-center text-secondary py-3">No se encontraron socios que hayan finalizado.</td></tr>
              )}
              {candidatos.map((socio) => {
                const estado = ESTADOS[socio.estado]
                return (
                  <tr key={socio.inscripcionId}>
                    <td className="fw-bold">{socio.puesto ?? '-'}</td>
                    <td>{socio.dorsal ?? '-'}</td>
                    <td>
                      <div className="fw-semibold">{socio.nombre} {socio.apellido}</div>
                      <small className="text-secondary">{socio.email}</small>
                    </td>
                    <td>{socio.distancia.kilometraje} km</td>
                    <td>{socio.tiempo ?? '-'}</td>
                    <td><Badge bg={estado.bg} text={estado.texto}>{estado.etiqueta}</Badge></td>
                    <td className="text-end">
                      <Button
                        variant="success"
                        size="sm"
                        disabled={socio.estado === 'Enviado' || enviandoId !== null}
                        onClick={() => setPorEnviar(socio)}
                      >
                        {enviandoId === socio.inscripcionId
                          ? <Spinner size="sm" />
                          : <><Send size={13} className="me-1" aria-hidden="true" />Enviar</>}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </div>

      <ConfirmacionModal
        show={porEnviar !== null}
        titulo="¿Enviar el certificado?"
        descripcion={
          porEnviar
            ? `Se enviará a ${porEnviar.nombre} ${porEnviar.apellido} (${porEnviar.email}). Solo se puede enviar una vez.`
            : ''
        }
        textoConfirmar="Enviar"
        onConfirmar={confirmarEnvio}
        onCancelar={() => setPorEnviar(null)}
      />
    </section>
  )
}