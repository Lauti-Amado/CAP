//backend/src/services/usuarioGestion.service.ts
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { PaginaUsuariosDTO, ROLES_GESTIONABLES, UsuarioGestionDTO, toUsuarioGestionDto,} from "../dtos/usuarioGestion.dto";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";

const LIMITE_POR_PAGINA = 10;

const include = {
    persona: true,
    roles: { include: { rolAdministrativo: true } },
} satisfies Prisma.UsuarioInclude;

//Lista los usuarios del personal (Administradores y Clasificadores), paginados
export async function listar(pagina: number): Promise<PaginaUsuariosDTO> {
    const where: Prisma.UsuarioWhereInput = {
        roles: { some: { rolAdministrativo: { rol: { in: ROLES_GESTIONABLES } } } },
    };

    const [total, usuarios] = await prisma.$transaction([
        prisma.usuario.count({ where }),
        prisma.usuario.findMany({
            where,
            include,
            orderBy: [{ persona: { apellido: "asc" } }, { persona: { nombre: "asc" } }],
            skip: (pagina - 1) * LIMITE_POR_PAGINA,
            take: LIMITE_POR_PAGINA,
        }),
    ]);

    return {
        datos: usuarios.map(toUsuarioGestionDto),
        total,
        pagina,
        totalPaginas: Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA)),
    };
}

export async function obtener(id: string): Promise<UsuarioGestionDTO> {
    const usuario = await prisma.usuario.findUnique({ where: { id }, include });
    if (!usuario) throw new ErrorNoEncontrado();

    return toUsuarioGestionDto(usuario);
}