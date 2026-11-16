//frontend/src/components/corredor/TarjetasCorredor.tsx
import type { ReactNode } from 'react'
import { Badge, Card, ListGroup } from 'react-bootstrap'
import { BadgeCheck, Banknote, UserRound } from 'lucide-react'
import type { EstadoVerificacion } from '../../types/entregaKits'

type TarjetasCorredorProps = {
  nombre: string
  dni: string
  categoria: string
  distancia: string
  talleRemera?: string
  clubTeam?: string
  estadoInscripcion: EstadoVerificacion
  estadoAptoMedico?: EstadoVerificacion
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-start gap-3 px-0">
      <small className="text-secondary">{etiqueta}</small>
      <strong className="text-end text-break">{valor}</strong>
    </ListGroup.Item>
  )
}

function FilaEstado({ etiqueta, ok, textoOk }: { etiqueta: string; ok: boolean; textoOk: string }) {
  return (
    <div className="d-flex justify-content-between align-items-center bg-body-tertiary rounded p-2 mt-2">
      <span className="small">{etiqueta}</span>
      {ok ? (
        <Badge pill bg="success" className="d-inline-flex align-items-center gap-1">
          <BadgeCheck size={12} />
          {textoOk}
        </Badge>
      ) : (
        <Badge pill bg="warning" text="dark">PENDIENTE</Badge>
      )}
    </div>
  )
}

function TarjetasCorredor({
  nombre, dni, categoria, distancia, talleRemera, clubTeam, estadoInscripcion, estadoAptoMedico,
}: TarjetasCorredorProps) {
  return (
    <div className="d-flex flex-column gap-3 w-100">
      <Card className="shadow-sm">
        <Card.Body className="d-flex flex-column align-items-center">
          <span className="d-inline-flex rounded-circle bg-success-subtle text-success p-3 mb-2">
            <UserRound size={30} />
          </span>

          <h2 className="h5 fw-bold text-center text-break w-100 mb-1">{nombre}</h2>
          <p className="text-secondary text-center mb-3">DNI: {dni}</p>

          <ListGroup variant="flush" className="w-100 border-top">
            <Dato etiqueta="CATEGORÍA" valor={categoria} />
            <Dato etiqueta="DISTANCIA" valor={distancia} />
            <Dato etiqueta="TALLE REMERA" valor={talleRemera || '—'} />
            <Dato etiqueta="CLUB/TEAM" valor={clubTeam || '—'} />
          </ListGroup>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="d-inline-flex rounded-circle bg-success-subtle text-success p-2">
              <Banknote size={19} />
            </span>
            <strong className="small">ESTADO DE PAGO</strong>
          </div>

          <FilaEstado etiqueta="Inscripción" ok={estadoInscripcion === 'pagado'} textoOk="PAGADO" />

          {estadoAptoMedico && (
            <FilaEstado etiqueta="Apto Médico" ok={estadoAptoMedico === 'verificado'} textoOk="VERIFICADO" />
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default TarjetasCorredor