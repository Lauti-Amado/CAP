# [06] - El número de chip es el código EPC (texto, único)

- **Afecta:** backend, frontend y base de datos compartida con el sistema web
- **Estado:** aplicado

## Contexto y problemática
`Chip.numero` era un entero (`Int`). Los chips UHF RAIN RFID (EPC Gen2) se identifican con un código EPC hexadecimal de longitud variable, de 96 o 128 bits (24 o 32 dígitos hexadecimales). Un entero no puede guardar ese código, y el lector entrega el EPC completo en cada lectura. Además, nada impedía a nivel de base de datos que dos chips compartieran número: solo lo controlaba el servicio.

## Decisión
`Chip.numero` pasa a `String` con restricción `@unique`. Se valida como hexadecimal de hasta 32 dígitos y se guarda en mayúsculas, para que `e280…` y `E280…` sean el mismo chip. La unicidad la garantiza la base de datos.

El nombre del campo (`numero`, `chipNumero` en la API) no cambia: cambia su tipo en la API, que ahora es texto.

## Consecuencias
- La migración conserva los chips existentes: los números enteros quedan como texto (`1234` pasa a `"1234"`), y las lecturas asociadas no se tocan.
- Quien llame a `PUT /dorsales/:id/chip`, a `POST` de inventario o a `GET /carreras/:id/chips/:numero` debe enviar el chip como texto.
- `Chip` está sincronizada con la base web (ver `sync-rules.md`): la tabla del sistema web debe aplicar el mismo cambio de tipo y la misma restricción para que ambas bases sigan siendo idénticas.