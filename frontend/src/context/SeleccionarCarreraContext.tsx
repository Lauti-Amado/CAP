import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import type { Carrera } from "../types/carrera";

import { useCarrera } from "./CarreraContext";
import { Spinner } from "react-bootstrap";

interface SeleccionarCarreraContextType {
    carreraSeleccionada: Carrera | null;
    seleccionarCarrera: (carrera: Carrera) => void;
}

const SeleccionarCarreraContext = createContext<SeleccionarCarreraContextType | null>(null);

const memoriaSecciones: Record<string, string> = {};

export function SeleccionarCarreraProvider() {
    const { cargando, carreras } = useCarrera(); 
    const [carreraSeleccionada, setCarreraSeleccionada] = useState<Carrera | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const previousPath = useRef(location.pathname);

    // useEffect para logica de redireccionar al seleccionar carrera
    useEffect(() => {
        if (cargando) return;

        const seccion = location.pathname.split('/')[2]; // Agarra la seccion seleccionada de la asidebar
        const basePath = `/clasificador/${seccion}`;
        
        const acabaDeEntrarASelector = 
            !previousPath.current.includes('/seleccionar-carrera') && 
            location.pathname.includes('/seleccionar-carrera');
        
        previousPath.current = location.pathname;

        if (acabaDeEntrarASelector) {
            if (carreraSeleccionada !== null) {
                setCarreraSeleccionada(null);
            }
            delete memoriaSecciones[seccion];
            return; 
        }

        const savedId = memoriaSecciones[seccion];
        let carreraListaParaUsar = carreraSeleccionada;

        // Reconciliar estado con la memoria RAM
        if (savedId) {
            if (carreraSeleccionada?.id !== savedId) {
                const savedCarrera = carreras.find(c => c.id === savedId);
                if (savedCarrera) {
                    setCarreraSeleccionada(savedCarrera);
                    carreraListaParaUsar = savedCarrera;
                }
            }
        } else if (carreraSeleccionada !== null) {
            setCarreraSeleccionada(null);
            carreraListaParaUsar = null;
        }

        // Acabas de clickear una seccion?
        if (location.pathname === basePath || location.pathname === `${basePath}/`) {
            // Si ya habias seleccionado carrera, te redirecciono a ella dentro de la seccion que clickeaste
            if (carreraListaParaUsar) {
                const nombreUrl = carreraListaParaUsar.nombre.toLowerCase().replace(/ /g, '-');
                navigate(`${basePath}/${nombreUrl}`, { replace: true });
            // Sino, te redirecciono a seleccionar una carrera
            } else {
                navigate(`${basePath}/seleccionar-carrera`, { replace: true });
            }
            return;
        }

        // Capa de proteccion para mandarlo automaticamente a seleccionar una carrera si se salteo el paso
        if (!carreraListaParaUsar && !location.pathname.includes('/seleccionar-carrera')) {
            navigate(`${basePath}/seleccionar-carrera`, { replace: true });
        }
        
    }, [cargando, carreras, carreraSeleccionada, location.pathname, navigate]);


    const seleccionarCarrera = useCallback((carrera: Carrera) => {
        const seccionActual = location.pathname.split('/')[2]; 
        
        setCarreraSeleccionada(carrera);
        memoriaSecciones[seccionActual] = carrera.id;
    }, [location.pathname]);

    const value = useMemo(() => ({ carreraSeleccionada, seleccionarCarrera }),
        [carreraSeleccionada, seleccionarCarrera]
    );

    return (
        <SeleccionarCarreraContext.Provider value={value}>
            {cargando ? <Spinner animation="border" /> : <Outlet />}
        </SeleccionarCarreraContext.Provider>
    );
}

export function useSeleccionarCarrera() {
    const context = useContext(SeleccionarCarreraContext);
    if (!context) throw new Error('useSeleccionarCarrera debe usarse dentro de <SeleccionarCarreraProvider>');
    return context;
}