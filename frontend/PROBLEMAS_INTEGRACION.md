# Problemas de integración detectados

## Datos administrativos de las citas

`CitaRespuesta.java` devuelve el identificador, barbería, profesional, fotografía histórica del servicio, fechas, estado y cancelación, pero no devuelve nombre, teléfono, nota ni fecha de creación. `GET /api/administracion/citas` tampoco admite filtros, ordenación o paginación.

Impacto: el frontend no puede mostrar ni buscar por datos del cliente, ni paginar en el servidor. Se han implementado filtros locales por fecha, estado y profesional sobre los datos que el backend sí autoriza. La interfaz informa de la limitación en el detalle.

Cambio mínimo propuesto: crear un DTO exclusivamente administrativo con los campos de cliente permitidos y exponer parámetros opcionales de filtro/paginación en `ControladorAdministracionCitas`, conservando el aislamiento por barbería y profesional que ya aplica `ServicioAdministracion`. No se ha modificado el backend porque los flujos esenciales siguen siendo posibles y ampliar el contrato requiere decidir explícitamente el alcance de privacidad.

## Origen CORS de desarrollo

`application.yml` permite por defecto `http://localhost:3000`, mientras Vite sirve este proyecto en `http://localhost:5173`.

Impacto: si se configura `VITE_API_URL=http://localhost:8080`, el navegador bloqueará las llamadas desde el puerto 5173 salvo que se ajuste el origen permitido.

Solución aplicada: durante desarrollo `VITE_API_URL` queda vacío y el proxy de Vite reenvía `/api` a Spring Boot. Para despliegues con orígenes separados debe añadirse el origen exacto del frontend a la configuración CORS del backend; nunca un comodín con credenciales.
