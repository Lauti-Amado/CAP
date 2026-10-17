//frontend/src/pages/administracion/categorias/categoriasMock.ts
import type { CarreraConfiguracion, Clasificacion } from '../../../types/categoria'

// MOCK TEMPORAL
// TODO BACKEND: reemplazar por las consultas reales.
export const carreraConfiguracionMock: CarreraConfiguracion = {
  nombre: 'CAP 10K 2026',
  fecha: '15 Octubre, 2026',
  ubicacion: 'Parque Central, Ciudad',
  distancia: '10 Kilómetros',
}

export const clasificacionesMock: Clasificacion[] = [
  {
    id: 1,
    nombre: 'Clasificación General',
    descripcion: 'Ranking general de todos los corredores según tiempo de llegada.',
    predeterminada: true,
    acento: 'verde',
  },
  {
    id: 2,
    nombre: 'Clasificación por Categorías',
    descripcion: 'Clasificación dividida según criterios de edad y género.',
    predeterminada: true,
    etiqueta: 'Múltiples Rangos',
    acento: 'verde',
  },
  {
    id: 3,
    nombre: 'Clasificación por Discapacidades',
    descripcion: 'Subcategorías configuradas:',
    predeterminada: true,
    subcategorias: ['Especial', 'Visual', 'Silla de ruedas'],
    acento: 'gris',
  },
]

// Opciones del formulario
export const carrerasCategoriaMock = ['CAP 10K 2026']
export const capacidadesMock = ['Especial', 'Visual', 'Silla de ruedas']