// frontend/src/hooks/useCarreraActual.ts
import { useLocation, useParams } from 'react-router-dom';
import { useCarrera } from '../context/CarreraContext';
import { useCarreraSeleccion, type SeccionClasificador } from '../context/SeleccionarCarreraContext';
import type { Carrera } from '../types/carrera';

const seccionesValidas: SeccionClasificador[] = [
  'entrega-kits',
  'clasificaciones',
  'resultados',
];

function detectarSeccionDesdePath(pathname: string): SeccionClasificador | null {
  return seccionesValidas.find((sec) => pathname.includes(sec)) ?? null;
}

export function useCarreraActual(seccion?: SeccionClasificador): Carrera | null {
  const { getCarreraById } = useCarrera();
  const { obtenerIdCarrera } = useCarreraSeleccion();
  const { id: paramId } = useParams();
  const { pathname } = useLocation();

  const seccionActiva = seccion ?? detectarSeccionDesdePath(pathname);
  const carreraId = (seccionActiva ? obtenerIdCarrera(seccionActiva) : null) ?? paramId ?? null;

  if (!carreraId) return null;
  return getCarreraById(carreraId) ?? null;
}