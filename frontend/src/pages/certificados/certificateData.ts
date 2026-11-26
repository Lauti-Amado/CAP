export type CertificateTemplate = {
  id: string
  name: string
  updatedAt: string
  active: boolean
  style: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    fontFamily: string
    rounded: boolean
    shadows: boolean
    watermark: boolean
  }
}

export type DynamicField = {
  id: string
  label: string
  token: string
}

export function crearPlantillaNueva(): CertificateTemplate {
  return {
    id: '', // vacío = todavía no existe en el backend
    name: '',
    updatedAt: new Date().toISOString(),
    active: false,
    style: {
      primaryColor: '#175f35',
      secondaryColor: '#20bf63',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      rounded: true,
      shadows: true,
      watermark: false,
    },
  }
}

export const dynamicFields: DynamicField[] = [
  { id: 'fullName', label: 'Nombre completo', token: '{{nombre}}' },
  { id: 'raceName', label: 'Carrera', token: '{{carrera}}' },
  { id: 'distance', label: 'Distancia', token: '{{distancia}}' },
  { id: 'position', label: 'Puesto', token: '{{puesto}}' },
  { id: 'time', label: 'Tiempo', token: '{{tiempo}}' },
]

export const certificatePreview = {
  participantName: 'Juan Pérez',
  raceName: 'CAP 10K 2026',
  participationDate: '24/10/2026',
  signerName: 'Firma Digital',
  sealText: 'Sello CAP',
}
