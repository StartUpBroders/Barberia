import { limpiarCsrf, peticion } from './clienteHttp';
export const consultarSesion = () => peticion('/api/autenticacion/sesion');
export const iniciarSesion = (datos) => peticion('/api/autenticacion/iniciar-sesion', { method: 'POST', body: datos });
export async function cerrarSesion() { const respuesta = await peticion('/api/autenticacion/cerrar-sesion', { method: 'POST' }); limpiarCsrf(); return respuesta; }
