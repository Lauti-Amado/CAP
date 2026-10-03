import type { Carrera } from '../../types/carrera'

export type CarreraDetalleMock = Carrera & {
  cantidadInscriptos: number
  cantidadKitsEntregados: number
  cantidadClasificados: number
}

export const carrerasDetalleMock: CarreraDetalleMock[] = [
  {
    id: 1,
    nombre: 'Maratón de Buenos Aires 2024',
    estado: 'Publicada',
    cupoMax: 1000,
    fechaHora: '2024-09-22T08:00:00',
    imagenUrl: '',
    descripcion:
      'Carrera de larga distancia organizada para corredores de distintos niveles, con recorridos de 42K y 21K.',
    lugar: {
      nombre: 'Buenos Aires',
      localidad: {
        nombre: 'Buenos Aires',
      },
    },
    distanciaCarrera: [
      {
        id: 1,
        precioDistancia: 15000,
        distancia: {
          kilometraje: 42,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 2,
        precioDistancia: 12000,
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Competitiva',
        },
      },
    ],
    cantidadInscriptos: 742,
    cantidadKitsEntregados: 680,
    cantidadClasificados: 0,
  },

  {
    id: 2,
    nombre: 'Cruce de los Andes Ultra Trail',
    estado: 'Borrador',
    cupoMax: 500,
    fechaHora: '2026-11-15T07:30:00',
    imagenUrl: '',
    descripcion:
      'Competencia de trail running con diferentes distancias y recorridos de montaña.',
    lugar: {
      nombre: 'Mendoza',
      localidad: {
        nombre: 'Mendoza',
      },
    },
    distanciaCarrera: [
      {
        id: 3,
        precioDistancia: 25000,
        distancia: {
          kilometraje: 100,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 4,
        precioDistancia: 18000,
        distancia: {
          kilometraje: 50,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 5,
        precioDistancia: 12000,
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Participativa',
        },
      },
    ],
    cantidadInscriptos: 126,
    cantidadKitsEntregados: 0,
    cantidadClasificados: 0,
  },

  {
    id: 3,
    nombre: 'Patagonia Run Mountain 2023',
    estado: 'Finalizada',
    cupoMax: 1500,
    fechaHora: '2023-04-14T06:00:00',
    imagenUrl: '',
    descripcion:
      'Carrera de montaña con diferentes distancias adaptadas a distintos niveles de corredores.',
    lugar: {
      nombre: 'San Martín de los Andes',
      localidad: {
        nombre: 'Neuquén',
      },
    },
    distanciaCarrera: [
      {
        id: 6,
        precioDistancia: 30000,
        distancia: {
          kilometraje: 160,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 7,
        precioDistancia: 25000,
        distancia: {
          kilometraje: 110,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 8,
        precioDistancia: 18000,
        distancia: {
          kilometraje: 70,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 9,
        precioDistancia: 15000,
        distancia: {
          kilometraje: 42,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        id: 10,
        precioDistancia: 10000,
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Competitiva',
        },
      },
    ],
    cantidadInscriptos: 1248,
    cantidadKitsEntregados: 1201,
    cantidadClasificados: 1178,
  },
]