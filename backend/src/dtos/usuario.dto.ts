import { Rol, Sexo, Discapacidad } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";

export function toUsuarioDto(usuario: UsuarioPrisma): UsuarioDTO {
  return {
    id: usuario.id,
    email: usuario.email,
    roles: usuario.roles.map(r => r.rolAdministrativo.rol),
    persona: {
      id: usuario.persona.id,
      nombre: usuario.persona.nombre,
      apellido: usuario.persona.apellido,
      telefono: usuario.persona.telefono,
      dni: usuario.persona.dni,
      corredor: usuario.persona.corredor ? {
        id: usuario.persona.corredor.id,
        fechaNacimiento: usuario.persona.corredor.fechaNacimiento,
        sexo: usuario.persona.corredor.sexo,
        discapacidad: usuario.persona.corredor.discapacidad,
        contactoEmergencia: {
          dni: usuario.persona.corredor.contactoEmergencia.dni,
          nombre: usuario.persona.corredor.contactoEmergencia.nombre,
          apellido: usuario.persona.corredor.contactoEmergencia.apellido,
          telefono: usuario.persona.corredor.contactoEmergencia.telefono,
        },
        aptosMedicos: usuario.persona.corredor.aptosMedicos ? usuario.persona.corredor.aptosMedicos : null,
        afiliacion: usuario.persona.corredor.afiliacion ? usuario.persona.corredor.afiliacion : null
      } : null
    }
  }
}


export type UsuarioPrisma = Prisma.UsuarioGetPayload<{
  include: {
    roles: { include: { rolAdministrativo: true } },
    persona: { include: { corredor: { include: { contactoEmergencia: true, aptosMedicos: true, afiliacion: true } } } }
  },
  omit:
  { passwordHash: true },

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
  fechaNacimiento: Date;
  sexo: Sexo;
  discapacidad?: Discapacidad | null;
  contactoEmergencia: ContactoEmergenciaDTO;
  aptosMedicos?: AptoMedicoDTO[] | null;
  afiliacion?: AfiliacionDTO | null
}

export type ContactoEmergenciaDTO = {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export type AptoMedicoDTO = {
  aprobado: boolean;
  fechaVencimiento: Date;
}

export type AfiliacionDTO = {
  numeroSocio: number;
}