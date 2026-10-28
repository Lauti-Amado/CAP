import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Spinner, Stack } from "react-bootstrap";

import type { Carrera } from "../../types/carrera";
import { useCarrera } from "../../context/CarreraContext";
import { useSeleccionarCarrera } from "../../context/SeleccionarCarreraContext";

import CarreraSeleccionCard from "./components/CarreraSeleccionCard";
import CarreraFiltros from "./components/CarreraFiltros";
import { ESTADOS_ORDENADOS, type EstadoCarrera } from "./components/carreraEstadoBadge";

import "./seleccionarCarrera.css";

const timestampDe = (carrera: Carrera) => new Date(carrera.fechaHoraCarrera).getTime();
const anioDe = (carrera: Carrera) => new Date(carrera.fechaHoraCarrera).getFullYear();

// Búsqueda sin distinguir mayúsculas ni tildes
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const SeleccionarCarrera = () => {
  const { cargando, error, getCarreras } = useCarrera();
  const { carreraSeleccionada, seleccionarCarrera } = useSeleccionarCarrera();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [busqueda, setBusqueda] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoCarrera | "">("");

  const carreras = useMemo(() => getCarreras(), [getCarreras]);

  // La carrera más reciente por fecha de realización, como acceso rápido
  const carreraReciente = useMemo(
    () =>
      carreras.length > 0
        ? carreras.reduce((a, b) => (timestampDe(b) > timestampDe(a) ? b : a))
        : null,
    [carreras]
  );

  const otrasCarreras = useMemo(
    () => carreras.filter((c) => c.id !== carreraReciente?.id),
    [carreras, carreraReciente]
  );

  const aniosDisponibles = useMemo(
    () => [...new Set(otrasCarreras.map(anioDe))].sort((a, b) => b - a),
    [otrasCarreras]
  );

  const estadosDisponibles = useMemo(
    () => ESTADOS_ORDENADOS.filter((e) => otrasCarreras.some((c) => c.estado === e)),
    [otrasCarreras]
  );

  const carrerasFiltradas = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    return otrasCarreras
      .filter((c) => !texto || normalizar(c.nombre).includes(texto))
      .filter((c) => !filtroAnio || anioDe(c) === Number(filtroAnio))
      .filter((c) => !filtroEstado || c.estado === filtroEstado)
      .sort((a, b) => timestampDe(b) - timestampDe(a));
  }, [otrasCarreras, busqueda, filtroAnio, filtroEstado]);

  // Guarda la carrera y vuelve a la raíz de la sección: el provider
  // redirige desde ahí a la carrera seleccionada.
  const continuarConCarrera = (carrera: Carrera) => {
    seleccionarCarrera(carrera);
    const seccion = pathname.split("/")[2];
    navigate(`/clasificador/${seccion}`);
  };

  if (cargando) {
    return (
      <div className="sc-page sc-estado">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="sc-page">
      <header className="sc-header">
        <h1>Seleccionar carrera</h1>
        <p>Elija la carrera que desea gestionar para continuar con esta sección.</p>
      </header>

      {error && (
        <Alert variant="danger">
          No se pudieron cargar las carreras.
          {typeof error === "string" ? ` ${error}` : ""}
        </Alert>
      )}

      {!error && carreras.length === 0 && (
        <Alert variant="info">Todavía no hay carreras creadas.</Alert>
      )}

      {carreraReciente && (
        <section className="sc-section">
          <h2>Carrera más reciente</h2>
          <CarreraSeleccionCard
            destacada
            carrera={carreraReciente}
            seleccionada={carreraSeleccionada?.id === carreraReciente.id}
            onSeleccionar={seleccionarCarrera}
            onContinuar={continuarConCarrera}
          />
        </section>
      )}

      {otrasCarreras.length > 0 && (
        <>
          <div className="sc-divider">
            <span>o seleccione otra carrera</span>
          </div>

          <section className="sc-section">
            <div className="sc-section-encabezado">
              <h2>Otras carreras</h2>
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
            </div>

            {carrerasFiltradas.length === 0 ? (
              <Alert variant="light">No se encontraron carreras con los filtros aplicados.</Alert>
            ) : (
              <Stack gap={3}>
                {carrerasFiltradas.map((carrera) => (
                  <CarreraSeleccionCard
                    key={carrera.id}
                    carrera={carrera}
                    seleccionada={carreraSeleccionada?.id === carrera.id}
                    onSeleccionar={seleccionarCarrera}
                    onContinuar={continuarConCarrera}
                  />
                ))}
              </Stack>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default SeleccionarCarrera;