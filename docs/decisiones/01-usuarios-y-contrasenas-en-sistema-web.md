# [01] - Los usuarios y sus contraseñas se gestionan solo en el sistema web

- **Afecta:** frontend y backend
- **Estado:** aplicado

## Contexto y problemática
El personal del sistema (Administradores y Clasificadores) se crea originalmente en el sistema web, y sus datos se sincronizan a la base local. La contraseña (`passwordHash`) es un dato del sistema web.

Si el sistema local pudiera crear usuarios o cambiar contraseñas, habría dos fuentes de verdad y conflictos al sincronizar. Además, durante una carrera no hay internet, por lo que no se puede recuperar una contraseña por correo.

## Decisión
- El sistema de clasificaciones **no crea usuarios ni cambia contraseñas**. Crear un usuario y restablecer o cambiar una contraseña se hace siempre en el sistema web. Por eso no existe el botón "Nuevo usuario".
- Sí gestiona los **roles** de usuarios existentes (tabla `UsuarioRol`, un usuario puede tener varios), y solo un Administrador puede hacerlo. Los roles que no administra este sistema (por ejemplo, Tesorero) se respetan sin cambios. Un Administrador no puede quitarse a sí mismo ese rol.
- Para el caso sin conexión, existen las **claves de respaldo** de uso único. Cada cuenta de clasificador tiene 8, que genera automáticamente el sistema web al asignarle el rol y se sincronizan al local. Cada clave solo permite ingresar a la cuenta a la que pertenece, y los administradores no las usan: ingresan siempre con su contraseña. Si en las 48 horas previas a una carrera una cuenta tiene menos de 2 claves disponibles, el sistema local repone hasta 8. El administrador solo puede consultarlas. Quien la usa ingresa desde "Acceso de contingencia" con su email y una clave disponible, y obtiene una sesión de 2 horas. Se guardan cifradas (AES-256-GCM) y el `CLAVES_RESPALDO_SECRET` debe ser el mismo en todos los equipos y en la web, igual que el `JWT_SECRET`.

Esta decisión reemplaza lo planteado en el Informe 2 sobre un "Administrador Maestro" con PIN que cambia contraseñas en la base local.

## Consecuencias
Si alguien olvida su contraseña el día de la carrera, puede entrar con una clave de respaldo, pero la contraseña en sí se restablece después en el sistema web.