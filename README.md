# WorkSphere

**Aprende tus derechos laborales de forma accesible, gamificada y colaborativa.**

WorkSphere es una plataforma multiplataforma (web, móvil y escritorio) que combate la desinformación sobre derechos laborales mediante micro-aprendizajes gamificados, contenido validado por la comunidad y un espacio de chat colaborativo entre usuarios y profesionales del sector.

> Proyecto de Fin de Ciclo — CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)
> CPR Plurilingüe Karbo · Curso 2025/2026 · Entrega: junio de 2026
> Autora: Helena Franz Folgueira

📄 **[Memoria completa del proyecto (PDF)](docs/WorkSphere-memoria.pdf)**

---

## Tabla de contenidos

- [Motivación](#motivación)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Aplicaciones](#aplicaciones)
  - [App web](#app-web)
  - [App móvil](#app-móvil)
  - [App de escritorio](#app-de-escritorio)
- [Tecnologías](#tecnologías)
- [Metodología](#metodología)
- [Puesta en marcha](#puesta-en-marcha)
- [Testing](#testing)
- [Limitaciones y próximos pasos](#limitaciones-y-próximos-pasos)
- [Autora](#autora)

---

## Motivación

Más del 51 % de los trabajadores en España afirma que su contrato no refleja sus condiciones reales, y un tercio acepta con frecuencia situaciones laborales ilegales. La información oficial existe, pero suele ser técnica, dispersa y poco accesible, lo que normaliza los abusos especialmente entre jóvenes, estudiantes en prácticas y trabajadores precarios.

WorkSphere nace para ofrecer una alternativa clara, interactiva y validada por la propia comunidad, dirigida a estudiantes, trabajadores y personas en transición laboral.

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

## Metodología

El desarrollo siguió un enfoque **iterativo e incremental**, construyendo tres MVPs complementarios en lugar de un único producto cerrado. Cada iteración priorizó:

- **Validación temprana** de cada MVP antes de avanzar al siguiente.
- **Control de calidad del contenido** mediante un flujo de revisión: las microlecciones creadas quedan pendientes de aprobación por parte de un usuario validado antes de publicarse.
- **Ajuste de alcance según el avance real**, redefiniendo funcionalidades cuando su complejidad ponía en riesgo el conjunto (ver [Limitaciones](#limitaciones-y-próximos-pasos)).

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

Las pruebas unitarias se han desarrollado con **JUnit 5**, centradas en la app de escritorio. El diseño de los casos priorizó los **casos límite** por encima del camino feliz:

**Generación de códigos de validación**
Se verifica que el método produce siempre un código numérico de exactamente 6 dígitos, comprendido entre 100000 y 999999. La prueba se ejecuta **100 veces consecutivas** para garantizar que el resultado es consistente con independencia del valor aleatorio generado en cada ejecución.

**Parsing de respuestas JSON**
Pruebas sobre los tres métodos internos de lectura de datos:

- `extraerCampo` — devuelve el valor de texto de un campo existente; devuelve nulo si el campo no existe; devuelve nulo si el valor es nulo en el JSON; y devuelve números y booleanos como texto sin comillas.
- `extraerBooleano` — reconoce las variantes `true`, `TRUE` y `True`; devuelve falso si el campo no existe; y devuelve falso si el valor es explícitamente falso.
- `escapeJson` — escapa correctamente comillas dobles, saltos de línea, retornos de carro, tabulaciones y barras invertidas; devuelve cadena vacía ante un valor nulo.

**Validación de datos en la creación de juegos**
Comprobación de las reglas de validación de los formularios de creación de contenido (por ejemplo, en las actividades de tipo Verdadero/Falso).

> Las pruebas unitarias se limitaron a la aplicación de escritorio, ya que el testing sobre las tecnologías de las otras dos aplicaciones quedaba fuera del contenido del ciclo y se priorizó el desarrollo funcional completo de los tres clientes.

## Limitaciones y próximos pasos

Decisiones de alcance tomadas durante el desarrollo, y trabajo pendiente:

**Cambio de alcance consciente**
El foro planteado en la idea inicial se sustituyó por un **chat privado** entre usuarios y personas conocedoras del sector. La complejidad del foro comprometía el avance del resto de aplicaciones, por lo que se optó por reducir ese alcance y garantizar tres clientes completos y funcionales.

**Pendiente**
- Corregir el sistema de **rachas y vidas** de la app móvil. La lógica de incremento está implementada en el servidor y documentada en el manual de usuario, pero se retiró del cliente al detectar fallos en las últimas pruebas.
- **App de escritorio:** apartado para revisar los bloques de datos rechazados, permitiendo consultarlos, corregirlos y reenviarlos a validación.
- **App móvil:** versión premium con vidas ilimitadas, filtrado avanzado por categorías y nuevos tipos de actividad.
- **App web:** implementación del foro original.

## Autora

**Helena Franz Folgueira**
CFGS Desarrollo de Aplicaciones Multiplataforma — CPR Plurilingüe Karbo

[LinkedIn](https://linkedin.com/in/helena-franz-folgueira-2b6bab370) · [GitHub](https://github.com/FraHe006)
