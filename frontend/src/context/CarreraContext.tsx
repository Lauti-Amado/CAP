//frontend/src/context/CarreraContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Carrera } from "../types/carrera";

import { apiFetch } from "../services/apiService";
import { Outlet } from "react-router-dom";


interface CarreraContextType {
    carreras: Carrera[]

    cargando: boolean;
    error: string | undefined;

    getCarreras: (anio?: number) => Carrera[];
    getCarreraById: (id: string) => Carrera | undefined;
    recargar: () => Promise<void>; 
}

const CarreraContext = createContext<CarreraContextType | null>(null);

export function CarreraProvider() {

    const [carrerasRec, setCarrerasRec] = useState<Carrera[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | undefined>()

    // La carga se extrae para poder repetirla (recargar)
    const cargar = useCallback(async () => {
        try {
            setCarrerasRec(await apiFetch<Carrera[]>('/carreras'));
            setError(undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error al cargar las carreras");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargar();
    }, [cargar]);


                //FUNCIONES

    //getCarrerras por año / todas (si no se especifica año)
    const getCarreras = useCallback((anio?: number) => {
        if (!anio) return carrerasRec;
        return carrerasRec.filter(c => new Date(c.fechaHoraCarrera).getFullYear() === anio);
    }, [carrerasRec]);

    //getCarreraById
    const getCarreraById = useCallback((id: string) => {
        return carrerasRec.find(c => c.id === id);
    }, [carrerasRec]);

        const contextValue = useMemo(() => ({
        carreras: carrerasRec,
        cargando,
        error,
        getCarreras,
        getCarreraById,
        recargar: cargar
    }), [carrerasRec, cargando, error, getCarreras, getCarreraById, cargar]);

    return (
        <CarreraContext.Provider value={contextValue}>
            <Outlet />
        </CarreraContext.Provider>
    );

}

// hook para consumirlo
export function useCarrera() {
    const contexto = useContext(CarreraContext);
    if (!contexto) throw new Error('useCarrera debe usarse dentro de <CarreraProvider>');
    return contexto;
}