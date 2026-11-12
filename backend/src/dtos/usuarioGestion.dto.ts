//backend/src/dtos/usuarioGestion.dto.ts
import { Prisma } from "../generated/prisma/client";
import type { Rol, EstadoUsuario } from "../generated/prisma/client";

//Roles que este sistema administra (el resto, como Tesorero, se gestiona solo en la web)
export const ROLES_GESTIONABLES: Rol[] = ["Administrador", "Clasificador"];

export type UsuarioGestionPrisma = Prisma.UsuarioGetPayload<{
  include: { persona: true, roles: { include: { rolAdministrativo: true } } },
  omit: { passwordHash: true }
}>;

export type UsuarioGestionDTO = {
  id: string;
  nombre: string; //Nombre y apellido
  dni: string;
  correo: string;
  roles: Rol[];
  estado: EstadoUsuario;
};

export type PaginaUsuariosDTO = {
  datos: UsuarioGestionDTO[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

export function toUsuarioGestionDto(usuario: UsuarioGestionPrisma): UsuarioGestionDTO {
  return {
    id: usuario.id,
    nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
    dni: usuario.persona.dni,
    correo: usuario.email,
    roles: usuario.roles
      .map(ur => ur.rolAdministrativo.rol)
      .filter(rol => ROLES_GESTIONABLES.includes(rol)),
    estado: usuario.estado,
  };
}