import { Rol, Sexo, Discapacidad } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";

export function toUsuarioDto(usuario: UsuarioPrisma): UsuarioDTO {
  return {
    id: usuario.id,
    email: usuario.email,
    roles: usuario.roles.map(r => r.rolAdministrativo.rol),
    persona: usuario.persona
  }
}


export type UsuarioPrisma = Prisma.UsuarioGetPayload<{
  include: {
    roles: { include: { rolAdministrativo: true } },
    persona: { include: { corredor: true } }
  },
  omit: { passwordHash: true }
}>;


export type UsuarioDTO = {
  id: string;
  email: string;
  roles: Rol[];
  persona: PersonaDTO;
};

export type TokenPayload = {
  id: string;
  roles: Rol[];
};

export type PersonaDTO = {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  corredor?: CorredorDTO | null;
}

export type CorredorDTO = {
  id: string;
  fechaNacimiento: Date
  sexo: Sexo;
  discapacidad?: Discapacidad | null;
}