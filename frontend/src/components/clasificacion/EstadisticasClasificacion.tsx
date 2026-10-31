//frontend/src/components/clasificacion/EstadisticasClasificacion.tsx
import { Card, Col, ProgressBar, Row } from 'react-bootstrap'
import { Flag, Footprints, Users } from 'lucide-react'
import '../../pages/clasificacion/DashboardClasificacion.css'

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
    <Row className="g-3 mb-3">
      {estadisticas.map(({ etiqueta, valor, icon: Icono }) => (
        <Col xs={6} lg={3} key={etiqueta}>
          <Card className="dc-stat h-100">
            <Card.Body>
              <div className="dc-stat__etiqueta">
                <Icono size={14} aria-hidden="true" />
                {etiqueta}
              </div>
              <div className="dc-stat__valor">{valor}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}

      <Col xs={6} lg={3}>
        <Card className="dc-stat h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="dc-stat__etiqueta">Progreso</span>
              <strong>{progreso}%</strong>
            </div>
            <ProgressBar now={progreso} variant="success" style={{ height: 6 }} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default EstadisticasClasificacion