//frontend/src/utils/carrera.ts

// "Maratón Villera" -> "maratón-villera" (así se arma la URL de la carrera seleccionada)
export function slugCarrera(nombre: string): string {
  return nombre.toLowerCase().replace(/ /g, '-')
}