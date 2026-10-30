import { prisma } from "../config/prisma";

import { CarreraDTO, toCarreraDto } from "../dtos/carrera.dto";


//Find all por año
export async function findAll(anio?: number): Promise<CarreraDTO[]> {
  let carrerasPrisma;

  if (anio === undefined) {
    carrerasPrisma = await prisma.carrera.findMany({
      include: {
        lugar: { include: { localidad: true } },
        distanciaCarrera: { include: { distancia: true } }
      }
    });
  } else {
    const inicio = new Date(anio, 0, 1);
    const fin = new Date(anio + 1, 0, 1);

    carrerasPrisma = await prisma.carrera.findMany({
      where: { fechaHoraCarrera: { gte: inicio, lt: fin } },
      include: {
        lugar: { include: { localidad: true } },
        distanciaCarrera: { include: { distancia: true } }
      }
    });
  }

  return carrerasPrisma.map(c => toCarreraDto(c))
}

//Find by id
export async function findById(id: string): Promise<CarreraDTO | null> {
  const c = await prisma.carrera.findUnique({
    where: { id },
    include: {
      lugar: { include: { localidad: true } },
      distanciaCarrera: { include: { distancia: true } }
    }
  });

  if (!c) return null;

  return toCarreraDto(c)
}