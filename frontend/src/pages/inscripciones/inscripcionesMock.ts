import type { Inscripcion } from '../../types/inscripcion'

export const inscripcionesMock: Inscripcion[] = [
  {
    id: 1,
    dni: '38456789',
    corredor: 'Roberto Perez',
    carrera: 'Gran Maratón Aniversario',
    distancia: '21K',
    fecha: '15/10/2025',
    pago: 'Pagado',
    estado: 'Confirmada',
  },
  {
    id: 2,
    dni: '35123456',
    corredor: 'Martin Gómez',
    carrera: 'Gran Maratón Aniversario',
    distancia: '10K',
    fecha: '12/10/2025',
    pago: 'Pagado',
    estado: 'Confirmada',
  },
  {
    id: 3,
    dni: '40123456',
    corredor: 'Ana López',
    carrera: 'Gran Maratón Aniversario',
    distancia: '21K',
    fecha: '10/10/2025',
    pago: 'Pendiente',
    estado: 'En Proceso',
  },
]