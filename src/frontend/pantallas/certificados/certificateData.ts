export type CertificateTemplate = {
  id: string
  name: string
  raceName: string
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

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: 'cap-2026',
    name: 'Certificado CAP 2026',
    raceName: 'CAP 10K 2026',
    updatedAt: '2026-04-20T10:30:00-03:00',
    active: true,
    style: {
      primaryColor: '#175f35',
      secondaryColor: '#20bf63',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      rounded: true,
      shadows: true,
      watermark: false,
    },
  },
  {
    id: 'classic',
    name: 'Plantilla clásica',
    raceName: 'Todas las carreras',
    updatedAt: '2026-02-12T09:00:00-03:00',
    active: false,
    style: {
      primaryColor: '#263044', secondaryColor: '#a88d55', backgroundColor: '#ffffff',
      fontFamily: 'Georgia, serif', rounded: false, shadows: false, watermark: true,
    },
  },
  {
    id: 'new',
    name: 'Nueva plantilla',
    raceName: 'Sin carrera asignada',
    updatedAt: '2026-09-21T12:00:00-03:00',
    active: false,
    style: {
      primaryColor: '#175f35', secondaryColor: '#20bf63', backgroundColor: '#ffffff',
      fontFamily: 'Arial, Helvetica, sans-serif', rounded: true, shadows: true, watermark: false,
    },
  },
]

export const dynamicFields: DynamicField[] = [
  { id: 'fullName', label: 'Full Name', token: '{{nombre}}' },
  { id: 'lastName', label: 'Race Name', token: '{{apellido}}' },
  { id: 'date', label: 'Date', token: '{{fecha}}' },
  { id: 'signature', label: 'Digital Signature', token: '{{firma}}' },
]

export const certificatePreview = {
  participantName: 'Juan Pérez',
  raceName: 'CAP 10K 2026',
  participationDate: '24/10/2026',
  signerName: 'Firma Digital',
  sealText: 'Sello CAP',
}
