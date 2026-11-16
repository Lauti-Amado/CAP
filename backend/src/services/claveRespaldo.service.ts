//backend/src/services/claveRespaldo.service.ts
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import type { ClaveRespaldoDTO, CuentaClavesDTO } from "../dtos/claveRespaldo.dto";
import { cifrarClave, descifrarClave, generarClave, hashearClave } from "../utils/claveRespaldo.util";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";

const CLAVES_POR_CUENTA = 8;
const DIAS_HISTORIAL = 7;

const incluirUsos = { _count: { select: { usos: true } } } satisfies Prisma.ClaveRespaldoInclude;
type ClaveConUsos = Prisma.ClaveRespaldoGetPayload<{ include: typeof incluirUsos }>;

//Cuentas que pueden usar claves: clasificadores activos que no son administradores
//(los administradores ingresan siempre con su contraseña)
const cuentaElegible = {
    estado: "Activo",
    roles: {
        some: { rolAdministrativo: { rol: "Clasificador" } },
        none: { rolAdministrativo: { rol: "Administrador" } },
    },
} satisfies Prisma.UsuarioWhereInput;

//Si no se puede descifrar (por ejemplo, la generó otro sistema con otro secreto) se informa como null
function leerClave(valor: string): string | null {
    try {
        return descifrarClave(valor);
    } catch {
        return null;
    }
}

function toDto(c: ClaveConUsos): ClaveRespaldoDTO {
    return {
        id: c.id,
        clave: leerClave(c.claveCifrada),
        estado: c.estado,
        fechaHoraUso: c.fechaHoraUso,
        usos: c._count.usos,
    };
}

//Las cuentas con la cantidad de claves disponibles de cada una
export async function listarCuentas(): Promise<CuentaClavesDTO[]> {
    const usuarios = await prisma.usuario.findMany({
        where: cuentaElegible,
        include: {
            persona: true,
            _count: { select: { clavesRespaldo: { where: { estado: "Disponible" } } } },
        },
        orderBy: [{ persona: { apellido: "asc" } }, { persona: { nombre: "asc" } }],
    });

    return usuarios.map((u) => ({
        id: u.id,
        nombre: `${u.persona.nombre} ${u.persona.apellido}`,
        dni: u.persona.dni,
        correo: u.email,
        disponibles: u._count.clavesRespaldo,
    }));
}

//Las disponibles de una cuenta y las que usó en la última semana
export async function listarPorCuenta(usuarioId: string): Promise<ClaveRespaldoDTO[]> {
    const existe = await prisma.usuario.count({ where: { id: usuarioId } });
    if (existe === 0) throw new ErrorNoEncontrado("Usuario no encontrado.");

    const desde = new Date(Date.now() - DIAS_HISTORIAL * 24 * 60 * 60 * 1000);
    const claves = await prisma.claveRespaldo.findMany({
        where: {
            usuarioId,
            OR: [
                { estado: "Disponible" },
                { estado: "Utilizada", fechaHoraUso: { gte: desde } },
            ],
        },
        include: incluirUsos,
        orderBy: [{ fechaHoraCreacion: "asc" }, { id: "asc" }],
    });

    return claves.map(toDto);
}

function nuevaClave(usuarioId: string) {
    const clave = generarClave();
    return { usuarioId, claveCifrada: cifrarClave(clave), claveHash: hashearClave(clave) };
}

async function crearClaves(usuarioId: string, cantidad: number): Promise<void> {   // MODIFICADO
    await prisma.claveRespaldo.createMany({
        data: Array.from({ length: cantidad }, () => nuevaClave(usuarioId)),
    });
}

//Si una cuenta tiene menos claves disponibles que `minimo`, repone hasta CLAVES_POR_CUENTA.
//No anula las existentes. Devuelve cuántas creó.
export async function garantizarClaves(minimo: number): Promise<number> {
    const cuentas = await prisma.usuario.findMany({
        where: cuentaElegible,
        select: {
            id: true,
            _count: { select: { clavesRespaldo: { where: { estado: "Disponible" } } } },
        },
    });

    let creadas = 0;
    for (const cuenta of cuentas) {
        const disponibles = cuenta._count.clavesRespaldo;
        if (disponibles >= minimo) continue;

        const faltantes = CLAVES_POR_CUENTA - disponibles;
        await crearClaves(cuenta.id, faltantes);
        creadas += faltantes;
    }
    return creadas;
}

//Consume la clave de forma atómica. Devuelve false si no existe, ya no está disponible,
//pertenece a otra cuenta o la cuenta no puede usar claves
export async function consumir(clave: string, usuarioId: string): Promise<boolean> {
    const registro = await prisma.claveRespaldo.findUnique({
        where: { claveHash: hashearClave(clave) },
    });
    if (!registro || registro.estado !== "Disponible" || registro.usuarioId !== usuarioId) return false;

    const elegible = await prisma.usuario.count({ where: { id: usuarioId, ...cuentaElegible } });
    if (elegible === 0) return false;

    //El where con estado evita que dos pedidos simultáneos usen la misma clave
    return prisma.$transaction(async (tx) => {
        const { count } = await tx.claveRespaldo.updateMany({
            where: { id: registro.id, estado: "Disponible" },
            data: { estado: "Utilizada", fechaHoraUso: new Date() },
        });
        if (count !== 1) return false;

        await tx.usoClaveRespaldo.create({ data: { claveId: registro.id } });   // NUEVO
        return true;
    });
}

//Anula las claves disponibles de una cuenta (por ejemplo, si se perdieron) y genera un juego nuevo
export async function reemplazar(usuarioId: string): Promise<ClaveRespaldoDTO[]> {
    const elegible = await prisma.usuario.count({ where: { id: usuarioId, ...cuentaElegible } });
    if (elegible === 0) {
        throw new ErrorReglaDeNegocio("La cuenta no puede usar claves de respaldo: debe ser un clasificador activo.");
    }

    await prisma.$transaction(async (tx) => {
        await tx.claveRespaldo.updateMany({
            where: { usuarioId, estado: "Disponible" },
            data: { estado: "Invalidada" },
        });
        await tx.claveRespaldo.createMany({
            data: Array.from({ length: CLAVES_POR_CUENTA }, () => nuevaClave(usuarioId)),
        });
    });

    return listarPorCuenta(usuarioId);
}