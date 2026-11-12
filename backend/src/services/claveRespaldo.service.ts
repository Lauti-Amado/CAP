//backend/src/services/claveRespaldo.service.ts
import { prisma } from "../config/prisma";
import type { ClaveRespaldo } from "../generated/prisma/client";
import type { ClaveRespaldoDTO } from "../dtos/claveRespaldo.dto";
import { cifrarClave, descifrarClave, generarClave, hashearClave } from "../utils/claveRespaldo.util";

const CANTIDAD_CLAVES = 8;

function toDto(c: ClaveRespaldo): ClaveRespaldoDTO {
    return {
        id: c.id,
        numero: c.numero,
        clave: descifrarClave(c.claveCifrada),
        estado: c.estado,
        fechaHoraUso: c.fechaHoraUso,
    };
}

//Devuelve el lote vigente (el último generado)
export async function listar(): Promise<ClaveRespaldoDTO[]> {
    const { _max } = await prisma.claveRespaldo.aggregate({ _max: { lote: true } });
    if (_max.lote === null) return [];

    const claves = await prisma.claveRespaldo.findMany({
        where: { lote: _max.lote },
        orderBy: { numero: "asc" },
    });
    return claves.map(toDto);
}

//Invalida las claves disponibles y crea un lote nuevo
export async function generar(usuarioId: string): Promise<ClaveRespaldoDTO[]> {
    await prisma.$transaction(async (tx) => {
        const { _max } = await tx.claveRespaldo.aggregate({ _max: { lote: true } });
        const lote = (_max.lote ?? 0) + 1;

        await tx.claveRespaldo.updateMany({
            where: { estado: "Disponible" },
            data: { estado: "Invalidada" },
        });

        for (let numero = 1; numero <= CANTIDAD_CLAVES; numero++) {
            const clave = generarClave();
            await tx.claveRespaldo.create({
                data: {
                    lote,
                    numero,
                    claveCifrada: cifrarClave(clave),
                    claveHash: hashearClave(clave),
                    creadaPorId: usuarioId,
                },
            });
        }
    });

    return listar();
}

//Consume la clave de forma atómica. Devuelve false si no existe o ya no está disponible
export async function consumir(clave: string, usuarioId: string): Promise<boolean> {
    const registro = await prisma.claveRespaldo.findUnique({
        where: { claveHash: hashearClave(clave) },
    });
    if (!registro || registro.estado !== "Disponible") return false;

    //El where con estado evita que dos pedidos simultáneos usen la misma clave
    const { count } = await prisma.claveRespaldo.updateMany({
        where: { id: registro.id, estado: "Disponible" },
        data: { estado: "Utilizada", usadaPorId: usuarioId, fechaHoraUso: new Date() },
    });
    return count === 1;
}