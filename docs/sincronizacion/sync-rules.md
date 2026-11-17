# Sync rules: filtrado de filas y columnas

## Criterios de sincronización

- **Validación de rol:** El token incluye `roles` como un array. La forma exacta de evaluarlo dentro de la sync rule se valida en el spike de PowerSync, priorizando operadores nativos de pertenencia sobre comparaciones de texto.
- **Alcance general:** Solo sincronizan datos los usuarios con rol `Administrador` o `Clasificador`. Cualquier otro rol (por ejemplo, `Tesorero`) no recibe ninguna fila.
- **Usuarios del CAP:** El `Administrador` sincroniza los usuarios con rol `Administrador` o `Clasificador`, mientras que el `Clasificador` solo descarga su propio registro de usuario. No se descarga ningún otro usuario de la base de datos web ni los hashes de contraseña o credenciales.
- **Permisos de Administrador:** Descarga la totalidad de las tablas operativas, administrativas, comerciales, de entrega de kits y de certificados.
- **Permisos de Clasificador:** Descarga únicamente las tablas necesarias para seleccionar la carrera activa, gestionar inscripciones (incluyendo condición de socio en `Afiliacion`, pertenencia a `Equipo` y el registro o consulta de artículos asociados mediante `Compra`, `DetalleCompra`, `Producto` y `ProductoVariante`), controlar y registrar aptos médicos (aprobación y fecha de vencimiento), realizar la entrega de kits, identificar participantes con su dorsal o chip y gestionar la clasificación y los resultados. No accede a certificados, plantillas, comprobantes de pago ni gestión de otros usuarios.
- **Filtrado de filas en Carreras:** El `Administrador` descarga todas las carreras; el `Clasificador` solo descarga aquellas que se encuentran en un estado habilitado para operar y clasificar.
- **Filtrado de columnas:** En `AptoMedico` no se descarga `archivoUrl` (link a archivo) para evitar replicar contenido pesado en las notebooks, y en `Usuario` se seleccionan explícitamente las columnas no sensibles.

## Tablas a sincronizar por rol

| Tabla | Rol con acceso | Filas | Columnas |
|---|---|---|---|
| `Usuario` | Administrador y Clasificador | Personal para Admin; solo el propio para Clasificador | `id`, `email`, `nombre`, `activo`, `personaId` (sin credenciales) |
| `UsuarioRol`, `RolAdministrativo` | Administrador y Clasificador | Personal para Admin; solo el propio para Clasificador | Todas |
| `Carrera` | Administrador y Clasificador | Todas para Admin; solo estados habilitados para Clasificador | Todas |
| `DistanciaCarrera`, `Distancia`, `Lugar`, `Localidad` | Administrador y Clasificador | Todas | Todas |
| `Persona`, `Corredor`, `Afiliacion`, `Equipo`, `Inscripcion` | Administrador y Clasificador | Todas | Todas |
| `Compra`, `DetalleCompra`, `Producto`, `ProductoVariante` | Administrador y Clasificador | Todas | Todas |
| `AptoMedico` | Administrador y Clasificador | Todas | `id`, `aprobado`, `fechaVencimiento`, `corredorId`, `fechaCreacion` (sin `archivoUrl`) |
| `EntregaKit`, `Dorsal`, `Chip`, `LecturaRFID`, `LectorRFID` | Administrador y Clasificador | Todas | Todas |
| `Clasificacion`, `Resultado`, `ResultadoCategoria` | Administrador y Clasificador | Todas | Todas |
| `Categoria`, `CriterioCategoria` | Administrador y Clasificador | Todas | Todas |
| `Comprobante` | Solo Administrador | Todas | Todas |
| `CertificadoCarrera`, `PlantillaCertificado` | Solo Administrador | Todas | Todas |

## Sync rules

```yaml
config:
  edition: 3

streams:
  # 1. Usuarios del personal: Admin descarga todo el personal; Clasificador solo su propio usuario
  usuarios_personal:
    auto_subscribe: true
    queries:
      - |
        SELECT u.id, u.email, u.nombre, u.activo, u.personaId
        FROM Usuario u
        WHERE u.id IN (
          SELECT ur.usuarioId
          FROM UsuarioRol ur
          JOIN RolAdministrativo ra ON ra.id = ur.rolAdministrativoId
          WHERE ra.rol IN ('Administrador', 'Clasificador')
        )
        AND (
          auth.jwt() ->> 'roles' LIKE '%Administrador%'
          OR (auth.jwt() ->> 'roles' LIKE '%Clasificador%' AND u.id = auth.user_id())
        )
      - |
        SELECT ur.*
        FROM UsuarioRol ur
        JOIN RolAdministrativo ra ON ra.id = ur.rolAdministrativoId
        WHERE ra.rol IN ('Administrador', 'Clasificador')
        AND (
          auth.jwt() ->> 'roles' LIKE '%Administrador%'
          OR (auth.jwt() ->> 'roles' LIKE '%Clasificador%' AND ur.usuarioId = auth.user_id())
        )
      - |
        SELECT *
        FROM RolAdministrativo
        WHERE rol IN ('Administrador', 'Clasificador')
        AND (
          auth.jwt() ->> 'roles' LIKE '%Administrador%'
          OR auth.jwt() ->> 'roles' LIKE '%Clasificador%'
        )

  # 2. Datos operativos compartidos (Administrador y Clasificador): inscripciones, compras/productos, socios, equipos, aptos, kits y clasificación
  datos_clasificacion:
    auto_subscribe: true
    queries:
      # Admin descarga todas las carreras; Clasificador solo las que están en estado clasificable
      - |
        SELECT * FROM Carrera
        WHERE auth.jwt() ->> 'roles' LIKE '%Administrador%'
           OR (auth.jwt() ->> 'roles' LIKE '%Clasificador%' AND estado IN ('EN_CURSO', 'FINALIZADA', 'PUBLICADA'))
      - |
        SELECT id, aprobado, fechaVencimiento, corredorId, fechaCreacion
        FROM AptoMedico
        WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM DistanciaCarrera   WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Distancia          WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Lugar              WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Localidad          WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Persona            WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Corredor           WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Afiliacion         WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Equipo             WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Inscripcion        WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Compra             WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM DetalleCompra      WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Producto           WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM ProductoVariante   WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM EntregaKit         WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Dorsal             WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Chip               WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM LecturaRFID        WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM LectorRFID         WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Clasificacion      WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Resultado          WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM ResultadoCategoria WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM Categoria          WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')
      - SELECT * FROM CriterioCategoria  WHERE (auth.jwt() ->> 'roles' LIKE '%Administrador%' OR auth.jwt() ->> 'roles' LIKE '%Clasificador%')

  # 3. Datos exclusivos de Administrador: comprobantes de pago y certificados
  datos_administrador:
    auto_subscribe: true
    queries:
      - SELECT * FROM Comprobante          WHERE auth.jwt() ->> 'roles' LIKE '%Administrador%'
      - SELECT * FROM CertificadoCarrera   WHERE auth.jwt() ->> 'roles' LIKE '%Administrador%'
      - SELECT * FROM PlantillaCertificado WHERE auth.jwt() ->> 'roles' LIKE '%Administrador%'
```

### Qué se consigue

- **Separación de permisos por rol:** El `Administrador` descarga todas las tablas operativas y de gestión, mientras que el `Clasificador` recibe únicamente los datos necesarios para inscripciones, compras vinculadas a la inscripción y sus productos/variantes, verificación de socios y equipos, control de apto médico, entrega de kits, cronometraje y resultados, sin acceder a certificados, comprobantes de pago ni gestión de otros usuarios.
- **Bloqueo total a otros roles:** Al incluir la validación del token en todas las consultas (incluidas `UsuarioRol` y `RolAdministrativo`), cualquier otro rol como `Tesorero` no recibe ninguna fila.
- **Corrección de precedencia en filtros:** Las condiciones `OR` de roles están agrupadas entre paréntesis para no invalidar los filtros de subconsulta o estado de carrera.
- **Optimización y seguridad local:** `AptoMedico` se sincroniza sin `archivoUrl` para evitar replicar archivos pesados en las notebooks y `Usuario` excluye hashes de contraseña.

### A validar en el spike de PowerSync

- **Evaluación del array `roles` del token:** `LIKE '%Rol%'` es un reemplazo provisorio. En Sync Rules Edition 3 conviene validar el uso de pertenencia directa al arreglo (por ejemplo, `'Administrador' IN token_parameters.roles`) o incluir un claim simple en el JWT.
- **Soporte de subconsultas y joins:** Verificar que las subconsultas `IN (SELECT ...)` y los `JOIN` en `usuarios_personal` estén soportados dentro del stream.
- **Estados de `Carrera` para el Clasificador:** Ajustar la lista de estados (`EN_CURSO`, `FINALIZADA`, `PUBLICADA`) según los valores exactos definidos en el esquema para las carreras habilitadas para clasificación y entrega de kits.
- **Alcance de `Comprobante` y `ClaveRespaldo`:** Definir si `Comprobante` es necesario localmente para el `Administrador` o si puede omitirse, y validar cómo se sincronizan las claves de respaldo para el acceso de contingencia.