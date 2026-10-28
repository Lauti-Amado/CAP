import type { ReactNode } from "react";
import { Button, Card, Stack } from "react-bootstrap";
import {
  ArrowRight,
  Calendar,
  CircleCheck,
  MapPin,
  Route,
  type LucideIcon,
} from "lucide-react";

import type { Carrera } from "../../../types/carrera";
import CarreraEstadoBadge from "./carreraEstadoBadge";

interface Props {
  carrera: Carrera;
  seleccionada?: boolean;
  destacada?: boolean;
  onSeleccionar: (carrera: Carrera) => void;
  onContinuar: (carrera: Carrera) => void;
}

const formatearFecha = (fecha: Date) =>
  new Date(fecha).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatearDistancias = (distancias: Carrera["distancias"]) => {
  if (distancias.length === 0) return "Sin distancias";
  const kilometrajes = [...new Set(distancias.map((d) => d.kilometraje))].sort((a, b) => a - b);
  return kilometrajes.map((km) => `${km} km`).join(" · ");
};

function Detalle({ icono: Icono, children }: { icono: LucideIcon; children: ReactNode }) {
  return (
    <span className="sc-detalle">
      <Icono aria-hidden /> {children}
    </span>
  );
}

export default function CarreraSeleccionCard({
  carrera,
  seleccionada = false,
  destacada = false,
  onSeleccionar,
  onContinuar,
}: Props) {
  const clases = [
    "sc-card",
    destacada && "sc-card--destacada",
    seleccionada && "sc-card--seleccionada",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className={clases}>
      <Card.Body>
        <Stack direction="horizontal" gap={3} className="sc-card-contenido">
          <Stack gap={2} className="sc-card-info">
            <div className="sc-card-encabezado">
              <Card.Title as="h3" className="sc-card-titulo">
                {carrera.nombre}
              </Card.Title>
              <CarreraEstadoBadge estado={carrera.estado} />
              {seleccionada && (
                <span className="sc-seleccionada-tag">
                  <CircleCheck aria-hidden /> Carrera seleccionada
                </span>
              )}
            </div>

            <div className="sc-detalles">
              <Detalle icono={Route}>{formatearDistancias(carrera.distancias)}</Detalle>
              <Detalle icono={Calendar}>{formatearFecha(carrera.fechaHoraCarrera)}</Detalle>
              <Detalle icono={MapPin}>
                {carrera.lugar.nombre}, {carrera.lugar.localidad}
              </Detalle>
            </div>

            {destacada && carrera.descripcion && (
              <Card.Text className="sc-card-descripcion">{carrera.descripcion}</Card.Text>
            )}
          </Stack>

          {destacada ? (
            <Button
              variant="success"
              className="sc-btn sc-btn-primary"
              onClick={() => onContinuar(carrera)}
            >
              Gestionar carrera <ArrowRight aria-hidden />
            </Button>
          ) : seleccionada ? (
            <Button
              variant="success"
              className="sc-btn sc-btn-primary"
              onClick={() => onContinuar(carrera)}
            >
              Continuar <ArrowRight aria-hidden />
            </Button>
          ) : (
            <Button
              variant="outline-success"
              className="sc-btn sc-btn-outline"
              onClick={() => onSeleccionar(carrera)}
            >
              Seleccionar
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}