//frontend/src/services/plantillasCertificadoService.ts
import { apiFetch } from './apiService'
import type { CertificateTemplate } from '../pages/certificados/certificateData'

type PlantillaCertificadoDTO = {
  id: string
  nombre: string
  activa: boolean
  colorPrimario: string
  colorSecundario: string
  colorFondo: string
  fuente: string
  esquinasRedondeadas: boolean
  sombras: boolean
  marcaDeAgua: boolean
  fechaHoraModificacion: string
}

const aPlantilla = (d: PlantillaCertificadoDTO): CertificateTemplate => ({
  id: d.id,
  name: d.nombre,
  active: d.activa,
  updatedAt: d.fechaHoraModificacion,
  style: {
    primaryColor: d.colorPrimario,
    secondaryColor: d.colorSecundario,
    backgroundColor: d.colorFondo,
    fontFamily: d.fuente,
    rounded: d.esquinasRedondeadas,
    shadows: d.sombras,
    watermark: d.marcaDeAgua,
  },
})

const aDatos = (t: CertificateTemplate) => ({
  nombre: t.name.trim(),
  colorPrimario: t.style.primaryColor,
  colorSecundario: t.style.secondaryColor,
  colorFondo: t.style.backgroundColor,
  fuente: t.style.fontFamily,
  esquinasRedondeadas: t.style.rounded,
  sombras: t.style.shadows,
  marcaDeAgua: t.style.watermark,
})

export async function listarPlantillas(): Promise<CertificateTemplate[]> {
  const lista = await apiFetch<PlantillaCertificadoDTO[]>('/plantillas-certificado')
  return lista.map(aPlantilla)
}

export async function crearPlantilla(plantilla: CertificateTemplate): Promise<CertificateTemplate> {
  return aPlantilla(
    await apiFetch<PlantillaCertificadoDTO>('/plantillas-certificado', {
      method: 'POST',
      body: JSON.stringify(aDatos(plantilla)),
    }),
  )
}

export async function actualizarPlantilla(plantilla: CertificateTemplate): Promise<CertificateTemplate> {
  return aPlantilla(
    await apiFetch<PlantillaCertificadoDTO>(`/plantillas-certificado/${plantilla.id}`, {
      method: 'PUT',
      body: JSON.stringify(aDatos(plantilla)),
    }),
  )
}

export async function activarPlantilla(id: string): Promise<CertificateTemplate> {
  return aPlantilla(
    await apiFetch<PlantillaCertificadoDTO>(`/plantillas-certificado/${id}/activar`, { method: 'PATCH' }),
  )
}

export function eliminarPlantilla(id: string): Promise<void> {
  return apiFetch<void>(`/plantillas-certificado/${id}`, { method: 'DELETE' })
}