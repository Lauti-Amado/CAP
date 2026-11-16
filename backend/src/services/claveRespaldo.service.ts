//backend/src/services/claveRespaldo.service.ts
import { prisma } from "../config/prisma";
import type { ClaveRespaldo, Prisma } from "../generated/prisma/client";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import type { ClaveRespaldoDTO, CuentaClavesDTO } from "../dtos/claveRespaldo.dto";
import { cifrarClave, descifrarClave, generarClave, hashearClave } from "../utils/claveRespaldo.util";

const CLAVES_POR_CUENTA = 8;
const DIAS_HISTORIAL = 7;

//Cuentas que pueden usar claves: clasificadores activos que no son administradores
//(los administradores ingresan siempre con su contraseña)
const cuentaElegible = {
    estado: "Activo",
    roles: {
        some: { rolAdministrativo: { rol: "Clasificador" } },
        none: { rolAdministrativo: { rol: "Administrador" } },
    },
} satisfies Prisma.UsuarioWhereInput;

function toDto(c: ClaveRespaldo): ClaveRespaldoDTO {
    return {
        id: c.id,
        clave: descifrarClave(c.claveCifrada),
        estado: c.estado,
        fechaHoraUso: c.fechaHoraUso,
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
        orderBy: [{ fechaHoraCreacion: "asc" }, { id: "asc" }],
    });

    return claves.map(toDto);
}

async function crearClaves(usuarioId: string, cantidad: number): Promise<void> {
    for (let i = 0; i < cantidad; i++) {
        const clave = generarClave();
        await prisma.claveRespaldo.create({
            data: { usuarioId, claveCifrada: cifrarClave(clave), claveHash: hashearClave(clave) },
        });
    }
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
    const { count } = await prisma.claveRespaldo.updateMany({
        where: { id: registro.id, estado: "Disponible" },
        data: { estado: "Utilizada", fechaHoraUso: new Date() },
    });
    return count === 1;
}