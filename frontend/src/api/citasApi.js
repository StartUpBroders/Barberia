import { peticion } from './clienteHttp';
export const crearCita = (slug, datos, clave, tokenTurnstile) => peticion(`/api/barberias/${slug}/citas`, { method: 'POST', headers: { 'Idempotency-Key': clave, 'Turnstile-Token': tokenTurnstile }, body: datos });
export const cancelarCitaPublica = (slug, datos) => peticion(`/api/barberias/${slug}/citas/cancelacion`, { method: 'POST', body: datos });
export const listarCitas = () => peticion('/api/administracion/citas');
export const consultarCita = (id) => peticion(`/api/administracion/citas/${id}`);
export const crearCitaAdministrativa = (datos, clave) => peticion('/api/administracion/citas', { method: 'POST', headers: { 'Idempotency-Key': clave }, body: datos });
export const actualizarCita = (id, datos) => peticion(`/api/administracion/citas/${id}`, { method: 'PUT', body: datos });
export const cambiarEstadoCita = (id, estado, motivo) => peticion(`/api/administracion/citas/${id}/estado`, { method: 'PATCH', body: { estado, motivo: motivo || null } });
export const cancelarCitaAdministrativa = (id) => peticion(`/api/administracion/citas/${id}/cancelacion`, { method: 'POST' });
