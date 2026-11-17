import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { prisma } from '../config/prisma'; 

let intervaloBackup: NodeJS.Timeout | null = null;
const INTERVALO_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Genera y guarda el archivo Excel con la clasificación actual de la carrera en curso
 */
export async function generarBackupExcel(carreraId: string): Promise<string | null> {
  try {
    // 1. Consultar la carrera y sus clasificaciones en curso
    const carrera = await prisma.carrera.findUnique({
      where: { id: carreraId },
      include: {
        distanciaCarrera: {
          include: {
            distancia: true,
            inscripciones: {
              include: {
                corredor: {
                  include: { persona: true }
                },
                entregaKit: {
                  include: { dorsal: true }
                },
                clasificacion: {
                  include: { 
                    resultado: {
                      include: {
                        resultadosCategoria: {
                          include: { categoria: true }
                        }
                      }
                    } 
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!carrera || carrera.estado !== 'En_curso') {
      return null;
    }

    // 2. Extraer y estructurar únicamente los datos de clasificación de los corredores
    const datosClasificacion: any[] = [];

    carrera.distanciaCarrera.forEach(dc => {
      const nombreDistancia = `${dc.distancia.kilometraje}km (${dc.distancia.tipoDistancia})`;

      dc.inscripciones.forEach(ins => {
        // Solo procesamos corredores que tengan un registro de clasificación o hayan largado
        const clasificacion = ins.clasificacion;
        const resultado = clasificacion?.resultado;
        const dorsal = ins.entregaKit?.dorsal?.numero ?? 'S/D';
        const corredorNombre = `${ins.corredor.persona.apellido}, ${ins.corredor.persona.nombre}`;
        const dni = ins.corredor.persona.dni;
        
        // Obtener categoría si la tiene asignada
        const categoriaNombre = resultado?.resultadosCategoria?.[0]?.categoria?.nombre ?? 'General';

        // Puesto y tiempos
        const puestoGeneral = resultado?.puestoGeneral ?? '-';
        const tiempoMilisegundos = resultado?.tiempoLlegada;
        
        // Convertir milisegundos a formato HH:MM:SS si ya llegó, o mostrar estado actual
        let tiempoFormateado = 'En curso';
        if (tiempoMilisegundos) {
          const horas = Math.floor(tiempoMilisegundos / 3600000).toString().padStart(2, '0');
          const minutos = Math.floor((tiempoMilisegundos % 3600000) / 60000).toString().padStart(2, '0');
          const segundos = Math.floor((tiempoMilisegundos % 60000) / 1000).toString().padStart(2, '0');
          tiempoFormateado = `${horas}:${minutos}:${segundos}`;
        }

        datosClasificacion.push({
          'Puesto Gral.': puestoGeneral,
          'Dorsal': dorsal,
          'Atleta': corredorNombre,
          'DNI': dni,
          'Distancia': nombreDistancia,
          'Categoría': categoriaNombre,
          'Estado Clasificación': clasificacion?.estado ?? 'Pendiente',
          'Tiempo': tiempoFormateado,
        });
      });
    });

    // Ordenar por puesto general (los que tienen número primero, luego pendientes)
    datosClasificacion.sort((a, b) => {
      if (typeof a['Puesto Gral.'] === 'number' && typeof b['Puesto Gral.'] === 'number') {
        return a['Puesto Gral.'] - b['Puesto Gral.'];
      }
      return 0;
    });

    // 3. Crear el libro y la hoja de Excel
    const worksheet = XLSX.utils.json_to_sheet(datosClasificacion);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clasificación en Vivo');

    // 4. Asegurar que la carpeta fija exista
    const backupDir = process.env.BACKUP_DIR || './backups/carreras';
    const dirAbsoluta = path.resolve(backupDir);
    if (!fs.existsSync(dirAbsoluta)) {
      fs.mkdirSync(dirAbsoluta, { recursive: true });
    }

    // 5. Generar archivo con marca de tiempo exacta de la clasificación
    const fechaTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreArchivo = `clasificacion_${carrera.nombre.replace(/\s+/g, '_')}_${fechaTimestamp}.xlsx`;
    const rutaCompleta = path.join(dirAbsoluta, nombreArchivo);

    XLSX.writeFile(workbook, rutaCompleta);
    console.log(`[Backup Clasificación] Respaldo en vivo guardado: ${rutaCompleta}`);

    return rutaCompleta;
  } catch (error) {
    console.error('[Backup Clasificación] Error al generar el Excel de clasificación:', error);
    return null;
  }
}

/**
 * Inicia el ciclo automático cada 5 minutos de la clasificación en curso
 */
export function iniciarMonitoreoBackup(carreraId: string) {
  if (intervaloBackup) {
    clearInterval(intervaloBackup);
  }

  console.log(`[Backup Clasificación] Monitoreo en vivo iniciado para la carrera ID: ${carreraId}`);

  intervaloBackup = setInterval(async () => {
    const carreraActual = await prisma.carrera.findUnique({ where: { id: carreraId } });
    
    if (!carreraActual || carreraActual.estado !== 'En_curso') {
      console.log('[Backup Clasificación] La carrera ya finalizó o cambió de estado. Deteniendo.');
      detenerMonitoreoBackup();
      return;
    }

    await generarBackupExcel(carreraId);
  }, INTERVALO_MS);
}

export function detenerMonitoreoBackup() {
  if (intervaloBackup) {
    clearInterval(intervaloBackup);
    intervaloBackup = null;
    console.log('[Backup Clasificación] Monitoreo detenido.');
  }
}