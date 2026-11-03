# [03] - Utilizar DTO para return de datos

- **Afecta:** backend
- **Estado:** aplicado

## Contexto y problemática
Un ***DTO (Data Transfer Objects)*** es un objeto plano y simple que se utiliza para transportar datos entre diferentes capas de una aplicación (por ejemplo, entre backend y frontend).

Al intentar transferirle al frontend información sacada de la base de datos, es crucial que no se retorne el mismo datos con la que esta trabaja. 

Por otro lado, definir un único tipo de dato a retornar a modo de contrato facilita el conocimiento que el frontend tiene sobre los datos que recibirá y es altamente necesario. 

Finalmente, se da código repetitivo en los services del backend al intentar mapear de Prisma a objeto retornado.

## Decisión
Creación de una carpeta `dtos` (`/backend/src/dtos`) en donde:
- Se importa el tipo de dato que se quiere devolver en la API a como Prisma lo devuelve (`const CarreraPrisma = Prisma.CarreraGetPayload`)
- Se definen los tipos de datos a como se los quiere devolver con sufijo 'DTO' (por ejemplo, `CarreraDTO`)
- Se crea una función que acepta como parámetro el tipo de dato que Prisma devuelve, y se retorna el tipo de dato definido con sufijo DTO (por ejemplo, `toCarreraDto(carrera: CarreraPrisma): CarreraDTO`)

Luego, los services pueden retornar siempre el tipo de dato definido (`CarreraDTO`), y utilizar la función mapper (`toCarreraDto()`) para retornar datos.