//backend/src/services/plantillaCertificado.service.ts
import { prisma } from "../config/prisma";
import { ErrorNoEncontrado } from "../errors/errorNoEncontrado.error";
import { ErrorReglaDeNegocio } from "../errors/errorReglaDeNegocio.error";
import { toPlantillaCertificadoDto, type PlantillaCertificadoDTO } from "../dtos/plantillaCertificado.dto";
import type { DatosPlantillaCertificado } from "../validations/plantillaCertificado.validations";

export async function listar(): Promise<PlantillaCertificadoDTO[]> {
    const plantillas = await prisma.plantillaCertificado.findMany({
        orderBy: [{ activa: "desc" }, { fechaHoraModificacion: "desc" }],
    });
    return plantillas.map(toPlantillaCertificadoDto);
}

// La primera plantilla que se crea queda activa
export async function crear(datos: DatosPlantillaCertificado): Promise<PlantillaCertificadoDTO> {
    const hayActiva = (await prisma.plantillaCertificado.count({ where: { activa: true } })) > 0;
    const plantilla = await prisma.plantillaCertificado.create({ data: { ...datos, activa: !hayActiva } });
    return toPlantillaCertificadoDto(plantilla);
}

export async function actualizar(id: string, datos: DatosPlantillaCertificado): Promise<PlantillaCertificadoDTO> {
    const plantilla = await prisma.plantillaCertificado.update({ where: { id }, data: datos });
    return toPlantillaCertificadoDto(plantilla);
}

// Solo una activa a la vez: si el id no existe, el update falla (P2025) y la transacción se revierte
export async function activar(id: string): Promise<PlantillaCertificadoDTO> {
    const [, plantilla] = await prisma.$transaction([
        prisma.plantillaCertificado.updateMany({ where: { activa: true, NOT: { id } }, data: { activa: false } }),
        prisma.plantillaCertificado.update({ where: { id }, data: { activa: true } }),
    ]);
    return toPlantillaCertificadoDto(plantilla);
}

export async function eliminar(id: string): Promise<void> {
    const plantilla = await prisma.plantillaCertificado.findUnique({ where: { id } });
    if (!plantilla) throw new ErrorNoEncontrado("Plantilla no encontrada.");
    if (plantilla.activa) throw new ErrorReglaDeNegocio("No se puede eliminar la plantilla en uso.");
    if ((await prisma.plantillaCertificado.count()) === 1) {
        throw new ErrorReglaDeNegocio("No se puede eliminar la última plantilla.");
    }
    await prisma.plantillaCertificado.delete({ where: { id } });
}

// Estilo de la plantilla activa como params del mail (Brevo no acepta booleanos en la plantilla de forma cómoda)
export async function obtenerParametrosEstiloActivo(): Promise<Record<string, string | number>> {
    const activa = await prisma.plantillaCertificado.findFirst({ where: { activa: true } });
    if (!activa) return {};

    return {
        colorPrimario: activa.colorPrimario,
        colorSecundario: activa.colorSecundario,
        colorFondo: activa.colorFondo,
        fuente: activa.fuente,
        esquinasRedondeadas: activa.esquinasRedondeadas ? "si" : "no",
        sombras: activa.sombras ? "si" : "no",
        marcaDeAgua: activa.marcaDeAgua ? "si" : "no",
    };
}