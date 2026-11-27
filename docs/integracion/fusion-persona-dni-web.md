# Personas creadas presencialmente y su vínculo con una cuenta web

## Caso principal: la persona corre sin cuenta y se registra después
Una persona puede inscribirse presencialmente sin tener cuenta web. El sistema local crea su `Persona` y sus datos de esa carrera (`Corredor`, `Inscripcion`, etc.). El schema lo contempla: el comentario de `Persona.usuario` indica que, si después quiere cuenta, debe vincularla con su persona.

El vínculo lo resuelve **el sistema web** al registrar la cuenta. El sistema local no hace nada.

### Contrato para la web
Al registrarse alguien con el DNI X:

1. Buscar una `Persona` con `dni = X`.
2. Si existe y **no tiene `Usuario`**: asignar `Usuario.personaId` a esa Persona. **No crear otra Persona.** La cuenta hereda sus carreras previas.
3. Si existe y **ya tiene `Usuario`**: el DNI ya está registrado; informar.
4. Si no existe: crear la Persona.

Notas:
- La clave de búsqueda es el **DNI** (`Persona.dni` es único). `Persona` no tiene email: el email solo está en `Usuario`, por eso no sirve para encontrar a quien corrió sin cuenta.
- Debemos confirmar la identidad antes de vincular (por ejemplo, que nombre y apellido coincidan). Si no, cualquiera que conozca un DNI heredaría su historial.

## Caso excepcional: dos Personas con el mismo DNI
Puede ocurrir si:
- Alguien se registra en la web **después** de la última descarga de un equipo y se inscribe presencialmente en la misma carrera.
- Dos equipos sin conexión dan de alta el mismo DNI.

Cada una se crea con su propio `id`. La web rechaza la segunda por `dni` repetido, y como la cola de subida de PowerSync es FIFO y bloqueante, ese rechazo frena todo lo que está detrás.

### Política
- Gana la Persona que ya existe en el servidor (la canónica). La otra es la duplicada.
- Los datos personales (`nombre`, `apellido`, `telefono`) se toman de la canónica.
- Si ninguna está aún en el servidor, la primera que llegue es la canónica.
- La duplicada se elimina después de repuntar todo lo que la referencia.

### Referencias a repuntar

| Referencia a la duplicada | Acción |
|---|---|
| `Corredor.contactoEmergenciaId` | Repuntar a la canónica |
| `Usuario.personaId` | Repuntar. Si ambas tienen Usuario: conflicto manual |
| `Corredor.personaId` | Repuntar. Si ambas tienen Corredor: fusionar Corredores |

Fusión de Corredores:

| Referencia al Corredor duplicado | Acción |
|---|---|
| `AptoMedico.corredorId` | Repuntar todos |
| `Afiliacion.afiliadoId` | Repuntar. Si ambos son socios: conflicto manual |
| `Inscripcion.idCorredor` | Repuntar. Si ambos tienen inscripción en la misma carrera (`@@unique[idCorredor, idCarrera]`): conflicto manual |

Los atributos del Corredor (`fechaNacimiento`, `sexo`, `discapacidad`) se toman del canónico. Prioridad sugerida para una inscripción repetida en la misma carrera: la que tiene `EntregaKit`, luego `Pagada`, luego el resto.

**No se resuelve en silencio lo ambiguo:** los "conflicto manual" se registran y los decide una persona.

### Contrato para la web
1. **No rechazar** el alta de una Persona cuyo DNI ya existe con otro `id`: responder éxito sin aplicarla.
2. **Traducir los ids**: las operaciones siguientes de la misma subida referencian el `id` de la duplicada, que nunca se creó en la web. Traducirlo al de la canónica (por ejemplo, con una tabla de alias `idDuplicado → idCanonico`).
3. En la siguiente descarga llega la canónica; el sistema local la detecta y ejecuta la fusión local.

### Implementación local
Está en `backend/src/rules/fusionPersonas.rules.ts` y `backend/src/services/personaFusion.service.ts`.

- **Detector:** `buscarDnisDuplicados()` agrupa las Personas por `dni` y devuelve las que aparecen más de una vez.
- **Foto de cada Persona:** `cargarResumenPersona(tx, id)` lee la Persona con su usuario, corredor, afiliación, aptos médicos, inscripciones (con su kit entregado) y los corredores que la tienen como contacto de emergencia.
- **Plan:** `planificarFusion(canonica, duplicada)` es una función pura. Recibe esas dos fotos y devuelve la lista ordenada de operaciones (`repuntar`, `eliminar`, `conflicto`), sin tocar la base. Si el plan contiene algún `conflicto`, no se ejecuta ninguna operación (`tieneConflictos`). Las eliminaciones van siempre al final y la Persona duplicada es lo último.
- **Tests:** `backend/tests/fusionPersonas.rules.test.ts` (14 casos; se ejecutan con `npm test`).

Motivos de conflicto: `AMBAS_TIENEN_USUARIO`, `AMBOS_SON_SOCIOS`, `INSCRIPCION_REPETIDA_EN_CARRERA` (con la inscripción sugerida) y `CONTACTO_DE_EMERGENCIA_PROPIO`.

## Pendiente
- **Ejecutor del plan:** escribe con el SDK de PowerSync dentro de una `writeTransaction` (decisión [03], opción A). Depende de la capa de escritura local.
- **Disparador al sincronizar:** una consulta del detector observada con `db.watch()`. Falta comprobar que avise de los cambios que llegan por sync (decisión [03], verificación 10).
- **Registro de conflictos manuales:** decidir dónde se guardan hasta que una persona los resuelva.

## A coordinar con la web
- Implementar el contrato de ambos casos: el vínculo al registrarse una cuenta (caso principal) y la traducción de ids ante un DNI duplicado (caso excepcional).
- Confirmar que la web valida el DNI igual que este sistema: solo dígitos, 7 u 8, sin puntos (`/^\d{7,8}$/`). Este sistema ya lo exige en backend y frontend; si la web guardara otro formato, la búsqueda por DNI no encontraría a la persona.