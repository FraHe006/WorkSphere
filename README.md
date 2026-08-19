# WorkSphere

**Aprende tus derechos laborales de forma accesible, gamificada y colaborativa.**

WorkSphere es una plataforma multiplataforma (web, móvil y escritorio) que busca combatir la desinformación sobre derechos laborales mediante micro-aprendizajes gamificados, contenido validado por la comunidad y un espacio de chat colaborativo entre usuarios y profesionales del sector.

> Trabajo Final de Grado — Ciclo DAM (Desarrollo de Aplicaciones Multiplataforma)
> CPR Plurilingüe Karbo · 2024/2025
> Autora: Helena Franz Folgueira

---

## Tabla de contenidos

- [Motivación](#motivación)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Aplicaciones](#aplicaciones)
  - [App web](#app-web)
  - [App móvil](#app-móvil)
  - [App de escritorio](#app-de-escritorio)
- [Tecnologías](#tecnologías)
- [Puesta en marcha](#puesta-en-marcha)
- [Testing](#testing)
- [Autora](#autora)

---

## Motivación

Más del 51% de los trabajadores en España afirma que su contrato no refleja sus condiciones reales, y un tercio acepta con frecuencia situaciones laborales ilegales. La información oficial existe, pero suele ser técnica, dispersa y poco accesible. WorkSphere nace para ofrecer una alternativa clara, interactiva y validada por la propia comunidad, dirigida a estudiantes, trabajadores y personas en transición laboral.

## Arquitectura del sistema

El sistema sigue una arquitectura **cliente-servidor**:

- Un **servidor central en Node.js** expone una **API REST** que gestiona las peticiones de los tres clientes.
- La comunicación en tiempo real (chat) se realiza mediante **WebSockets (Socket.io)**.
- El envío de correos (notificaciones, confirmaciones, etc.) se delega en un **script de Python**, invocado desde el servidor y desacoplado del resto de la lógica.
- Cada cliente (web, móvil, escritorio) sigue internamente una **arquitectura por capas**, separando presentación, lógica de negocio y comunicación con el servidor.

```
                     ┌────────────────────┐
                     │   Servidor Node.js  │
                     │  API REST + Sockets │
                     └─────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                       │
 ┌──────▼──────┐       ┌───────▼───────┐       ┌───────▼────────┐
 │   App web    │       │   App móvil    │       │ App escritorio │
 │   (React)    │       │   (Flutter)    │       │  (Java/Swing)  │
 └──────────────┘       └────────────────┘       └────────────────┘
```

## Aplicaciones

### App web

Funciona como el **espacio comunitario** del proyecto:

- **Página de inicio** — información general del proyecto y accesos a la descarga de las apps móvil y de escritorio.
- **WorkHub** (chat colaborativo) — sistema de solicitudes de amistad, contactos y chat privado en tiempo real entre usuarios, con distinción visual de cuentas validadas.
- **WorkNet** (página de gestión) — panel diferenciado para administradores (gestión de colaboradores y difusión del proyecto) y usuarios validados (revisión y validación del contenido educativo antes de su publicación).

### App móvil

Enfocada en la **formación interactiva diaria** mediante un sistema de vidas y rachas:

- Menú tipo carrusel con categorías de contenido.
- Cuatro tipos de actividad: **Verdadero/Falso**, **unir conceptos**, **rellenar espacios** y **conversación**.
- Sistema de vidas que limita el acceso diario a las actividades y fomenta la constancia (rachas).
- Modo sandbox para probar juegos guardados localmente.

### App de escritorio

Dirigida a **usuarios expertos** que quieran crear microlecciones educativas:

- Formularios dedicados para cada tipo de juego (Verdadero/Falso, unir conceptos, completar frases, conversación).
- Exportación e importación de la estructura del juego en **XML**, con instrucciones de uso.
- Los juegos creados quedan pendientes de validación por parte de un usuario validado antes de publicarse.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Servidor | Node.js, Express, API REST |
| Tiempo real | Socket.io (WebSockets) |
| App web | React |
| App móvil | Flutter (Dart) |
| App de escritorio | Java + Swing, Gradle |
| Base de datos (usuarios, chat) | MongoDB |
| Base de datos (contenido de juegos) | MySQL |
| Almacenamiento local | LocalStorage (web/móvil), SQLite (móvil) |
| Envío de correos | Script en Python |
| Testing | JUnit 5 (app de escritorio) |
| Control de versiones | Git |
| Entornos de desarrollo | IntelliJ IDEA, Android Studio, Antigravity |

**Compatibilidad:** la app de escritorio, al ejecutarse sobre la JVM, es compatible con cualquier sistema operativo que disponga de un runtime de Java (Windows, Linux, macOS), sin dependencias de APIs nativas de una plataforma concreta.

## Puesta en marcha

### Requisitos previos

- Node.js y npm
- MongoDB y MySQL en local o accesibles por red
- Flutter SDK (para la app móvil)
- JDK + Gradle (para la app de escritorio)
- Python 3 (para el script de envío de correos)

### Servidor

```bash
cd Servidor
npm install
# Configura las variables de entorno (credenciales de MongoDB, MySQL, correo, etc.)
npm start
```

### App web

```bash
cd WorkNet-WorkHub
npm install
npm start
```

### App móvil

```bash
cd WorkQuiz
flutter pub get
flutter run
```

### App de escritorio

```bash
cd WorkDocs
./gradlew build
./gradlew run
```

## Testing

Las pruebas unitarias se han realizado con **JUnit 5**, centradas en la app de escritorio: generación de códigos de validación, parsing de JSON (`extraerCampo`, `extraerBooleano`, `escapeJson`) y validación de datos en la creación de juegos (por ejemplo, del tipo Verdadero/Falso).

## Autora

**Helena Franz Folgueira** — CPR Plurilingüe Karbo, 2024/2025
