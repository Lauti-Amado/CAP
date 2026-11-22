# [05] - Visibilidad y distribución de las claves de respaldo

- **Afecta:** backend, frontend y sistema web
- **Estado:** aplicado

## Contexto y problemática
Las claves de respaldo permiten a un Clasificador ingresar con su email cuando no puede usar su contraseña, por ejemplo sin conexión. Se generan en la web al asignar el rol, y el sistema local repone hasta 8 cuando quedan menos de 2 en las 48 horas previas a una carrera (`claveRespaldo.job.ts`).

Se guardan de dos formas (`claveRespaldo.util.ts`): `claveHash` (HMAC-SHA256, para validar sin descifrar) y `claveCifrada` (AES-256-GCM, para que el Administrador pueda volver a verlas).

Hay que cumplir dos cosas a la vez:
- Un Clasificador sin internet **tiene que poder ingresar** con cualquiera de sus claves, en cualquier equipo.
- Ningún Clasificador debe poder **ver** las claves.

## Decisión
- **Solo el Administrador ve el valor de las claves**, en el sistema local (`ClavesRespaldoModal`) y donde la web lo ofrezca. Ningún Clasificador las ve.
- **`claveCifrada` solo se descarga al equipo del Administrador.** Los equipos de Clasificador nunca la reciben.
- **Todos los equipos descargan el `claveHash`** de las claves de las cuentas de Clasificador, junto con esos usuarios (email, estado, rol), para validar sin conexión el ingreso de contingencia de cualquier Clasificador en cualquier equipo.
- **Las claves se almacenan en la web** (decisión [04]). Las generadas en local se suben con `claveCifrada` incluido.
- El flujo de ingreso de contingencia no cambia: email y clave; la clave se normaliza, se hashea y se compara contra `claveHash`.

## Consecuencias
- `sync-rules.md` descarga distinto según el rol (ver `claves_respaldo` y `usuarios_personal`).
- El Clasificador pasa a descargar los usuarios de otros Clasificadores (email, estado, rol), necesarios para identificar el email al ingresar por contingencia.
- No hay cambios de código en el backend ni en el frontend: la lógica actual ya funciona así.

## Riesgos a evaluar
No bloquean la decisión.
- **Un solo secreto para dos usos.** `CLAVES_RESPALDO_SECRET` firma el HMAC y cifra con AES, y está en todos los equipos. Convendría usar un secreto distinto para cada uso.
- **Fuerza bruta sin conexión.** Una clave tiene 32⁸ ≈ 1,1 × 10¹² combinaciones. Quien obtenga el secreto y los hashes de un equipo puede probar combinaciones, porque HMAC-SHA256 es muy rápido. Una mitigación es reemplazarlo por un hash lento con sal (scrypt o argon2), buscando por cuenta (el login ya incluye el email) en vez de por hash.
- **Equipos compartidos.** Una notebook sincronizada por un Administrador conserva `claveCifrada` en disco. Si después la usa un Clasificador, esos datos siguen ahí.
- **Claves repuestas en un equipo de Clasificador.** El job puede ejecutarse en cualquier equipo, así que una clave repuesta existe con `claveCifrada` en ese equipo hasta que se sube y vuelve a descargarse sin esa columna (verificación 8 del spike [03]).