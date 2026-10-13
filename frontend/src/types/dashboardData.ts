export type DashboardActivity = {
  id: string
  kind: 'reading' | 'kit' | 'registration'
  description: string
  occurredAt: string
}

export type DashboardData = {
  nextRace: {
    name: string
    startsAt: string
    location: string
  } | null
  registrations: {
    confirmed: number
    capacity: number
  }
  rfid: {
    connected: boolean
    antennas: { name: string; working: boolean }[]
  }
  activities: DashboardActivity[]
  unreadNotifications: number
}

const aWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

// Datos de muestra. La vista consume este contrato para poder conectar una fuente real después.
export const dashboardData: DashboardData = {
  nextRace: {
    name: 'CAP 10K 2026',
    startsAt: '2026-10-15T08:00:00-03:00',
    location: 'Parque Central',
  },
  registrations: {
    confirmed: 542,
    capacity: 600,
  },
  rfid: {
    connected: true,
    antennas: [
      { name: 'Antena 1', working: true },
      { name: 'Antena 2', working: true },
    ],
  },
  activities: [
    { id: 'activity-1', kind: 'reading', description: 'Lectura registrada: Dorsal #1042', occurredAt: aWeekAgo },
    { id: 'activity-2', kind: 'kit', description: 'Kit entregado a Lucía Gómez', occurredAt: aWeekAgo },
    { id: 'activity-3', kind: 'registration', description: 'Nueva inscripción manual: C. Silva', occurredAt: aWeekAgo },
    { id: 'activity-4', kind: 'kit', description: 'Kit entregado a Esteban Quito', occurredAt: aWeekAgo },
  ],
  unreadNotifications: 1,
}
