//frontend/src/pages/clasificacion/corredoresClasificacionMock.ts
import type { CorredorClasificacion } from '../../types/clasificacion'

// MOCK TEMPORAL
// TODO BACKEND: reemplazar por la consulta de participantes de la carrera.
export const corredoresClasificacionMock: CorredorClasificacion[] = [
  { id: 1, dorsal: '#1042', nombre: 'Juan Pérez', dni: '38.456.789', categoria: 'Masculino 30-34', estado: 'Oficial' },
  { id: 2, dorsal: '#1043', nombre: 'María Gómez', dni: '39.123.456', categoria: 'Femenino 25-29', estado: 'Oficial' },
  { id: 3, dorsal: '#1044', nombre: 'Carlos Ruiz', dni: '35.987.654', categoria: 'Masculino 35-39', estado: 'En revisión' },
  { id: 4, dorsal: '#1045', nombre: 'Ana Silva', dni: '40.111.222', categoria: 'Femenino 20-24', estado: 'Oficial' },
    { id: 5, dorsal: '#2106', nombre: 'Juan Pablo Martínez', dni: '32.456.789', categoria: 'M 30-34', estado: 'Oficial' },
]