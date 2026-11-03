//frontend/src/components/clasificacion/EstadisticasClasificacion.tsx
import { Card, Col, ProgressBar, Row } from 'react-bootstrap'
import { Flag, Footprints, Users } from 'lucide-react'

type EstadisticasClasificacionProps = {
  participantes: number
  llegados: number
  pendientes: number
  progreso: number
}

const formatear = (numero: number) => numero.toLocaleString('es-AR')

function EstadisticasClasificacion({ participantes, llegados, pendientes, progreso }: EstadisticasClasificacionProps) {
  const estadisticas = [
    { etiqueta: 'Participantes', valor: formatear(participantes), icon: Users },
    { etiqueta: 'Llegados', valor: formatear(llegados), icon: Flag },
    { etiqueta: 'Pendientes', valor: formatear(pendientes), icon: Footprints },
  ]

  return (
    <Row className="g-3 mb-4">
      {estadisticas.map(({ etiqueta, valor, icon: Icono }) => (
        <Col xs={6} lg={3} key={etiqueta}>
          <Card className="h-100 shadow-sm border" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center gap-2 text-muted fw-semibold mb-2" style={{ fontSize: '0.8rem' }}>
                <Icono size={15} aria-hidden="true" />
                {etiqueta}
              </div>
              <div className="fw-bold text-dark" style={{ fontSize: '1.75rem' }}>{valor}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}

      <Col xs={6} lg={3}>
        <Card className="h-100 shadow-sm border" style={{ borderRadius: '8px' }}>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2 text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>
              <span>Progreso</span>
              <strong className="text-dark">{progreso}%</strong>
            </div>
            <ProgressBar now={progreso} variant="success" style={{ height: 6 }} className="mt-3" />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default EstadisticasClasificacion