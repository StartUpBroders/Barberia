import { peticion } from './clienteHttp';
export const listarNotificaciones = () => peticion('/api/administracion/notificaciones');
export const marcarNotificacionLeida = (id) => peticion(`/api/administracion/notificaciones/${id}/leida`, { method: 'PATCH' });
