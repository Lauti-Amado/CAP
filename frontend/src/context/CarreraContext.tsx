import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from 'react';

import type { Carrera } from "../types/carrera";

import { apiFetch } from "../services/apiService";


interface CarreraContextType {
    cargando: boolean;
    error: string | undefined;

    getCarreras: (anio?: number) => Carrera[];
    getCarreraById: (id: string) => Carrera | undefined;
}

const CarreraContext = createContext<CarreraContextType | null>(null);

export function CarreraProvider({ children }: { children: ReactNode }) {

    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | undefined>()

    //Al empezar, fetchea carreras
    useEffect(() => {
        apiFetch<{ carreras: Carrera[] }>('/carreras')
            .then((data) => setCarreras(data.carreras))
            .catch((err) => {
                setCarreras([]);
                setError(err instanceof Error ? err.message : "Ocurrió un error al cargar las carreras");
            })
            .finally(() => setCargando(false));
    }, []);


                //FUNCIONES

    //getCarrerras por año / todas (si no se especifica año)
    const getCarreras = useCallback((anio?: number) => {
        if (!anio) return carreras;
        return carreras.filter(c => new Date(c.fechaHoraCarrera).getFullYear() === anio);
    }, [carreras]);

    //getCarreraById
    const getCarreraById = useCallback((id: string) => {
        return carreras.find(c => c.id === id);
    }, [carreras]);

    const contextValue = useMemo(() => ({
        cargando,
        error,
        getCarreras,
        getCarreraById
    }), [cargando, error, getCarreras, getCarreraById]);

    return (
        <CarreraContext.Provider value={contextValue}>
            {children}
        </CarreraContext.Provider>
    );

}

// hook para consumirlo
export function useCarrera() {
    const contexto = useContext(CarreraContext);
    if (!contexto) throw new Error('useCarrera debe usarse dentro de <CarreraProvider>');
    return contexto;
}