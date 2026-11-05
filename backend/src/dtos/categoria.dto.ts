import type { Prisma } from "../generated/prisma/client";

export const categoriaInclude = {
    criterios: {
        orderBy: { nombre: "asc" as const },
    },
} satisfies Prisma.CategoriaInclude;

type CategoriaPrisma = Prisma.CategoriaGetPayload<{
    include: typeof categoriaInclude;
}>;

export function toCategoriaDTO(categoria: CategoriaPrisma) {
    return {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        criterios: categoria.criterios.map(({ nombre, valor }) => ({
            nombre,
            valor,
        })),
    };
}

export type CategoriaDTO = ReturnType<typeof toCategoriaDTO>;