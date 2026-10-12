import type { ContactoEmergencia } from '../../types/inscripcion'

/*
 * MOCK TEMPORAL
 */

export const contactosEmergenciaMock: ContactoEmergencia[] = [
  {
    nombre: 'Laura',
    apellido: 'Gómez',
    dni: '30123456',
    telefono: '221 555-1234',
  },
  {
    nombre: 'Carlos',
    apellido: 'Pérez',
    dni: '28987654',
    telefono: '221 444-5678',
  },
]
export type DistanciaInscripcionMock = {
  id: string
  nombre: string
  descripcion: string
  precio: number
}

export type ProductoDinamicoMock = {
  id: string
  nombre: string
  precio: number
}

export const carreraInscripcionMock = {
  nombre: 'Maratón de Buenos Aires',
  edicion: 2024,
}

export const distanciasInscripcionMock: DistanciaInscripcionMock[] = [
  {
    id: '5K',
    nombre: '5K',
    descripcion: 'Participativa',
    precio: 25000,
  },
  {
    id: '10K',
    nombre: '10K',
    descripcion: 'Competitiva',
    precio: 30000,
  },
  {
    id: '21K',
    nombre: '21K',
    descripcion: 'Media Maratón',
    precio: 35000,
  },
]

export const productosDinamicosMock: ProductoDinamicoMock[] = [
  {
    id: 'remera',
    nombre: 'Remera',
    precio: 5000,
  },
]

export const variantesProductoMock = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
]

export const cantidadesProductoMock = [
  1,
  2,
  3,
]