# Parámetros de lectura RFID

Estos parámetros se guardarán en una tabla de configuración **local** de este sistema (no se sincroniza con la web). Se editarán desde "Configuración RFID" en Administración, que hoy está deshabilitada hasta tener los chips.

| Parámetro | Qué es | ¿Se conoce el valor? |
|---|---|---|
| Ventana de deduplicación | Lecturas del mismo chip dentro de este lapso son la misma pasada (el lector repite decenas de lecturas por pasada) | **No.** Sale de probar lecturas reales |
| Criterio de pasada (RSSI o first/last seen) | Qué lectura representa el instante de la pasada | **No.** Se decide con lecturas reales |
| Lecturas mínimas por pasada | Una pasada con menos lecturas que esta cantidad se descarta como lectura falsa | **No.** Sale de ver cuántas lecturas da el lector por pasada |
| Vueltas por distancia | Cantidad de pasadas bajo el arco hasta la llegada, **sin contar la salida**. En las distancias largas, el corredor da vueltas y pasa varias veces por el mismo arco | **Sí, es regla de negocio:** depende de la distancia |
| Tiempo mínimo entre pasadas | Dos pasadas más cercanas se fusionan (repetidos y lecturas falsas) | No. Depende del largo de la vuelta |
| Ventana de largada | Hasta cuándo después del inicio real una pasada se considera la salida del corredor y se ignora | No. Depende de la cantidad de corredores |

## Reglas para evitar repetidos y lecturas falsas
1. Se descartan las lecturas anteriores a la hora real de inicio de la carrera (`EjecucionCarrera.fechaHoraInicio`).
2. Las lecturas cercanas se agrupan en una pasada.
3. Las pasadas demasiado cercanas se fusionan.
4. La llegada es la última pasada válida: la vuelta número N de la distancia, sin contar la salida. Las posteriores se ignoran (el corredor que vuelve caminando).
5. Si hay menos vueltas que N, el resultado queda para revisión: no se lo da por "no finalizó" automáticamente.
6. Los chips que no pertenecen a ningún corredor se guardan aparte, solo para auditoría.

## Decisiones tomadas
- **El tiempo y el puesto oficial son el tiempo bruto**: desde la hora real de inicio de la carrera hasta la llegada. El puesto es el orden de llegada. No se usa el tiempo neto (desde que el corredor cruzó la salida), para que quien llega después no pueda ganarle al primero.