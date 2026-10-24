import { Rol, Sexo, Discapacidad } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";

export type TokenPayload = {
  id: string;
  roles: Rol[];
};

export type UsuarioPayload = {
  usuario: {
    id: string;
    email: string;
    roles: Rol[];
    persona: Persona;
  }
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


export type UsuarioPrisma = Prisma.UsuarioGetPayload<{
  include: {
    roles: { include: { rolAdministrativo: true } },
    persona: { include: { corredor: true } }
  },
  omit: { passwordHash: true }
}>;

export function UsuarioDTOMap(usuario: UsuarioPrisma): UsuarioPayload {
  return {
    usuario: {
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles.map(r => r.rolAdministrativo.rol),
      persona: usuario.persona
    }
  }
}