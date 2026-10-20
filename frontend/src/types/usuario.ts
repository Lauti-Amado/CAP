export type Sexo = "Masculino" | "Femenino";
export type Rol = "Administrador" | "Tesorero" | "Clasificador";
export type Discapacidad = "Discapacidad_general" | "Discapacidad_silla" | "Discapacidad_visual"

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
  fechaNacimiento: Date
  sexo: Sexo;
  discapacidad?: Discapacidad | null;
}