# [01] - Utilizar cookies para autenticación en vez de localstorage

- **Afecta:** backend
- **Estado:** aplicado

## Contexto y problemática
La autenticación del sistema web utiliza cookies ***httpOnly***. Con cookies, el usuario no guarda tokens de auth en `localStorage`, sino que es el backend quien le dice al cliente cómo manejarse: el usuario en un principio se autentica, y si las credenciales que este mandó en el body de su request son correctas, entonces el server responde con un header que tiene la propiedad `setCookie`. Al recibirlo, el cliente guarda la cookie internamente, de manera encriptada, con la información que esta contiene (en este caso, el token de auth). Esto evita ataques **XSS (Cross-Site Scripting)**. Por otro lado, el sistema web está también configurado con `SameSite` al momento de hacer un `setCookie`, lo que evita ataques **CSRF (Cross-Site Request Forgery)**.

Debido a cómo trabaja el sistema web, el sistema de clasificaciones debe ser capaz de adaptarse a esta metodología de autenticación.

## Decisión
El sistema local de clasificaciones importará una parte de la base de datos del sistema web necesariamente. En este proceso, se importarán también los usuarios, pero únicamente aquellos que tengan asociado algún rol de administrador. Luego, el sistema utilizará la misma lógica de autenticación con cookies, comparando con la base de datos local. Electron soporta este proceso, ya que nativamente es un navegador chromium por detrás. Luego, el `JWT_SECRET` debe necesariamente coincidir con el sistema web.

De esta manera, cuando un personal del sistema intente loggearse, se compararán sus credenciales con los hashes locales de la base de datos, que sólo contiene los usuarios del personal del sistema. Los password hashes de los otros usuarios NO serán importadas.

Esto permite gran compatibilidad entre los usuarios web y los del sistema de clasificaciones, lo cual es altamente necesario puesto a que el personal administrativo del sistema de clasificaciones se crea originalmente en el sistema web.