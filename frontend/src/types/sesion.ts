import type { Usuario } from "./usuario";

export interface Sesion {
  usuario: Usuario;
  token: string;
}

export interface Credenciales {
  email: string;
  password: string;
}