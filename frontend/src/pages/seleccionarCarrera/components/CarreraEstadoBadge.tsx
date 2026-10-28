import type { Carrera } from "../../../types/carrera";
import { Badge } from "react-bootstrap";

export type EstadoCarrera = Carrera["estado"];
export type TonoEstado = "verde" | "gris" | "rojo";

export const ESTADOS: Record<EstadoCarrera, { etiqueta: string; tono: TonoEstado }> = {
  Creada: { etiqueta: "Creada", tono: "gris" },
  Publicada: { etiqueta: "Publicada", tono: "verde" },
  Activa: { etiqueta: "Activa", tono: "verde" },
  Entrega_kits: { etiqueta: "Entrega de kits", tono: "verde" },
  En_curso: { etiqueta: "En curso", tono: "verde" },
  Finalizada: { etiqueta: "Finalizada", tono: "gris" },
  Cancelada: { etiqueta: "Cancelada", tono: "rojo" },
};

export const ESTADOS_ORDENADOS = Object.keys(ESTADOS) as EstadoCarrera[];

interface Props {
  estado: EstadoCarrera;
}

export default function CarreraEstadoBadge({ estado }: Props) {
  const { etiqueta, tono } = ESTADOS[estado];

  return (
    <Badge pill className={`sc-badge sc-badge--${tono}`}>
      {etiqueta}
    </Badge>
  );
}