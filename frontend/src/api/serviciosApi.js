import { peticion } from './clienteHttp';
export const listarServiciosPublicos = (slug) => peticion(`/api/barberias/${slug}/servicios`);
export const listarServicios = () => peticion('/api/administracion/servicios');
export const crearServicio = (datos) => peticion('/api/administracion/servicios', { method: 'POST', body: datos });
export const actualizarServicio = (id, datos) => peticion(`/api/administracion/servicios/${id}`, { method: 'PUT', body: datos });
export const cambiarEstadoServicio = (id, activo) => peticion(`/api/administracion/servicios/${id}/estado`, { method: 'PATCH', body: { activo } });
