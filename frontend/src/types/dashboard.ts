//frontend/src/types/dashboard.ts
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