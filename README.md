# Gestión de citas de barberías

Backend REST multi-barbería para gestionar catálogos, profesionales, horarios, disponibilidad, citas, cancelaciones, notificaciones y acceso administrativo. El dato inicial es Barbería Mimi, pero ninguna consulta privada confía en un identificador de barbería enviado por el cliente.

## Arquitectura

```text
Cliente / Swagger / colección Postman
                 |
        Controladores REST
                 |
 Seguridad de sesión + CSRF + roles
                 |
 Servicios transaccionales y reglas de negocio
                 |
 Repositorios Spring Data JPA
                 |
 PostgreSQL de Supabase
```

Las respuestas usan DTOs; las entidades JPA no se exponen. PostgreSQL impone la exclusión definitiva de citas solapadas mediante `btree_gist`, mientras que el servicio realiza una validación previa para ofrecer errores comprensibles.

## Árbol del proyecto

```text
.
├── .env.example
├── pom.xml
├── README.md
├── documentacion
│   ├── postman
│   │   └── Barberia-Mimi.postman_collection.json
│   └── sql
│       └── 01_esquema_inicial.sql
└── src
    ├── main
    │   ├── java/com/barberiamimi/gestioncitas
    │   │   ├── configuracion
    │   │   ├── controlador
    │   │   ├── dto/solicitud
    │   │   ├── dto/respuesta
    │   │   ├── entidad
    │   │   ├── enumeracion
    │   │   ├── excepcion
    │   │   ├── mapper
    │   │   ├── repositorio
    │   │   ├── seguridad
    │   │   ├── servicio
    │   │   └── utilidad
    │   └── resources/application.yml
    └── test
        ├── java/com/barberiamimi/gestioncitas
        └── resources/application-test.yml
```

## Funcionalidades

- Catálogo público de barbería, servicios y profesionales activos.
- Disponibilidad calculada con jornada, duración, bloqueos y citas activas.
- Bloqueos parciales transaccionales: cierran el tramo, cancelan las citas solapadas sin borrar su historial y generan avisos de contacto.
- Calendario de reserva con cadencia y antelación configurables, rutina semanal y aperturas excepcionales por fecha.
- Reserva transaccional con fotografía histórica del servicio e idempotencia.
- Turnstile validado por el backend, límite de tres intentos de reserva por IP cada cinco minutos y máximo de dos citas futuras confirmadas por teléfono.
- Restricción PostgreSQL contra solapamientos, incluidos los parciales.
- Código de cancelación de cinco cifras generado con `SecureRandom` y almacenado como HMAC-SHA256.
- Cancelación pública con respuesta genérica, límite persistente de intentos y plazo mínimo de 24 horas.
- Cancelación administrativa sin el límite de 24 horas, historial y notificaciones.
- Sesión de servidor, BCrypt, CSRF, CORS configurable, roles `PROPIETARIO` y `BARBERO`.
- Aislamiento multi-barbería y aislamiento adicional por profesional para barberos.
- Auditoría de escrituras administrativas y servicio manual de anonimización.
- OpenAPI/Swagger en español y colección Postman.

## Requisitos

- Java 21.
- Maven 3.9 o posterior.
- Un proyecto de Supabase para desarrollo y otro independiente para pruebas.
- Acceso JDBC a PostgreSQL.

No se usa Docker, Testcontainers, H2, Flyway, Liquibase ni el SDK de Supabase.

## Configuración

1. Crear los proyectos separados de Supabase para desarrollo, pruebas y producción.
2. Ejecutar manualmente [01_esquema_inicial.sql](documentacion/sql/01_esquema_inicial.sql) desde el editor SQL de cada entorno nuevo.
   Si la base ya existía antes del calendario avanzado, ejecutar además [02_calendario_avanzado.sql](documentacion/sql/02_calendario_avanzado.sql).
   Para una base existente, ejecutar también [04_proteccion_reservas.sql](documentacion/sql/04_proteccion_reservas.sql).
   Para retirar los campos antiguos de contacto, ejecutar [05_eliminar_correo.sql](documentacion/sql/05_eliminar_correo.sql).
3. Copiar `.env.example` como `.env` y completar sus valores. Spring carga automáticamente ese archivo al arrancar desde la raíz del proyecto.
4. Definir un `SECRETO_HMAC_CANCELACION` aleatorio de al menos 32 caracteres y distinto por entorno.
5. Crear un widget administrado de Cloudflare Turnstile y configurar su clave secreta como `TURNSTILE_SECRET_KEY`. El frontend debe usar la clave pública correspondiente en `VITE_TURNSTILE_SITE_KEY`.
6. En producción, definir `COOKIE_SEGURA=true`, servir exclusivamente mediante HTTPS y limitar CORS al origen real del frontend.

Variables obligatorias de ejecución:

```text
BD_URL
BD_USUARIO
BD_CONTRASENA
SECRETO_HMAC_CANCELACION
TURNSTILE_SECRET_KEY
```

Variables exclusivas de pruebas de integración:

```text
BD_TEST_URL
BD_TEST_USUARIO
BD_TEST_CONTRASENA
EJECUTAR_PRUEBAS_INTEGRACION=true
```

Nunca se debe apuntar `BD_TEST_URL` a producción. La prueba concurrente crea datos con un identificador aleatorio y elimina solo esos datos al finalizar.

## Ejecución

```bash
mvn spring-boot:run
```

Swagger queda disponible en `http://localhost:8080/swagger-ui.html` y el documento OpenAPI en `http://localhost:8080/v3/api-docs`.

## Seguridad y sesión

Antes de cualquier petición `POST`, `PUT`, `PATCH` o `DELETE`, consultar `GET /api/autenticacion/csrf` y enviar el valor recibido en la cabecera `X-XSRF-TOKEN`. Postman conserva automáticamente la cookie de sesión.

El script crea únicamente la credencial de desarrollo indicada en el encargo:

```text
usuario: mimi
contraseña: mimi123
```

PostgreSQL calcula y almacena su hash BCrypt durante la ejecución del script. Cambiar esta contraseña inmediatamente fuera del entorno local. No reutilizarla en pruebas ni producción.

## Pruebas

Pruebas unitarias y de controladores, sin conexión externa:

```bash
mvn test
```

Todas las verificaciones e informe JaCoCo:

```bash
mvn clean verify
```

El informe se genera en `target/site/jacoco/index.html`. Para activar la prueba concurrente real hay que configurar las variables `BD_TEST_*`, preparar previamente el esquema en la base de pruebas y definir `EJECUTAR_PRUEBAS_INTEGRACION=true`.

## Privacidad y conservación

`ServicioAnonimizacion.anonimizarAntiguas()` anonimiza nombre, teléfono, nota y HMAC de citas anteriores al período configurable `aplicacion.privacidad.meses-conservacion-datos-clientes`. Se conserva la fecha, el profesional, el estado y la fotografía del servicio para estadísticas. En esta versión se invoca manualmente desde una consola administrativa o una futura tarea programada; no se expone como endpoint para evitar ejecuciones accidentales.

## Limitaciones actuales

- No se envían SMS ni mensajes de WhatsApp.
- La anonimización histórica no está programada automáticamente.
- Solo Barbería Mimi se incluye como dato inicial de desarrollo.
.
