//frontend/src/components/carrera/EstadoCarreraBadge.tsx
import { Badge, Spinner } from 'react-bootstrap'
import type { EstadoCronometro } from '../../hooks/useCronometroCarrera'

const config: Record<EstadoCronometro, { texto: string; bg: string; text: string; pulso: boolean }> = {
  'sin-iniciar': { texto: 'SIN INICIAR', bg: 'secondary-subtle', text: 'secondary-emphasis', pulso: false },
  'en-curso': { texto: 'EN CURSO', bg: 'success-subtle', text: 'success-emphasis', pulso: true },
  finalizada: { texto: 'FINALIZADA', bg: 'secondary-subtle', text: 'secondary-emphasis', pulso: false },
}

function EstadoCarreraBadge({ estado }: { estado: EstadoCronometro }) {
  const { texto, bg, text, pulso } = config[estado]

  return (
    <Badge pill bg={bg} text={text} className="d-inline-flex align-items-center gap-2">
      {pulso && (
        <Spinner animation="grow" size="sm" aria-hidden="true" style={{ width: '0.4rem', height: '0.4rem' }} />
      )}
      {texto}
    </Badge>
  )
}

export default EstadoCarreraBadge