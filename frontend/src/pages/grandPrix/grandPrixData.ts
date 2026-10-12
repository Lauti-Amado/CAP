export type GrandPrixStanding = {
  id: string
  position: number
  name: string
  dni: string
  category: string
  gender: 'Femenino' | 'Masculino'
  racesCompleted: number
  totalRaces: number
  points: number
  initials: string
}

export type GrandPrixCircuit = {
  id: string
  name: string
  year: number
  status: 'Activo' | 'Borrador' | 'Finalizado'
  races: number
  participants: number
  pointsRule: string
}

export const grandPrixStandings: GrandPrixStanding[] = [
  { id: '1', position: 1, name: 'Martín Ramírez Ocampo', dni: '32.445.192', category: 'Mayores', gender: 'Masculino', racesCompleted: 8, totalRaces: 10, points: 4250, initials: 'MR' },
  { id: '2', position: 2, name: 'Lucía Fernández Ríos', dni: '34.112.890', category: 'Mayores', gender: 'Femenino', racesCompleted: 9, totalRaces: 10, points: 4120, initials: 'LF' },
  { id: '3', position: 3, name: 'Javier Gómez', dni: '29.887.431', category: 'Máster A', gender: 'Masculino', racesCompleted: 10, totalRaces: 10, points: 3980, initials: 'JG' },
  { id: '4', position: 4, name: 'Valeria Torres', dni: '36.554.221', category: 'Mayores', gender: 'Femenino', racesCompleted: 7, totalRaces: 10, points: 3450, initials: 'VT' },
  { id: '5', position: 5, name: 'Diego Armando Silva', dni: '31.002.449', category: 'Máster A', gender: 'Masculino', racesCompleted: 8, totalRaces: 10, points: 3210, initials: 'DS' },
]

export const initialGrandPrixCircuits: GrandPrixCircuit[] = [
  { id: 'gp-2026', name: 'Grand Prix 2026', year: 2026, status: 'Activo', races: 10, participants: 2450, pointsRule: 'Por posición general' },
  { id: 'gp-2025', name: 'Grand Prix 2025', year: 2025, status: 'Finalizado', races: 8, participants: 2138, pointsRule: 'Por posición general' },
]
