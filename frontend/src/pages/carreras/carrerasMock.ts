//Despues borrar despues del domingo

import type { Carrera } from '../../types/carrera'

export const carrerasMock: Carrera[] = [
  {
    id: 1,
    nombre: 'Maratón de Buenos Aires 2024',
    fechaHora: '2024-09-22T08:00:00',
    imagenUrl: '',
    descripcion:
      'Maratón internacional realizada en Buenos Aires.',
    cupoMax: 15000,
    estado: 'Publicada',
    lugar: {
      nombre: 'Buenos Aires',
      localidad: {
        nombre: 'Buenos Aires',
      },
    },
    distanciaCarrera: [
      {
        distancia: {
          kilometraje: 42,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Competitiva',
        },
      },
    ],
  },

  {
    id: 2,
    nombre: 'Cruce de los Andes Ultra Trail',
    fechaHora: '2024-11-15T07:00:00',
    imagenUrl: '',
    descripcion:
      'Carrera de trail desarrollada en la región cordillerana.',
    cupoMax: 10000,
    estado: 'Borrador',
    lugar: {
      nombre: 'Mendoza',
      localidad: {
        nombre: 'Mendoza',
      },
    },
    distanciaCarrera: [
      {
        distancia: {
          kilometraje: 100,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 50,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Participativa',
        },
      },
    ],
  },

  {
    id: 3,
    nombre: 'Patagonia Run Mountain 2023',
    fechaHora: '2023-04-15T08:00:00',
    imagenUrl: '',
    descripcion:
      'Carrera de montaña realizada en San Martín de los Andes.',
    cupoMax: 10000,
    estado: 'Finalizada',
    lugar: {
      nombre: 'San Martín de los Andes',
      localidad: {
        nombre: 'Neuquén',
      },
    },
    distanciaCarrera: [
      {
        distancia: {
          kilometraje: 160,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 110,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 70,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 42,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Participativa',
        },
      },
      {
        distancia: {
          kilometraje: 10,
          tipoDistancia: 'Participativa',
        },
      },
    ],
  },

  {
    id: 4,
    nombre: 'Maratón Internacional CAP 2024',
    fechaHora: '2024-11-15T07:00:00',
    imagenUrl: '',
    descripcion:
      'Evento deportivo organizado por el Círculo de Atletas Platenses.',
    cupoMax: 10000,
    estado: 'Publicada',
    lugar: {
      nombre: 'Palermo',
      localidad: {
        nombre: 'Buenos Aires',
      },
    },
    distanciaCarrera: [
      {
        distancia: {
          kilometraje: 42,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 21,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 10,
          tipoDistancia: 'Participativa',
        },
      },
    ],
  },

  {
    id: 5,
    nombre: 'La Plata Corre 10K',
    fechaHora: '2025-03-16T09:00:00',
    imagenUrl: '',
    descripcion:
      'Carrera urbana organizada en la ciudad de La Plata.',
    cupoMax: 5000,
    estado: 'Publicada',
    lugar: {
      nombre: 'Centro',
      localidad: {
        nombre: 'La Plata',
      },
    },
    distanciaCarrera: [
      {
        distancia: {
          kilometraje: 10,
          tipoDistancia: 'Competitiva',
        },
      },
      {
        distancia: {
          kilometraje: 5,
          tipoDistancia: 'Participativa',
        },
      },
    ],
  },

  {
    id: 6,
    nombre: 'Carrera Solidaria CAP',
    fechaHora: '2025-06-08T10:00:00',
    imagenUrl: '',
    descripcion:
      'Carrera participativa organizada por CAP.',
    cupoMax: 3000,
    estado: 'Finalizada',
    lugar: {
      nombre: 'Paseo del Bosque',
      localidad: {
        nombre: 'La Plata',
      },
    },
    distanciaCarrera: [
      {
        distancia: {
          kilometraje: 10,
          tipoDistancia: 'Participativa',
        },
      },
      {
        distancia: {
          kilometraje: 5,
          tipoDistancia: 'Participativa',
        },
      },
    ],
  },
]