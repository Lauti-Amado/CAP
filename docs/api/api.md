# API
Actualmente, el backend tiene conectadas las rutas de autenticación bajo el prefijo `/api/auth`, definidas en `usuario.routes.ts`. Los endpoints de carreras, corredores, inscripciones, entrega de kits, clasificación y datos auxiliares documentados en este README representan las rutas previstas para el desarrollo. Para implementarlas, será necesario incorporar las rutas, los controladores y los servicios correspondientes. Por lo tanto, los endpoints propuestos no deben considerarse implementados hasta que se encuentren integrados en el backend.

## Convención de endpoints de la API

Todas las rutas de la API deberán comenzar con el prefijo /api/ y utilizar nombres de entidades en plural, escritos en minúsculas.

### Formato general

`/api/entidades`

### Métodos HTTP

| Método | Uso | Ejemplo |
|---|---|---|
| `GET` | Consultar o listar inscripciones | `/api/inscripciones` |
| `POST` | Registrar una inscripción | `/api/inscripciones` |
| `PUT` | Reemplazar o actualizar una inscripción | `/api/inscripciones/{id}` |
| `PATCH` | Actualizar parcialmente una inscripción | `/api/inscripciones/{id}` |
| `DELETE` | Eliminar una inscripción | `/api/inscripciones/{id}` |

Para consultar un recurso específico, se utilizará su identificador en la ruta. Por ejemplo:

`GET /api/carreras/{id}`

### Criterios de nomenclatura

- Utilizar siempre el prefijo /api/.

- Nombrar las rutas con sustantivos en plural y en minúsculas.

- Utilizar el método HTTP correspondiente a cada operación.

- Evitar incluir verbos de acción en las rutas cuando el método HTTP ya indique la operación.

- Mantener una nomenclatura uniforme en todos los módulos.

- Documentar los parámetros, las respuestas y los permisos correspondientes a cada endpoint a medida que se implementen.

Importante: las rutas de esta sección son propuestas de diseño y no implican que los endpoints ya estén implementados.