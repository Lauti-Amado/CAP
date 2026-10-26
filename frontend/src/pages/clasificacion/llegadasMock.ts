//frontend/src/pages/clasificacion/llegadasMock.ts
import type { LlegadaAtleta } from '../../types/clasificacion'

// MOCK TEMPORAL
// TODO BACKEND: GET /api/carreras/{id}/clasificacion/tiempo-real
export const llegadasMock: LlegadaAtleta[] = [
  { id: 1, puesto: 1, dorsal: '1042', apellidosNombres: 'Martínez, Juan Pablo', dni: '32.456.789', categoria: 'M 30-34', tiempo: '00:45:12.105', estado: 'OFICIAL', sexo: 'Masculino', club: 'Running Team Sur', equipo: 'Elite' },
  { id: 2, puesto: 2, dorsal: '856', apellidosNombres: 'López, Ana María', dni: '28.123.456', categoria: 'F 35-39', tiempo: '00:46:05.892', estado: 'OFICIAL', sexo: 'Femenino', club: 'Club La Plata', equipo: 'Veteranas' },
  { id: 3, puesto: 3, dorsal: '2105', apellidosNombres: 'Garcia, Carlos', dni: '40.987.654', categoria: 'M 20-24', tiempo: '00:46:42.331', estado: 'EN REVISIÓN', sexo: 'Masculino', club: 'Independiente', equipo: 'Jóvenes' },
  { id: 4, puesto: 4, dorsal: '342', apellidosNombres: 'Rodriguez, Laura', dni: '35.654.321', categoria: 'F 25-29', tiempo: '00:47:10.050', estado: 'OFICIAL', sexo: 'Femenino', club: 'CAP', equipo: 'Elite' },
  { id: 5, puesto: 5, dorsal: '1899', apellidosNombres: 'Fernández, Diego', dni: '25.333.222', categoria: 'M 40-44', tiempo: '00:47:28.901', estado: 'EN REVISIÓN', sexo: 'Masculino', club: 'Running Team Sur', equipo: 'Master' },
]