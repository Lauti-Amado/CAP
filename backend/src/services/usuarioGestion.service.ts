//backend/src/services/usuarioGestion.service.ts
import { prisma } from "../config/prisma";
import type { Prisma, Rol } from "../generated/prisma/client";
import { ErrorQuitarPropioAdministrador } from "../errors/quitarPropioAdministrador.error";
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

//Reemplaza los roles gestionables de un usuario, tocando solo los que cambian
export async function actualizarRoles(id: string, rolesNuevos: Rol[], solicitanteId: string): Promise<UsuarioGestionDTO> {
    const usuario = await prisma.usuario.findUnique({ where: { id }, include });
    if (!usuario) throw new ErrorNoEncontrado();

    const deseados = new Set(rolesNuevos);
    if (id === solicitanteId && !deseados.has("Administrador")) {
        throw new ErrorQuitarPropioAdministrador();
    }

    //Solo se miran los roles gestionables: otros (ej. Tesorero) se respetan
    const actuales = usuario.roles.filter(ur => ROLES_GESTIONABLES.includes(ur.rolAdministrativo.rol));
    const rolesActuales = new Set(actuales.map(ur => ur.rolAdministrativo.rol));

    const aQuitar = actuales.filter(ur => !deseados.has(ur.rolAdministrativo.rol));
    const aAgregar = [...deseados].filter(rol => !rolesActuales.has(rol));

    await prisma.$transaction(async (tx) => {
        if (aQuitar.length > 0) {
            await tx.usuarioRol.deleteMany({ where: { id: { in: aQuitar.map(ur => ur.id) } } });
        }
        if (aAgregar.length > 0) {
            const rolesAdministrativos = await tx.rolAdministrativo.findMany({ where: { rol: { in: aAgregar } } });
            await tx.usuarioRol.createMany({
                data: rolesAdministrativos.map(ra => ({ usuarioId: id, rolAdministrativoId: ra.id })),
            });
        }
    });

    return obtener(id);
}