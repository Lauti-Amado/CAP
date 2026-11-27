import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useCarrera } from '../../context/CarreraContext';
import { useCarreraSeleccion, type SeccionClasificador } from '../../context/SeleccionarCarreraContext';
import { slugCarrera } from '../../utils/carrera';
import type { Carrera } from '../../types/carrera';

function obtenerSlugCarrera(carrera: Carrera): string {
  return slugCarrera(
    `${carrera.nombre} ${new Date(carrera.fechaHoraCarrera).getFullYear().toString()}`
  );
}

export function SeccionRedirect({ seccion }: { seccion: SeccionClasificador }) {
  const { carreras, cargando, getCarreraById } = useCarrera();
  const { obtenerIdCarrera, guardarCarrera } = useCarreraSeleccion();
  const navigate = useNavigate();

  const idCarreraGuardada = obtenerIdCarrera(seccion);
  const carreraGuardada = idCarreraGuardada ? getCarreraById(idCarreraGuardada) : undefined;

  const carreraEntregaKits =
    !cargando && !carreraGuardada
      ? carreras.find((c) => c.estado === 'Entrega_kits')
      : undefined;

  useEffect(() => {
    if (!carreraEntregaKits) return;

    guardarCarrera(seccion, carreraEntregaKits);
    navigate(`/clasificador/${seccion}/${obtenerSlugCarrera(carreraEntregaKits)}`, {
      replace: true,
    });
  }, [carreraEntregaKits, guardarCarrera, navigate, seccion]);

  if (cargando || carreraEntregaKits) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando carreras...</span>
          </Spinner>
        </div>
      </Container>
    );
  }
  
  //Si ya se habia elegido una carrera en esta seccion, te redirijo a ella
  if (carreraGuardada) return <Navigate to={obtenerSlugCarrera(carreraGuardada)} replace />;

  //Sino, te redirijo a seleccionar una
  return <Navigate to="seleccionar-carrera" replace />;
}
