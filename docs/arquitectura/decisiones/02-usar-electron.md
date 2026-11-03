# [01] - Utilizar Electron como Wrapper

- **Afecta:** frontend y backend
- **Estado:** aplicado

## Contexto y problemática
El sistema requiere ser local y no de acceso a web pública para permitir que el usuario almacene en su hardware físico archivos (entregas de kit temporales, clasificaciones por chip que acaban de ser tomadas...). Si el sistema es implementado como una app web, la interfaz web aplica varias restricciones de almacenamiento en hardware físico, restricciones de firewall, etc.

Al mismo tiempo, la aplicación necesita tener una arquitectura cliente-servidor para una mayor facilidad en su funcionamiento (ver decisión `01-usar-arquitectura-cliente-servidor`).

## Decisión
La aplicación mantiene su arquitectura cliente-servidor con el stack clásico de html/javascript, pero es empaquetada con Electron y tratada como una aplicación de escritorio local. Este empaquetado permite comunicación directa con el sistema operativo y por ende, hardware físico del equipo del usuario, requiriendo una configuración poco compleja para empaquetar la app.

Por otro lado, Electron se encarga de levantar todo lo necesario para funcionar al mismo tiempo: backend y frontend (pantallas).