import { Navigate } from 'react-router-dom';
import { useCarreraSeleccion, type SeccionClasificador } from '../../context/SeleccionarCarreraContext';

export function SeccionRedirect({ seccion }: { seccion: SeccionClasificador }) {
  const { obtenerCarrera } = useCarreraSeleccion();
  const carreraGuardada = obtenerCarrera(seccion);

  if (carreraGuardada) {
    //Si ya se había elegido una carrera en esta sección, te redirijo a ella
    return <Navigate to={`${carreraGuardada}`} replace />;
  }

  //Sino, te redirijo a seleccionar
  return <Navigate to="seleccionar-carrera" replace />;
}
