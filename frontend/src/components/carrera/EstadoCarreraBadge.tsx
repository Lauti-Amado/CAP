//frontend/src/components/carrera/EstadoCarreraBadge.tsx
import type { EstadoCronometro } from '../../hooks/useCronometroCarrera'
import './EstadoCarreraBadge.css'

const config: Record<EstadoCronometro, { texto: string; clase: string; pulso: boolean }> = {
  'sin-iniciar': { texto: 'SIN INICIAR', clase: 'estado-carrera--gris', pulso: false },
  'en-curso': { texto: 'EN CURSO', clase: 'estado-carrera--verde', pulso: true },
  finalizada: { texto: 'FINALIZADA', clase: 'estado-carrera--gris', pulso: false },
}

function EstadoCarreraBadge({ estado }: { estado: EstadoCronometro }) {
  const { texto, clase, pulso } = config[estado]

  return (
    <span className={`estado-carrera ${clase}`}>
      {pulso && <span className="estado-carrera__punto" />}
      {texto}
    </span>
  )
}

export default EstadoCarreraBadge