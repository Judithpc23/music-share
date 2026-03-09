# SoundShare (Repositorio General)

Este repositorio contiene la aplicación completa de **SoundShare**, una plataforma social de música donde los usuarios pueden descubrir canciones, publicar contenido, reaccionar, comentar y participar en listening rooms.

> Este README está enfocado en la visión general del proyecto.  
> Para configuración detallada y ejecución por capa, consulta los README internos:
>
> - Frontend: [`Front-End/README.md`](Front-End/README.md)
> - Backend: [`Back-End/README.md`](Back-End/README.md)

## Visión funcional

SoundShare combina funcionalidades de red social y catálogo musical:

- Catálogo de canciones, artistas y géneros.
- Publicaciones y compartidos de canciones.
- Reacciones y comentarios.
- Moderación básica de contenido.
- Salas de escucha colaborativa (listening rooms).
- Notificaciones y relaciones de seguimiento.

## Arquitectura general

El proyecto está organizado en dos aplicaciones principales:

- **`Front-End/`**: cliente web en Next.js (App Router).
- **`Back-End/`**: API REST en NestJS conectada a Supabase.

Flujo general:

1. El frontend renderiza interfaz y gestiona estado de sesión/aplicación.
2. El frontend consume endpoints de la API (`/api/...`).
3. El backend aplica reglas de negocio y consulta Supabase.
4. Supabase persiste datos y expone vistas/tablas usadas por la API.

## Organización del repositorio

```text
music-share/
├── Front-End/   # App web (Next.js + React + TypeScript)
├── Back-End/    # API (NestJS + TypeScript)
└── README.md    # Este documento (visión global)
```

## Patrones de diseño utilizados (alto nivel)

Además de la implementación funcional, el proyecto usa patrones para mantener extensibilidad y separar responsabilidades:

- **Decorator** para enriquecer entidades de canción con metadatos y resumen de reacciones.
- **Prototype** para plantillas de publicaciones por estado de ánimo.
- **Memento** para versionado/historial de publicaciones.
- **Factory** para creación de notificaciones por tipo.
- **Mediator** para orquestar eventos de notificaciones.

> Las implementaciones concretas viven en módulos del backend y scripts SQL de soporte.

## Integración entre capas

- El **frontend** centraliza consumo de API en controladores y hooks.
- El **backend** expone endpoints por dominio (auth, catalog, posts, rooms, engagement, etc.).
- Los contratos de datos (tipos DTO/entidades lógicas) permiten mantener coherencia entre lo que se muestra y lo que se persiste.

## Entornos y ejecución

Para evitar duplicar instrucciones:

- Configuración de variables de entorno del frontend: ver [`Front-End/README.md`](Front-End/README.md).
- Configuración de variables de entorno del backend: ver [`Back-End/README.md`](Back-End/README.md).
- Comandos de instalación, ejecución y testing: ver README internos.

## Convenciones recomendadas para contribuir

- Mantener cambios separados por capa (frontend/backend) cuando sea posible.
- Evitar acoplar lógica de negocio en componentes visuales.
- Reutilizar utilidades/controladores existentes antes de crear nuevas abstracciones.
- Documentar migraciones SQL y cualquier cambio de contrato API.

## Estado del proyecto

Repositorio orientado a desarrollo académico/prototipo funcional con estructura lista para evolucionar a producción con endurecimiento adicional (seguridad, observabilidad y despliegue automatizado).
