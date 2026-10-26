//frontend/src/components/corredor/TarjetasCorredor.tsx
import { Badge, Card } from 'react-bootstrap'
import { BadgeCheck, Banknote, UserRound } from 'lucide-react'
import type { EstadoVerificacion } from '../../types/entregaKits'
import './DetalleCorredor.css'

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

function TarjetasCorredor({
  nombre,
  dni,
  categoria,
  distancia,
  talleRemera,
  clubTeam,
  estadoInscripcion,
  estadoAptoMedico,
}: TarjetasCorredorProps) {
  return (
    <div className="detalle-corredor__columna-izquierda">
      {/* DATOS DEL CORREDOR */}
      <Card className="detalle-corredor__tarjeta corredor">
        <Card.Body>
          <div className="detalle-corredor__avatar">
            <UserRound size={30} strokeWidth={2} />
          </div>

          <h2>{nombre}</h2>

          <p className="detalle-corredor__dni">DNI: {dni}</p>

          <div className="detalle-corredor__separador" />

          <div className="detalle-corredor__datos">
            <div>
              <span>CATEGORÍA</span>
              <strong>{categoria}</strong>
            </div>

            <div>
              <span>DISTANCIA</span>
              <strong>{distancia}</strong>
            </div>

            <div>
              <span>TALLE REMERA</span>
              <strong>{talleRemera || '—'}</strong>
            </div>

            <div>
              <span>CLUB/TEAM</span>
              <strong>{clubTeam || '—'}</strong>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ESTADO DE PAGO */}
      <Card className="detalle-corredor__tarjeta pago">
        <Card.Body>
          <div className="detalle-corredor__titulo-pago">
            <span className="detalle-corredor__icono-pago">
              <Banknote size={19} strokeWidth={2.2} />
            </span>

            <strong>ESTADO DE PAGO</strong>
          </div>

          <div className="detalle-corredor__estado">
            <span>Inscripción</span>

            {estadoInscripcion === 'pagado' ? (
              <Badge bg="success">
                <BadgeCheck size={12} />
                PAGADO
              </Badge>
            ) : (
              <Badge bg="warning" text="dark">
                PENDIENTE
              </Badge>
            )}
          </div>

          {estadoAptoMedico && (
            <div className="detalle-corredor__estado">
              <span>Apto Médico</span>

              {estadoAptoMedico === 'verificado' ? (
                <Badge bg="success">
                  <BadgeCheck size={12} />
                  VERIFICADO
                </Badge>
              ) : (
                <Badge bg="warning" text="dark">
                  PENDIENTE
                </Badge>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default TarjetasCorredor