// src/context/CarreraSeccionesContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

export type SeccionClasificador = 'entrega-kits' | 'clasificaciones' | 'resultados';

interface CarreraSeccionesContextType {
  obtenerCarrera: (seccion: SeccionClasificador) => string | null;
  guardarCarrera: (seccion: SeccionClasificador, carrera: string) => void;
  limpiarCarrera: (seccion: SeccionClasificador) => void;
}

const CarreraSeleccionContext = createContext<CarreraSeccionesContextType | null>(null);

export function CarreraSeleccionProvider({ children }: { children: ReactNode }) {
  const [selecciones, setSelecciones] = useState<Record<string, string>>(() => {
    try {
      const guardado = sessionStorage.getItem('cap_carreras_secciones');
      return guardado ? JSON.parse(guardado) : {};
    } catch {
      return {};
    }
  });

  const guardarCarrera = (seccion: SeccionClasificador, carrera: string) => {
    setSelecciones((prev) => {
      const nuevo = { ...prev, [seccion]: carrera };
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

  const obtenerCarrera = (seccion: SeccionClasificador) => {
    return selecciones[seccion] || null;
  };

  return (
    <CarreraSeleccionContext.Provider value={{ obtenerCarrera, guardarCarrera, limpiarCarrera }}>
      {children}
    </CarreraSeleccionContext.Provider>
  );
}

export const useCarreraSeleccion = () => {
  const ctx = useContext(CarreraSeleccionContext);
  if (!ctx) throw new Error('useCarreraSecciones debe usarse dentro de CarreraSeccionesProvider');
  return ctx;
};