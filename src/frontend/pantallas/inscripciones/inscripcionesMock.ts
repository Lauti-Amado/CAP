import type { Inscripcion } from '../..//types/inscripcion'

export const inscripcionesMock: Inscripcion[] = [
  {
    id: 1,
    dni: '34.567.890',
    corredor: 'Martín Pérez',
    carrera: 'Maratón Internacional',
    distancia: '42K',
    fecha: '15/10/2023',
    pago: 'Pagado',
    estado: 'Confirmada',
  },
  {
    id: 2,
    dni: '28.123.456',
    corredor: 'Laura Gómez',
    carrera: 'Media Maratón de la Ciudad',
    distancia: '21K',
    fecha: '12/10/2023',
    pago: 'Pendiente',
    estado: 'En Proceso',
  },
  {
    id: 3,
    dni: '40.987.654',
    corredor: 'Carlos Ruiz',
    carrera: 'Maratón Internacional',
    distancia: '10K',
    fecha: '10/10/2023',
    pago: 'Pagado',
    estado: 'Anulada',
  },
]