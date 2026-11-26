# Sync rules: filtrado de filas y columnas

Este archivo define **qué se descarga** a cada equipo. Lo que se **sube** lo define el conector de PowerSync (`uploadData`) y no está en estas reglas.

## Criterios de sincronización

- **Validación de rol:** El token que firma el sistema incluye un claim de texto `rol` con el rol de mayor jerarquía del usuario: `Administrador` (aunque también sea Clasificador) o `Clasificador`. Las reglas lo leen con `auth.parameter('rol')`. Como es un único valor, las condiciones de Administrador y de Clasificador son excluyentes y no hace falta negarlas. Quien no tiene ninguno de los dos roles no recibe token de sincronización.
- **Alcance general:** Solo sincronizan datos los usuarios con rol `Administrador` o `Clasificador`. Cualquier otro rol (por ejemplo, `Tesorero`) no recibe ninguna fila.
- **Usuarios del CAP:** El `Administrador` sincroniza los usuarios con rol `Administrador` o `Clasificador`. El `Clasificador` sincroniza los usuarios con rol `Clasificador`, necesarios para el ingreso de contingencia de cualquier Clasificador en cualquier equipo (decisión [05]). No se descarga ningún otro usuario de la base de datos web.
- **Credenciales:** `Usuario.passwordHash` se descarga junto con cada usuario del personal, porque el login local compara contra el hash local (`bcrypt.compare`; ver `docs/arquitectura/decisiones/04-usar-auth-cookies.md` y `docs/decisiones/01-usuarios-y-contrasenas-en-sistema-web.md`). Nunca se descargan hashes de usuarios que no son del personal.
- **Permisos de Administrador:** Descarga la totalidad de las tablas operativas, administrativas, comerciales, de entrega de kits y de certificados.
- **Permisos de Clasificador:** Descarga únicamente las tablas necesarias para seleccionar la carrera activa, gestionar inscripciones (incluyendo condición de socio en `Afiliacion`, pertenencia a `Equipo` y el registro o consulta de artículos asociados mediante `Compra`, `DetalleCompra`, `Producto` y `ProductoVariante`), controlar y registrar aptos médicos (aprobación y fecha de vencimiento), realizar la entrega de kits, identificar participantes con su dorsal o chip y gestionar la clasificación y los resultados. No accede a certificados, plantillas ni gestión de otros usuarios. Solo descarga los comprobantes de pagos presenciales, que se generan en el propio sistema al inscribir; los de pagos virtuales los gestiona la web y no se descargan.
- **Filtrado de filas en Carreras:** El `Administrador` descarga todas las carreras; el `Clasificador` solo descarga las que tienen estado `Activa`, `Entrega_kits`, `En_curso` o `Finalizada`, que son los estados en los que el backend permite inscribir, entregar kits, clasificar o consultar resultados.
- **Filtrado de columnas:** En `AptoMedico` no se descarga `archivoUrl` (link a archivo) para evitar replicar contenido pesado en las notebooks, y en `Usuario` se seleccionan explícitamente las columnas necesarias (`passwordHash` incluido, solo para el personal).

## Tablas a sincronizar por rol

| Tabla | Rol con acceso | Filas | Columnas |
|---|---|---|---|
| `Usuario` | Administrador y Clasificador | Personal para Admin; solo usuarios con rol Clasificador para Clasificador | `id`, `email`, `passwordHash`, `estado`, `personaId` |
| `UsuarioRol`, `RolAdministrativo` | Administrador y Clasificador | Mismo alcance que `Usuario` | Todas |
| `Carrera` | Administrador y Clasificador | Todas para Admin; solo estados habilitados para Clasificador | Todas |
| `DistanciaCarrera`, `Distancia`, `Lugar`, `Localidad` | Administrador y Clasificador | Todas | Todas |
| `Persona`, `Corredor`, `Afiliacion`, `Equipo`, `Inscripcion` | Administrador y Clasificador | Todas | Todas |
| `Compra`, `DetalleCompra`, `Producto`, `ProductoVariante` | Administrador y Clasificador | Todas | Todas |
| `AptoMedico` | Administrador y Clasificador | Todas | `id`, `aprobado`, `fechaVencimiento`, `corredorId`, `fechaCreacion` (sin `archivoUrl`) |
| `EntregaKit`, `Dorsal`, `Chip`, `LecturaRFID`, `LectorRFID` | Administrador y Clasificador | Todas | Todas |
| `Clasificacion`, `Resultado`, `ResultadoCategoria` | Administrador y Clasificador | Todas | Todas |
| `Categoria`, `CriterioCategoria` | Administrador y Clasificador | Todas | Todas |
| `Comprobante` | Administrador y Clasificador | Todos para Admin; solo los de compras con `Pago_presencial` para Clasificador | Todas |
| `CertificadoCarrera`, `PlantillaCertificado` | Solo Administrador | Todas | Todas |
| `EjecucionCarrera` | Administrador y Clasificador | Todas | Todas |
| `ClaveRespaldo` | Administrador y Clasificador | Todas | Administrador: todas. Clasificador: todas menos `claveCifrada` |
| `UsoClaveRespaldo` | Solo Administrador | Todas | Todas |

## Tablas y columnas que no se descargan

| Elemento | Motivo |
|---|---|
| `EntidadEmisora` | Tabla propia de la web (entidades de los comprobantes de pago). Ningún equipo local la necesita. |
| `Comprobante` de pagos virtuales para el Clasificador | Contienen datos del titular del pago y los gestiona la web. |
| `UsoClaveRespaldo` para el Clasificador | El equipo la escribe y la sube, pero no necesita leerla. |
| `ClaveRespaldo.claveCifrada` para el Clasificador | Ningún Clasificador debe poder ver las claves (decisión [05]). |
| `AptoMedico.archivoUrl` | Evita replicar archivos pesados en las notebooks. |
| `LecturaHuerfana` | Lecturas de EPC sin chip asociado, para monitoreo y auditoría. Los equipos la escriben y la suben; ninguno necesita leerla de otro. |

Nota: `Comprobante` tiene una FK opcional a `EntidadEmisora`. Como esa tabla no se descarga, `Comprobante.entidadEmisoraId` queda sin fila local referenciada y la pantalla no debe asumir que existe.

## Sync rules

```yaml
config:
  edition: 3

streams:
  # 1. Usuarios del personal: Admin descarga todo el personal; Clasificador solo los usuarios con rol Clasificador
  usuarios_personal:
    auto_subscribe: true
    queries:
      - |
        SELECT u.id, u.email, u.passwordHash, u.estado, u.personaId
        FROM Usuario u
        WHERE (
          auth.parameter('rol') = 'Administrador'
          AND u.id IN (
            SELECT ur.usuarioId
            FROM UsuarioRol ur
            JOIN RolAdministrativo ra ON ra.id = ur.rolAdministrativoId
            WHERE ra.rol IN ('Administrador', 'Clasificador')
          )
        ) OR (
          auth.parameter('rol') = 'Clasificador'
          AND u.id IN (
            SELECT ur.usuarioId
            FROM UsuarioRol ur
            JOIN RolAdministrativo ra ON ra.id = ur.rolAdministrativoId
            WHERE ra.rol = 'Clasificador'
          )
        )
      - |
        SELECT ur.*
        FROM UsuarioRol ur
        JOIN RolAdministrativo ra ON ra.id = ur.rolAdministrativoId
        WHERE (auth.parameter('rol') = 'Administrador' AND ra.rol IN ('Administrador', 'Clasificador'))
           OR (auth.parameter('rol') = 'Clasificador' AND ra.rol = 'Clasificador')
      - |
        SELECT *
        FROM RolAdministrativo
        WHERE rol IN ('Administrador', 'Clasificador')
        AND (
          auth.parameter('rol') = 'Administrador'
          OR auth.parameter('rol') = 'Clasificador'
        )

  # 2. Datos operativos compartidos (Administrador y Clasificador): inscripciones, compras/productos, socios, equipos, aptos, kits y clasificación
  datos_clasificacion:
    auto_subscribe: true
    queries:
      # Admin descarga todas las carreras; Clasificador solo las que operan o consultan (ver criterios)
      - |
        SELECT * FROM Carrera
        WHERE auth.parameter('rol') = 'Administrador'
           OR (auth.parameter('rol') = 'Clasificador' AND estado IN ('Activa', 'Entrega_kits', 'En_curso', 'Finalizada'))
      - |
        SELECT id, aprobado, fechaVencimiento, corredorId, fechaCreacion
        FROM AptoMedico
        WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      # Clasificador (sin rol Administrador): solo los comprobantes de pagos presenciales, que se generan en este sistema
      - |
        SELECT c.*
        FROM Comprobante c
        JOIN Compra co ON co.id = c.compraId
        WHERE auth.parameter('rol') = 'Clasificador'
          AND co.metodoPago = 'Pago_presencial'
      - SELECT * FROM DistanciaCarrera   WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Distancia          WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Lugar              WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Localidad          WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Persona            WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Corredor           WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Afiliacion         WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Equipo             WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Inscripcion        WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Compra             WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM DetalleCompra      WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Producto           WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM ProductoVariante   WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM EntregaKit         WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Dorsal             WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Chip               WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM LecturaRFID        WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM LectorRFID         WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Clasificacion      WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Resultado          WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM ResultadoCategoria WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM Categoria          WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM CriterioCategoria  WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')
      - SELECT * FROM EjecucionCarrera   WHERE (auth.parameter('rol') = 'Administrador' OR auth.parameter('rol') = 'Clasificador')

  # 3. Claves de respaldo: `claveCifrada` solo se descarga al Administrador (decisión 05)
  claves_respaldo:
    auto_subscribe: true
    queries:
      # Administrador: todo, incluida claveCifrada
      - SELECT * FROM ClaveRespaldo     WHERE auth.parameter('rol') = 'Administrador'
      - SELECT * FROM UsoClaveRespaldo  WHERE auth.parameter('rol') = 'Administrador'
      # Clasificador (sin rol Administrador): hash y estado, nunca claveCifrada
      - |
        SELECT id, claveHash, estado, fechaHoraUso, usuarioId, fechaHoraCreacion
        FROM ClaveRespaldo
        WHERE auth.parameter('rol') = 'Clasificador'

  # 4. Datos de Administrador: todos los comprobantes de pago, certificados y plantillas
  datos_administrador:
    auto_subscribe: true
    queries:
      - SELECT * FROM Comprobante          WHERE auth.parameter('rol') = 'Administrador'
      - SELECT * FROM CertificadoCarrera   WHERE auth.parameter('rol') = 'Administrador'
      - SELECT * FROM PlantillaCertificado WHERE auth.parameter('rol') = 'Administrador'
```

### Qué se consigue

- **Separación de permisos por rol:** El `Administrador` descarga todas las tablas operativas y de gestión, mientras que el `Clasificador` recibe únicamente los datos necesarios para inscripciones, compras vinculadas a la inscripción y sus productos/variantes, verificación de socios y equipos, control de apto médico, entrega de kits, cronometraje y resultados, sin acceder a certificados ni gestión de otros usuarios, y solo con los comprobantes de pagos presenciales.
- **Bloqueo total a otros roles:** Al incluir la validación del token en todas las consultas (incluidas `UsuarioRol` y `RolAdministrativo`), cualquier otro rol como `Tesorero` no recibe ninguna fila.
- **Corrección de precedencia en filtros:** Las condiciones `OR` de roles están agrupadas entre paréntesis para no invalidar los filtros de subconsulta o estado de carrera.
- **Optimización y seguridad local:** `AptoMedico` se sincroniza sin `archivoUrl` para evitar replicar archivos pesados en las notebooks.

## A validar en el servicio de PowerSync

- **Que el validador acepte las streams:** `auth.parameter('rol')`, el `IN (SELECT ... JOIN ...)` anidado de `usuarios_personal` y el join de `Comprobante` con `Compra`.
- **Varias queries por stream:** deben usar parámetros compatibles. Si una stream no lo cumple, se divide.
- **Versión del servicio:** debe incluir la corrección del aviso GHSA-q6wc-xx4m-92fj.

## A confirmar con la web

- **Algoritmo de `passwordHash`:** el login local usa `bcrypt.compare`, así que la web debe generar los hashes con bcrypt (por ejemplo, `$2a$` o `$2b$`).
- Emitir en el token de sincronización el claim rol (Administrador o Clasificador).