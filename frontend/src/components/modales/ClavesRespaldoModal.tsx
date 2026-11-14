//frontend/src/components/modales/ClavesRespaldoModal.tsx
import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Modal, Spinner } from 'react-bootstrap'
import { Check, Copy, Info, KeyRound, RefreshCw } from 'lucide-react'
import ConfirmacionModal from './ConfirmacionModal'
import { generarClavesRespaldo, listarClavesRespaldo } from '../../services/claveRespaldoService'
import type { ClaveRespaldo } from '../../types/claveRespaldo'
import './ClavesRespaldoModal.css'

type Props = {
  show: boolean
  onCerrar: () => void
}

function ClavesRespaldoModal({ show, onCerrar }: Props) {
  const [claves, setClaves] = useState<ClaveRespaldo[]>([])
  const [cargando, setCargando] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiada, setCopiada] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setClaves(await listarClavesRespaldo())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las claves')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (show) cargar()
  }, [show, cargar])

  const disponibles = claves.filter((c) => c.estado === 'Disponible').length

  const generar = async () => {
    setGenerando(true)
    setError(null)
    try {
      setClaves(await generarClavesRespaldo())
      setConfirmando(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron generar las claves')
      setConfirmando(false)
    } finally {
      setGenerando(false)
    }
  }

  const copiar = async (clave: ClaveRespaldo) => {
    try {
      await navigator.clipboard.writeText(clave.clave)
      setCopiada(clave.id)
      setTimeout(() => setCopiada(null), 1500)
    } catch {
      setError('No se pudo copiar la clave. Copiala manualmente.')
    }
  }

  return (
    <>
      <Modal
        show={show}
        onHide={onCerrar}
        centered
        size="lg"
        contentClassName="claves-modal"
        aria-labelledby="claves-modal-titulo"
      >
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="claves-icono"><KeyRound size={20} aria-hidden="true" /></span>
                <h2 id="claves-modal-titulo" className="h4 fw-bold mb-0">Claves de Respaldo</h2>
                <span className="claves-pill claves-pill--uso-unico">Uso Único</span>
              </div>
              <p className="text-secondary mb-0">
                Listado de claves de seguridad de uso único para restablecer accesos operativos
                en estaciones de cronometraje y control de carrera.
              </p>
            </div>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 claves-barra p-3 mb-3">
            <span className="fw-semibold">
              {disponibles} de {claves.length} claves disponibles
            </span>
            <Button
              className="claves-btn-generar d-inline-flex align-items-center gap-2"
              disabled={cargando || generando}
              onClick={() => setConfirmando(true)}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Generar nuevas claves
            </Button>
          </div>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          {cargando ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : claves.length === 0 ? (
            <p className="text-center text-secondary py-4 mb-0">
              Todavía no hay claves generadas.
            </p>
          ) : (
            <div className="row g-3">
              {claves.map((c) => {
                const usada = c.estado !== 'Disponible'
                return (
                  <div className="col-12 col-md-6" key={c.id}>
                    <div className={`claves-item ${usada ? 'claves-item--usada' : ''}`}>
                      <span className="claves-numero">{String(c.numero).padStart(2, '0')}</span>
                      <code className="claves-codigo flex-grow-1">{c.clave}</code>
                      <span className={`claves-pill claves-pill--${c.estado.toLowerCase()}`}>
                        {c.estado === 'Disponible' ? 'Disponible' : c.estado === 'Utilizada' ? 'Utilizada' : 'Anulada'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-secondary p-0"
                        aria-label={`Copiar clave ${c.numero}`}
                        disabled={usada}
                        onClick={() => copiar(c)}
                      >
                        {copiada === c.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="claves-aviso d-flex gap-2 p-3 mt-4">
            <Info size={18} className="flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong className="d-block mb-1">Instrucción de Seguridad Institucional</strong>
              Las claves de respaldo son de uso único. Una vez utilizada una clave para restablecer
              el acceso o autenticar un punto de cronometraje de emergencia, queda inhabilitada de
              forma permanente. Guarde esta información en una ubicación segura y confidencial.
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ConfirmacionModal
        show={confirmando}
        titulo="¿Generar nuevas claves?"
        descripcion="Las claves disponibles del listado actual quedarán anuladas y se creará un lote nuevo de 8 claves."
        textoConfirmar="Generar claves"
        iconoConfirmar={<RefreshCw size={16} aria-hidden="true" />}
        cargando={generando}
        onConfirmar={generar}
        onCancelar={() => setConfirmando(false)}
      />
    </>
  )
}

export default ClavesRespaldoModal