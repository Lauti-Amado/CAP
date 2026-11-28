# [07] - Trazabilidad de las modificaciones manuales

- **Afecta:** backend y base de datos compartida con el sistema web
- **Estado:** aplicado

## Contexto y problemática
La documentación del proyecto pide dejar registro de quién cambia datos de una carrera:
- Actividad 2, requisitos de seguridad y trazabilidad: "toda modificación manual debe generar un registro en el sistema indicando usuario, fecha y hora".
- Informe 2, modificaciones accidentales o reclamos de corredores: un registro de trazabilidad que guarda qué usuario modificó cada tiempo y/o puesto (o cualquier otro dato), con la fecha y la hora exacta.

El sistema ya tiene una "actividad reciente" (`GET /api/carreras/{id}/actividad`), pero **no es trazabilidad**: se arma al vuelo con kits entregados, inscripciones presenciales y lecturas RFID, no dice quién hizo cada cosa, no guarda el valor anterior y lo que se deshace o se anula desaparece de la lista. Tampoco incluye las clasificaciones cargadas a mano.

Los modelos tenían `//usuarioModificacion` comentado, pero eso solo conservaría al último usuario, sin valor anterior ni historial.

## Decisión
Una tabla nueva, `RegistroModificacion`, **exclusiva de este sistema** (la web la aloja, ver `integracion/tablas-propias-en-web.md`). **Cada fila es un campo modificado**: entidad, id de la fila, acción (creación, modificación o eliminación), campo, valor anterior, valor nuevo, usuario, fecha y hora, y la carrera a la que pertenece.

- Se registran las modificaciones hechas por una persona sobre: clasificación y resultado (tiempo, puesto y estados), entrega de kit (dorsal y chip, al entregar y al deshacer), inscripción (estado, distancia, equipo y monto), datos personales del corredor y su contacto de emergencia, y apto médico.
- Solo se guardan los campos que **realmente cambiaron**. Si no cambió ninguno, no se escribe nada (`registroModificacion.rules.ts`).
- El registro se escribe **dentro de la misma transacción** que la modificación: si una falla, la otra tampoco queda.
- `entidadId` y `carreraId` no son claves foráneas a propósito: el registro debe sobrevivir al borrado de lo que describe. `usuarioId` sí lo es (los usuarios se dan de baja de forma lógica).
- El historial se consulta con `GET /api/carreras/{id}/modificaciones` (paginado, con filtros por entidad, id de la fila y usuario). **Solo lo puede consultar el Administrador.**

## Consecuencias
- La creación de una inscripción presencial no genera filas: ya queda atribuida al usuario por `Compra.usuarioId`.
- La ejecución automática por RFID no es una modificación manual y hoy no genera registro. Cuando la captura cree resultados por su cuenta habrá que decidir cómo se registra (los servicios de clasificación hoy exigen un `usuarioId`).
- Toda funcionalidad nueva que modifique datos a mano (por ejemplo, eliminar una clasificación, CU08.3) debe llamar a `registrarModificacion` dentro de su transacción.
- Con la decisión [03] las escrituras pasarán al SDK de PowerSync: `registrarModificacion` queda como único punto a reemplazar.
- La tabla pertenece al schema compartido: la web debe crearla con las mismas columnas (ver `integracion/tablas-propias-en-web.md`).

## Pendiente de definir
- Si el historial se descarga a los equipos locales o solo se sube a la web (`sincronizacion/sync-rules.md`).
- Cuánto tiempo se conserva el historial.
