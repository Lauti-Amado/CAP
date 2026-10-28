import { Form, InputGroup, Stack } from "react-bootstrap";
import { Search } from "lucide-react";

import { ESTADOS, type EstadoCarrera } from "./carreraEstadoBadge"

interface Props {
  busqueda: string;
  anio: string;
  estado: EstadoCarrera | "";
  anios: number[];
  estados: EstadoCarrera[];
  onBusquedaChange: (valor: string) => void;
  onAnioChange: (valor: string) => void;
  onEstadoChange: (valor: EstadoCarrera | "") => void;
}

export default function CarreraFiltros({
  busqueda,
  anio,
  estado,
  anios,
  estados,
  onBusquedaChange,
  onAnioChange,
  onEstadoChange,
}: Props) {
  return (
    <Stack direction="horizontal" gap={2} className="sc-filtros">
      <InputGroup className="sc-filtro-busqueda">
        <InputGroup.Text>
          <Search aria-hidden />
        </InputGroup.Text>
        <Form.Control
          type="search"
          placeholder="Buscar carrera por nombre"
          aria-label="Buscar carrera por nombre"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </InputGroup>

      <Form.Select
        aria-label="Filtrar por año"
        value={anio}
        onChange={(e) => onAnioChange(e.target.value)}
      >
        <option value="">Todos los años</option>
        {anios.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </Form.Select>

      <Form.Select
        aria-label="Filtrar por estado"
        value={estado}
        onChange={(e) => onEstadoChange(e.target.value as EstadoCarrera | "")}
      >
        <option value="">Todos los estados</option>
        {estados.map((e) => (
          <option key={e} value={e}>
            {ESTADOS[e].etiqueta}
          </option>
        ))}
      </Form.Select>
    </Stack>
  );
}