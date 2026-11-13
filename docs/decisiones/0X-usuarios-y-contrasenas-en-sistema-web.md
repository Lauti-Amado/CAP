# [0X] - Los usuarios y sus contraseñas se gestionan solo en el sistema web

- **Afecta:** frontend y backend
- **Estado:** aplicado

## Contexto y problemática
El personal del sistema (Administradores y Clasificadores) se crea originalmente en el sistema web, y sus datos se sincronizan a la base local. La contraseña (`passwordHash`) es un dato del sistema web.

Si el sistema local pudiera crear usuarios o cambiar contraseñas, habría dos fuentes de verdad y conflictos al sincronizar. Además, durante una carrera no hay internet, por lo que no se puede recuperar una contraseña por correo.

## Decisión
- El sistema de clasificaciones **no crea usuarios ni cambia contraseñas**. Crear un usuario y restablecer o cambiar una contraseña se hace siempre en el sistema web. Por eso no existe el botón "Nuevo usuario".
- Sí gestiona los **roles** de usuarios existentes (tabla `UsuarioRol`, un usuario puede tener varios), y solo un Administrador puede hacerlo. Los roles que no administra este sistema (por ejemplo, Tesorero) se respetan sin cambios. Un Administrador no puede quitarse a sí mismo ese rol.
- Para el caso sin conexión, existen las **claves de respaldo de uso único**: un Administrador genera un lote de 8, que se guardan cifradas (AES-256-GCM) y se sincronizan al local. Quien las use ingresa desde "Acceso de contingencia" con el email de su cuenta y una clave disponible, y obtiene una sesión de 2 horas con los roles de esa cuenta. La clave queda inutilizable. Generar un lote nuevo anula las claves disponibles del anterior.
- El `CLAVES_RESPALDO_SECRET` debe ser el mismo en todos los equipos y en el sistema web, igual que el `JWT_SECRET`.

Esta decisión reemplaza lo planteado en el Informe 2 sobre un "Administrador Maestro" con PIN que cambia contraseñas en la base local.

## Consecuencias
Si alguien olvida su contraseña el día de la carrera, puede entrar con una clave de respaldo, pero la contraseña en sí se restablece después en el sistema web.