import { peticion } from './clienteHttp';
export const listarProfesionalesPublicos = (slug) => peticion(`/api/barberias/${slug}/profesionales`);
export const listarProfesionales = () => peticion('/api/administracion/profesionales');
export const crearProfesional = (datos) => peticion('/api/administracion/profesionales', { method: 'POST', body: datos });
export const actualizarProfesional = (id, datos) => peticion(`/api/administracion/profesionales/${id}`, { method: 'PUT', body: datos });
export const cambiarEstadoProfesional = (id, activo) => peticion(`/api/administracion/profesionales/${id}/estado`, { method: 'PATCH', body: { activo } });
