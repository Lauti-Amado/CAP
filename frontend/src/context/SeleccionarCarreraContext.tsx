// src/context/CarreraSeccionesContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

export type SeccionClasificador = 'entrega-kits' | 'clasificaciones' | 'resultados';

export interface CarreraGuardada {
  id: string;
  nombre: string;
}

interface CarreraSeccionesContextType {
  obtenerIdCarrera: (seccion: SeccionClasificador) => string | null;
  obtenerCarrera: (seccion: SeccionClasificador) => string | null;
  guardarCarrera: (seccion: SeccionClasificador, carrera: CarreraGuardada) => void;
  limpiarCarrera: (seccion: SeccionClasificador) => void;
}

const CarreraSeleccionContext = createContext<CarreraSeccionesContextType | null>(null);

export function CarreraSeleccionProvider({ children }: { children: ReactNode }) {
  const [selecciones, setSelecciones] = useState<Partial<Record<SeccionClasificador, CarreraGuardada | string>>>(() => {
    try {
      const guardado = sessionStorage.getItem('cap_carreras_secciones');
      return guardado ? JSON.parse(guardado) : {};
    } catch {
      return {};
    }
  });

  const guardarCarrera = (seccion: SeccionClasificador, carrera: CarreraGuardada) => {
    setSelecciones((prev) => {
      const nuevo = { ...prev, [seccion]: { id: carrera.id, nombre: carrera.nombre } };
      sessionStorage.setItem('cap_carreras_secciones', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const limpiarCarrera = (seccion: SeccionClasificador) => {
    setSelecciones((prev) => {
      const nuevo = { ...prev };
      delete nuevo[seccion];
      sessionStorage.setItem('cap_carreras_secciones', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const obtenerIdCarrera = (seccion: SeccionClasificador): string | null => {
    const item = selecciones[seccion];
    return item && typeof item === 'object' ? item.id : null;
  };

  const obtenerCarrera = (seccion: SeccionClasificador): string | null => {
    const item = selecciones[seccion];
    if (!item) return null;
    return typeof item === 'object' ? item.nombre : item;
  };

  return (
    <CarreraSeleccionContext.Provider value={{ obtenerIdCarrera, obtenerCarrera, guardarCarrera, limpiarCarrera }}>
      {children}
    </CarreraSeleccionContext.Provider>
  );
}

export const useCarreraSeleccion = () => {
  const ctx = useContext(CarreraSeleccionContext);
  if (!ctx) throw new Error('useCarreraSecciones debe usarse dentro de CarreraSeccionesProvider');
  return ctx;
};