# [01] - Utilizar arquitectura cliente-servidor

- **Afecta:** frontend y backend
- **Estado:** aplicado

## Contexto y problemática
En una **arquitectura cliente-servidor** hay una división entre el fronted (pantallas visibles) y el backend (lógica y motor de la app).

Debido a que el sistema de clasificaciones debe comunicarse con el sistema web (un servidor) y, además, con el sistema de chips RFID (que técnicamente es otro "servidor" más), el sistema de clasificaciones interactuará con estos como un cliente más con accesos privilegiados.

## Decisión
La aplicación tiene una arquitectura cliente-servidor clásica local, dividiendo backend y frontend por separado. Esto pone al sistema de clasificaciones como un servidor propio capaz de recibir requests del usuario mediante su backend, pero además de actuar como un intermediario que intercepta estas requests y las envía, como un cliente, al servidor web / sistema de chips.

El backend de la aplicación es mayormente local (se comunica con el usuario de la máquina que la está utilizando), y el server no tiene un deploy público para que cualquiera pueda acceder a él. En vez, la app envía requests al sistema web que sí es público (por ejemplo, para recuperar información de carreras). Luego, envía información a este mismo mediante endpoints especiales que el mismo sistema web expone para este sistema de clasificaciones, el cual requiere un permiso especial.

En general, esta decisión permite una mayor facilidad del manejo de requests con URLs y conexiones.