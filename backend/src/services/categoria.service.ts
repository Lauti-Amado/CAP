
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import {
    categoriaInclude,
    toCategoriaDTO,
    type CategoriaDTO,
} from "../dtos/categoria.dto";

type DatosCategoria = {
    nombre: string;
    descripcion: string;
    criterios: {
        nombre: string;
        valor: string;
    }[];
};

// Categorías predeterminadas que no pueden modificarse ni eliminarse.
const CATEGORIAS_PROTEGIDAS = ["Edad CAP", "Discapacidades"];

function esCategoriaProtegida(nombre: string): boolean {
    return CATEGORIAS_PROTEGIDAS.some(
        (nombreProtegido) =>
            nombreProtegido.toLowerCase() === nombre.trim().toLowerCase()
    );
}

// Lista todas las categorías configuradas.
export async function listar(): Promise<CategoriaDTO[]> {
    const categorias = await prisma.categoria.findMany({
        include: categoriaInclude,
        orderBy: { nombre: "asc" },
    });

    return categorias.map(toCategoriaDTO);
}

// Obtiene una categoría por su ID.
export async function obtenerPorId(id: string): Promise<CategoriaDTO> {
    const categoria = await prisma.categoria.findUnique({
        where: { id },
        include: categoriaInclude,
    });

    if (!categoria) {
        throw new ErrorNoEncontrado("Categoría no encontrada.");
    }

    return toCategoriaDTO(categoria);
}

// Crea una categoría con sus criterios.
export async function crear(datos: DatosCategoria): Promise<CategoriaDTO> {
    const existente = await prisma.categoria.findFirst({
        where: { nombre: datos.nombre },
    });

    if (existente) {
        throw new ErrorReglaDeNegocio(
            "Ya existe una categoría con ese nombre."
        );
    }

    const categoria = await prisma.categoria.create({
        data: {
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            criterios: { create: datos.criterios },
        },
        include: categoriaInclude,
    });

    return toCategoriaDTO(categoria);
}

// Actualiza una categoría y sus criterios.
export async function actualizar(
    id: string,
    datos: DatosCategoria
): Promise<CategoriaDTO> {
    const categoriaActual = await prisma.categoria.findUnique({
        where: { id },
    });

    if (!categoriaActual) {
        throw new ErrorNoEncontrado("Categoría no encontrada.");
    }

    if (esCategoriaProtegida(categoriaActual.nombre)) {
        throw new ErrorReglaDeNegocio(
            "No se puede modificar una categoría predeterminada."
        );
    }

    const existente = await prisma.categoria.findFirst({
        where: { nombre: datos.nombre, NOT: { id } },
    });

    if (existente) {
        throw new ErrorReglaDeNegocio(
            "Ya existe otra categoría con ese nombre."
        );
    }

    const categoria = await prisma.$transaction(async (tx) => {
        await tx.criterioCategoria.deleteMany({
            where: { categoriaId: id },
        });

        return tx.categoria.update({
            where: { id },
            data: {
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                criterios: { create: datos.criterios },
            },
            include: categoriaInclude,
        });
    });

    return toCategoriaDTO(categoria);
}

// Elimina una categoría si no es predeterminada ni tiene resultados asociados.
export async function eliminar(id: string): Promise<void> {
    const categoria = await prisma.categoria.findUnique({
        where: { id },
    });

    if (!categoria) {
        throw new ErrorNoEncontrado("Categoría no encontrada.");
    }

    if (esCategoriaProtegida(categoria.nombre)) {
        throw new ErrorReglaDeNegocio(
            "No se puede eliminar una categoría predeterminada."
        );
    }

    const resultadosAsociados = await prisma.resultadoCategoria.count({
        where: { categoriaId: id },
    });

    if (resultadosAsociados > 0) {
        throw new ErrorReglaDeNegocio(
            "No se puede eliminar una categoría que ya tiene resultados asociados."
        );
    }

    await prisma.categoria.delete({ where: { id } });
}
