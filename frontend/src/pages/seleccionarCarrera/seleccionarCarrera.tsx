
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Spinner,
  Stack,
  Container,
  Row,
  Col,
} from "react-bootstrap";

import { Flag } from "lucide-react";

import type { Carrera } from "../../types/carrera";
import { useCarrera } from "../../context/CarreraContext";
import { useSeleccionarCarrera } from "../../context/SeleccionarCarreraContext";

import CarreraSeleccionCard from "./components/CarreraSeleccionCard";
import CarreraFiltros from "./components/CarreraFiltros";

import {
  ESTADOS_ORDENADOS,
  type EstadoCarrera,
} from "./components/CarreraEstadoBadge";

// Funciones auxiliares
const timestampDe = (carrera: Carrera) =>
  new Date(carrera.fechaHoraCarrera).getTime();

const anioDe = (carrera: Carrera) =>
  new Date(carrera.fechaHoraCarrera).getFullYear();

// Búsqueda sin distinguir mayúsculas ni tildes
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const SeleccionarCarrera = () => {
  const { cargando, error, getCarreras } = useCarrera();

  const {
    carreraSeleccionada,
    seleccionarCarrera,
  } = useSeleccionarCarrera();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [busqueda, setBusqueda] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEstado, setFiltroEstado] =
    useState<EstadoCarrera | "">("");

  // Obtener carreras
  const carreras = useMemo(
    () => getCarreras(),
    [getCarreras]
  );

  // Obtener la carrera más reciente
  const carreraReciente = useMemo(
    () =>
      carreras.length > 0
        ? carreras.reduce((a, b) =>
            timestampDe(b) > timestampDe(a) ? b : a
          )
        : null,
    [carreras]
  );

  // Excluir la carrera más reciente
  const otrasCarreras = useMemo(
    () =>
      carreras.filter(
        (c) => c.id !== carreraReciente?.id
      ),
    [carreras, carreraReciente]
  );

  // Años disponibles
  const aniosDisponibles = useMemo(
    () =>
      [...new Set(otrasCarreras.map(anioDe))]
        .sort((a, b) => b - a),
    [otrasCarreras]
  );

  // Estados disponibles
  const estadosDisponibles = useMemo(
    () =>
      ESTADOS_ORDENADOS.filter((estado) =>
        otrasCarreras.some(
          (c) => c.estado === estado
        )
      ),
    [otrasCarreras]
  );

  // Filtrar y ordenar carreras
  const carrerasFiltradas = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    return otrasCarreras
      .filter(
        (c) =>
          !texto ||
          normalizar(c.nombre).includes(texto)
      )
      .filter(
        (c) =>
          !filtroAnio ||
          anioDe(c) === Number(filtroAnio)
      )
      .filter(
        (c) =>
          !filtroEstado ||
          c.estado === filtroEstado
      )
      .sort(
        (a, b) =>
          timestampDe(b) - timestampDe(a)
      );
  }, [
    otrasCarreras,
    busqueda,
    filtroAnio,
    filtroEstado,
  ]);

  // Continuar con la carrera seleccionada
  const continuarConCarrera = (carrera: Carrera) => {
    seleccionarCarrera(carrera);

    const seccion = pathname.split("/")[2];

    navigate(`/clasificador/${seccion}`);
  };

  // Estado de carga
  if (cargando) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">
              Cargando carreras...
            </span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: "1000px" }}>

      {/* HEADER */}
      <Row className="mb-4">
        <Col>
          <h1 className="h3 fw-bold text-dark mb-2">
            Seleccionar carrera
          </h1>

          <p className="text-secondary mb-0">
            Elija la carrera que desea gestionar
            para continuar con esta sección.
          </p>
        </Col>
      </Row>

      {/* ERROR */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading className="h6">
            Error al cargar las carreras
          </Alert.Heading>

          No se pudieron cargar las carreras.

          {typeof error === "string"
            ? ` ${error}`
            : ""}
        </Alert>
      )}

      {/* SIN CARRERAS */}
      {!error && carreras.length === 0 && (
        <Alert variant="info">
          Todavía no hay carreras creadas.
        </Alert>
      )}

      {/* CARRERA MÁS RECIENTE */}
      {carreraReciente && (
        <section className="mb-5">

          <div className="d-flex align-items-center gap-2 mb-3">
            <Flag size={18} className="text-success" />

            <h2 className="h5 fw-bold mb-0">
              Carrera más reciente
            </h2>
          </div>

          <CarreraSeleccionCard
            destacada
            carrera={carreraReciente}
            seleccionada={
              carreraSeleccionada?.id === carreraReciente.id
            }
            onSeleccionar={seleccionarCarrera}
            onContinuar={continuarConCarrera}
          />

        </section>
      )}

      {/* OTRAS CARRERAS */}
      {otrasCarreras.length > 0 && (
        <section>

          {/* DIVISOR */}
          <div className="d-flex align-items-center gap-3 my-4">
            <hr className="flex-grow-1" />

            <span className="text-secondary small text-nowrap">
              O seleccione otra carrera
            </span>

            <hr className="flex-grow-1" />
          </div>

          {/* ENCABEZADO Y FILTROS */}
          <Row className="align-items-center g-3 mb-3">

            <Col xs={12} md>
              <h2 className="h5 fw-bold mb-0">
                Otras carreras
              </h2>
            </Col>

            <Col xs={12} md="auto">
              <CarreraFiltros
                busqueda={busqueda}
                anio={filtroAnio}
                estado={filtroEstado}
                anios={aniosDisponibles}
                estados={estadosDisponibles}
                onBusquedaChange={setBusqueda}
                onAnioChange={setFiltroAnio}
                onEstadoChange={setFiltroEstado}
              />
            </Col>

          </Row>

          {/* LISTADO */}
          {carrerasFiltradas.length === 0 ? (
            <Alert variant="light" className="border">
              No se encontraron carreras con los
              filtros aplicados.
            </Alert>
          ) : (
            <Stack gap={3}>
              {carrerasFiltradas.map((carrera) => (
                <CarreraSeleccionCard
                  key={carrera.id}
                  carrera={carrera}
                  seleccionada={
                    carreraSeleccionada?.id === carrera.id
                  }
                  onSeleccionar={seleccionarCarrera}
                  onContinuar={continuarConCarrera}
                />
              ))}
            </Stack>
          )}

        </section>
      )}

    </Container>
  );
};

export default SeleccionarCarrera;
