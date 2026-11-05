//backend/src/services/dorsal.service.ts
import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import type {
    DorsalDTO,
    DorsalEnCarreraDTO,
} from "../dtos/dorsal.dto";
import {
    toDorsalDto,
    toDorsalEnCarreraDto,
} from "../dtos/dorsal.dto";
import type {
    CrearDorsal,
    ItemInventario,
} from "../validations/dorsal.validations";

type Tx = Prisma.TransactionClient;

type DorsalConChip = Prisma.DorsalGetPayload<{
    include: { chip: true };
}>;
const conChip = {
    chip: true,
} satisfies Prisma.DorsalInclude;
// El dorsal con su entrega en la carrera indicada (a lo sumo una: no se repite en la misma carrera)
const enCarrera = (carreraId: string) => ({
    chip: true,
    entregas: {
        where: { inscripcion: { distanciaCarrera: { idCarrera: carreraId } } },
        take: 1,
    },
}) satisfies Prisma.DorsalInclude;

const porNumero = (a: { numero: string }, b: { numero: string }) => Number(a.numero) - Number(b.numero);

// Piezas compartidas (las usa también la entrega de kits)

// El dorsal físico se reutiliza entre carreras: si no existe se crea
export async function obtenerOCrearDorsal(tx: Tx, numero: string) {
    const existente = await tx.dorsal.findFirst({ where: { numero }, include: conChip });
    return existente ?? tx.dorsal.create({ data: { numero }, include: conChip });
}

// Integra el chip al dorsal: lo crea, o cambia el número si ya tenía uno
export async function asociarChip(tx: Tx, dorsal: DorsalConChip, numero: number) {
    if (dorsal.chip?.numero === numero) return;

    const enUso = await tx.chip.findFirst({ where: { numero, NOT: { dorsalId: dorsal.id } } });
    if (enUso) throw new ErrorReglaDeNegocio(`El chip ${numero} ya está asociado a otro dorsal.`);

    if (dorsal.chip) {
        await tx.chip.update({ where: { id: dorsal.chip.id }, data: { numero } });
    } else {
        await tx.chip.create({ data: { numero, dorsalId: dorsal.id } });
    }
}

export async function listar(busqueda?: string): Promise<DorsalDTO[]> {
    const dorsales = await prisma.dorsal.findMany({
        where: busqueda ? { numero: { contains: busqueda } } : {},
        include: conChip,
    });
    return dorsales.sort(porNumero).map(toDorsalDto);
}

export async function obtener(id: string): Promise<DorsalDTO> {
    const dorsal = await prisma.dorsal.findUnique({ where: { id }, include: conChip });
    if (!dorsal) throw new ErrorNoEncontrado("Dorsal no encontrado.");
    return toDorsalDto(dorsal);
}

export async function crear(datos: CrearDorsal): Promise<DorsalDTO> {
    return prisma.$transaction(async (tx) => {
        const existente = await tx.dorsal.findFirst({ where: { numero: datos.numero } });
        if (existente) throw new ErrorReglaDeNegocio(`El dorsal ${datos.numero} ya existe.`);

        const dorsal = await tx.dorsal.create({ data: { numero: datos.numero }, include: conChip });
        if (datos.chipNumero !== undefined) await asociarChip(tx, dorsal, datos.chipNumero);

        return toDorsalDto(await tx.dorsal.findUniqueOrThrow({ where: { id: dorsal.id }, include: conChip }));
    });
}

export async function cargarInventario(items: ItemInventario[]) {
    return prisma.$transaction(async (tx) => {
        let creados = 0;
        let existentes = 0;

        for (const item of items) {
            const existente = await tx.dorsal.findFirst({ where: { numero: item.numero }, include: conChip });
            if (existente) existentes++;
            else creados++;

            const dorsal = existente ?? await tx.dorsal.create({ data: { numero: item.numero }, include: conChip });
            if (item.chipNumero !== undefined) await asociarChip(tx, dorsal, item.chipNumero);
        }
        return { creados, existentes };
    }, { timeout: 60_000 });
}

export async function vincularChip(dorsalId: string, chipNumero: number): Promise<DorsalDTO> {
    return prisma.$transaction(async (tx) => {
        const dorsal = await tx.dorsal.findUnique({ where: { id: dorsalId }, include: conChip });
        if (!dorsal) throw new ErrorNoEncontrado("Dorsal no encontrado.");

        await asociarChip(tx, dorsal, chipNumero);

        return toDorsalDto(await tx.dorsal.findUniqueOrThrow({ where: { id: dorsalId }, include: conChip }));
    });
}

export async function desvincularChip(dorsalId: string): Promise<DorsalDTO> {
    return prisma.$transaction(async (tx) => {
        const dorsal = await tx.dorsal.findUnique({ where: { id: dorsalId }, include: conChip });
        if (!dorsal) throw new ErrorNoEncontrado("Dorsal no encontrado.");
        if (!dorsal.chip) return toDorsalDto(dorsal); // ya no tenía chip

        // Borrar el chip borra en cascada sus lecturas: si ya leyó algo, no se toca
        const lecturas = await tx.lecturaRFID.count({ where: { chipId: dorsal.chip.id } });
        if (lecturas > 0) throw new ErrorReglaDeNegocio("No se puede desvincular: el chip ya registró lecturas.");

        await tx.chip.delete({ where: { id: dorsal.chip.id } });
        return toDorsalDto({ ...dorsal, chip: null });
    });
}

// Para mostrar el chip (y avisar si ya se entregó en esta carrera) mientras se escribe el número
export async function consultarEnCarrera(carreraId: string, numero: string): Promise<DorsalEnCarreraDTO> {
    const dorsal = await prisma.dorsal.findFirst({ where: { numero }, include: enCarrera(carreraId) });
    if (!dorsal) throw new ErrorNoEncontrado(`El dorsal ${numero} no está en el inventario.`);
    return toDorsalEnCarreraDto(dorsal);
}

// Dorsales ya entregados en la carrera
export async function listarEntregadosEnCarrera(carreraId: string, busqueda?: string): Promise<DorsalEnCarreraDTO[]> {
    const carrera = await prisma.carrera.findUnique({ where: { id: carreraId }, select: { id: true } });
    if (!carrera) throw new ErrorNoEncontrado("Carrera no encontrada.");

    const dorsales = await prisma.dorsal.findMany({
        where: {
            entregas: { some: { inscripcion: { distanciaCarrera: { idCarrera: carreraId } } } },
            ...(busqueda ? { numero: { contains: busqueda } } : {}),
        },
        include: enCarrera(carreraId),
    });
    return dorsales.sort(porNumero).map(toDorsalEnCarreraDto);
}

// Del chip leído al dorsal y su entrega en la carrera.
// entrega === null: el chip es de un dorsal que no se entregó en esta carrera.
export async function identificarPorChip(carreraId: string, chipNumero: number): Promise<DorsalEnCarreraDTO> {
    const dorsal = await prisma.dorsal.findFirst({
        where: { chip: { numero: chipNumero } },
        include: enCarrera(carreraId),
    });
    if (!dorsal) throw new ErrorNoEncontrado(`El chip ${chipNumero} no está asociado a ningún dorsal.`);
    return toDorsalEnCarreraDto(dorsal);
}