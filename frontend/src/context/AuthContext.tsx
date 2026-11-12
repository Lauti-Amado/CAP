//frontend/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from 'react';

import type { Credenciales, CredencialesContingencia } from "../types/sesion";
import type { Usuario, Rol } from "../types/usuario";

import { apiFetch } from "../services/apiService";


interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  estaAutenticado: boolean;
  tieneRol: (rol: Rol) => boolean;
  login: (credenciales: Credenciales) => Promise<void>;
  loginContingencia: (datos: CredencialesContingencia) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }){

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);

    //Al iniciar la sesión, checkea si el usuario ya tenía una cookie válida
    useEffect(() => {
        apiFetch<Usuario>('/auth/yo')
            .then((usuario) => setUsuario(usuario))
            .catch(() => setUsuario(null))
            .finally(() => setCargando(false));
    }, []);


            //FUNCIONES DE AUTH

    //Login: le pedimos al server que nos mande la session cookie
    const login = async (credenciales: Credenciales) => {
        const usuarioFetch = await apiFetch<Usuario>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credenciales)
        });

        setUsuario(usuarioFetch);
    };

    //Login de contingencia: email + clave de respaldo de uso único
    const loginContingencia = async (datos: CredencialesContingencia) => {
        const usuarioFetch = await apiFetch<Usuario>('/auth/contingencia', {
            method: 'POST',
            body: JSON.stringify(datos)
        });

        setUsuario(usuarioFetch);
    };

    //Logout: le pedimos al server que destruya la session cookie
    const logout = async () => {
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        } finally {
            setUsuario(null);
        }
    };

    //checkea sesión expirada
    useEffect(() => {
        window.addEventListener('sesion-expirada', logout);
        return () => window.removeEventListener('sesion-expirada', logout);
    }, []);

  return (
    <AuthContext.Provider 
        value={{ 
            usuario, 
            cargando, 
            estaAutenticado: usuario !== null, 
            tieneRol: (rol: Rol) => usuario?.roles.some(r => r === rol) ?? false,
            login, 
            loginContingencia,
            logout 
        }}>

      {children}

    </AuthContext.Provider>
  );

}

// hook para consumirlo
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}