# Frontend de Barbería Mimi

Aplicación React para reservar y cancelar citas, y para gestionar la agenda de Barbería Mimi mediante el backend Spring Boot existente. No contiene datos de negocio simulados ni accede directamente a Supabase.

## Tecnologías

- React 19, React Router 7 y Vite 8.
- JavaScript y CSS tradicional, con diseño responsive.
- Fetch API con cookies, CSRF, timeout y normalización de errores.
- Vitest, React Testing Library y ESLint.

Se recomienda una versión LTS reciente de Node.js compatible con Vite 8 (Node 20.19+ o 22.12+).

## Estructura

```text
src/
├── api/             Cliente HTTP y módulos por recurso
├── componentes/     Elementos comunes y disposiciones
├── contexto/        Estado público de la sesión
├── hooks/           Hooks reutilizables
├── paginas/         Rutas públicas y administrativas
├── pruebas/         Pruebas unitarias y de componentes
├── rutas/           Enrutado y protección de rutas
├── estilos/         CSS global, formularios, tablas y panel
└── utilidades/      Fechas, validaciones, errores e idempotencia
```

## Instalación y arranque

```powershell
cd C:\Users\alvar\Desktop\Mimi\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

El frontend queda en `http://localhost:5173`. Para desarrollo, deja `VITE_API_URL` vacío: Vite enviará `/api` a `VITE_PROXY_API`, que por defecto es `http://localhost:8080`. Así las cookies se mantienen en el mismo origen del navegador y no depende del CORS del backend.

Variables disponibles:

```env
VITE_API_URL=
VITE_PROXY_API=http://localhost:8080
VITE_SLUG_BARBERIA=barberia-mimi
```

Para un despliegue separado puede definirse `VITE_API_URL=https://api.ejemplo.com`, siempre que el backend permita el origen exacto del frontend, use HTTPS y configure correctamente la cookie.

## Sesión y CSRF

La sesión pertenece a Spring Security. El navegador envía su cookie con `credentials: 'include'`; la aplicación no almacena identificadores de sesión. Antes de `POST`, `PUT`, `PATCH` o `DELETE`, el cliente consulta `/api/autenticacion/csrf`, usa el nombre de cabecera devuelto y reintenta una sola vez si recibe `403`. Un `401` limpia el contexto y las rutas privadas vuelven al login.

La clave de idempotencia de una reserva se conserva mientras los datos no cambien. El código de cancelación solo viaja en el estado temporal de navegación y nunca se guarda de forma persistente.

## Rutas

La raíz `/` es una landing independiente, sin botones, enlaces ni referencias que revelen las rutas de una barbería. `/barberia-mimi` muestra la información pública de Mimi y `/barberia-mimi/reservar` abre un calendario de días y tramos disponibles. La antigua `/barberia-mimi/informacion` redirige a la página pública. Cancelación y confirmación usan `/barberia-mimi/cancelar` y `/barberia-mimi/reserva-confirmada`.

En administración, `horarios` ofrece un calendario mensual: verde indica trabajo, rojo descanso y un punto dorado señala citas. Desde la misma pantalla se configura la rutina semanal, uno o dos turnos, la cadencia entre comienzos de cita y la antelación máxima de reserva.

`dias-bloqueados` usa el mismo selector visual de días y tramos que la reserva pública. Los tramos libres se cierran directamente; si hay una cita activa solapada, se cancela conservando su historial y se crea una notificación con el teléfono del cliente para que la barbería pueda avisarle.

Autenticación: `/barber-login`.

Administración: `/barberia-mimi-dashboard/mimi` y las áreas `citas`, `servicios`, `profesionales`, `horarios`, `dias-bloqueados` y `notificaciones`. El texto de la URL no concede acceso: solo la sesión devuelta por el backend lo hace.

## Calidad

```powershell
npm run lint
npm run test
npm run test:coverage
npm run build
npm run preview
```

Las pruebas sustituyen las llamadas HTTP; no conectan con Supabase. El informe HTML de cobertura se genera en `coverage/index.html`.

## Conexión y errores frecuentes

- Si aparece “No se puede conectar”, comprueba que Spring Boot escucha en el puerto 8080.
- Si Vite no usa el proxy, confirma que `VITE_API_URL` esté vacío y reinicia `npm run dev` tras cambiar `.env`.
- En producción, un error CORS requiere añadir el origen concreto en el backend; no se debe permitir cualquier origen con credenciales.
- Un `403` persistente suele indicar que el token y la cookie CSRF no pertenecen a la misma sesión.
- Un `409` al reservar significa que el hueco cambió o que existe un conflicto de idempotencia; la pantalla renueva los horarios.
- Un `422` al cancelar responde a una regla de negocio, como el límite mínimo de 24 horas.
- Un `429` exige esperar hasta que finalice el bloqueo de intentos.

## Limitaciones de esta versión

El endpoint administrativo de citas no devuelve nombre, teléfono, nota ni fecha de creación, y tampoco expone paginación ni filtros de servidor. La página presenta y filtra únicamente los campos disponibles. Consulta [PROBLEMAS_INTEGRACION.md](PROBLEMAS_INTEGRACION.md) para el impacto y una propuesta compatible.
