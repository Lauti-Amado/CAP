# Claves de respaldo: lo que debe implementar el sistema web

## Quién las recibe
Cada cuenta activa con rol **Clasificador y sin rol Administrador** tiene **8 claves** de uso único. Se generan al asignar el rol (y, una única vez, para las cuentas que ya lo tengan). Si una cuenta pasa a ser Administrador o se desactiva, sus claves dejan de servir (el sistema local lo valida).

## Tablas (idénticas a las del sistema de clasificaciones)
- `ClaveRespaldo`: `id` (UUID), `claveCifrada`, `claveHash` (único), `estado` (Disponible | Utilizada | Invalidada), `fechaHoraUso` (opcional), `usuarioId`, `fechaHoraCreacion`.
- `UsoClaveRespaldo`: `id` (UUID), `claveId`, `fechaHoraUso`. Una fila por cada vez que se usó una clave.

## Formato y almacenamiento
- Formato `XXXX-XXXX`, alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sin 0, O, 1, I).
- `claveCifrada`: AES-256-GCM con `CLAVES_RESPALDO_SECRET` (32 bytes en hexadecimal), guardado como `iv.tag.cifrado` en base64.
- `claveHash`: HMAC-SHA256, en hexadecimal, del texto normalizado (mayúsculas y solo A-Z y 0-9), con el mismo secreto.
- La referencia exacta está en `backend/src/utils/claveRespaldo.util.ts`: conviene usar el mismo código.
- El `CLAVES_RESPALDO_SECRET` debe ser el mismo en la web y en todos los equipos.

## Visibilidad (decisión [05])
- Solo el Administrador ve el valor de las claves. Ningún Clasificador las ve.
- `claveCifrada` se descarga únicamente al equipo del Administrador. Los equipos de Clasificador solo reciben `claveHash` y el estado.
- Los equipos locales validan el ingreso de contingencia con `claveHash`.
- La web decide si ofrece su propia pantalla de consulta para el Administrador. Si lo hace, debe usar el mismo secreto de cifrado.

## Sincronización
- El Clasificador descarga el hash y el estado de las claves de todas las cuentas de Clasificador, para que cualquiera pueda ingresar en cualquier equipo.
- El sistema local escribe: el cambio de `estado` a Utilizada o Invalidada, `fechaHoraUso`, las filas de `UsoClaveRespaldo` y las claves repuestas (con `claveCifrada`).
- La web no debe borrar claves usadas ni anuladas. Si una clave tiene más de un `UsoClaveRespaldo`, se usó en dos equipos sin conexión.

## Respaldo local
Si en las 48 horas previas a una carrera una cuenta tiene menos de 2 claves disponibles, el sistema local genera hasta completar 8. Para evitar claves repetidas, la web debería generarlas antes de esa ventana.