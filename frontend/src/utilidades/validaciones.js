export const patronTelefono = /^\d{9}$/;
export function validarReserva(datos) {
  const errores = {};
  if (!datos.nombreCliente.trim()) errores.nombreCliente = 'Escribe tu nombre.';
  else if (datos.nombreCliente.length > 100) errores.nombreCliente = 'El nombre no puede superar 100 caracteres.';
  if (!patronTelefono.test(datos.telefonoCliente)) errores.telefonoCliente = 'El móvil debe tener exactamente 9 cifras.';
  if (!datos.servicioId) errores.servicioId = 'Selecciona un servicio.';
  if (!datos.profesionalId) errores.profesionalId = 'Selecciona un profesional.';
  if (!datos.fecha) errores.fecha = 'Selecciona una fecha.';
  if (!datos.fechaInicio) errores.fechaInicio = 'Selecciona un horario disponible.';
  if (datos.notaCliente.length > 1000) errores.notaCliente = 'La nota no puede superar 1000 caracteres.';
  return errores;
}
export function validarCancelacion(datos) { const errores = {}; if (!patronTelefono.test(datos.telefonoCliente)) errores.telefonoCliente = 'El móvil debe tener exactamente 9 cifras.'; if (!/^\d{5}$/.test(datos.codigoCancelacion)) errores.codigoCancelacion = 'El código debe tener exactamente cinco cifras.'; return errores; }
export function hayErrores(errores) { return Object.keys(errores).length > 0; }
