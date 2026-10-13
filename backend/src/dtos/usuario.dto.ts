import { Rol, Sexo, Discapacidad } from "../generated/prisma/client";

export type PayloadToken = { 
  id: string; 
  roles: Rol[];
};

export type Usuario = { 
  id: string; 
  email: string;
  roles: Rol[]
  persona: Persona;
};

export type Persona = {
  id: string;
  nombre: string; 
  apellido: string;
  telefono: string;
  dni: string;
  corredor?: Corredor | null;
}

export type Corredor = {
  id: string;
  fechaNacimiento: Date
  sexo: Sexo;
  discapacidad?: Discapacidad | null;
}