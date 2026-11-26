# [02] - La hora real de inicio y fin de la carrera se guarda aparte

- **Afecta:** backend y frontend
- **Estado:** aplicado

## Contexto y problemática
`Carrera.fechaHoraCarrera` es la hora **estimada** que publica el sistema web para que los corredores sepan cuándo ir. `Carrera.fechaHoraModificacion` es solo una columna de auditoría. Antes, iniciar la carrera pisaba la hora estimada con la real, y la hora de fin se deducía de la fecha de modificación.

## Decisión
La hora real se guarda en `EjecucionCarrera` (uno a uno con la carrera): `fechaHoraInicio` y `fechaHoraFin` opcional. Es una tabla exclusiva de este sistema: no modifica el schema compartido con la web.

La hora real de inicio sirve para el cronómetro, para calcular el tiempo cuando no se informa uno y, con chips, como referencia para clasificar las lecturas (calentamiento, largada y vueltas). La hora de fin no interviene en el tiempo de ningún corredor.

## Consecuencias
Las carreras iniciadas antes de este cambio no tienen registro: se usan `fechaHoraCarrera` como inicio y `fechaHoraModificacion` como fin.