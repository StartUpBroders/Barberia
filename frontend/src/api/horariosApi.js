import { peticion } from './clienteHttp';
export const listarHorarios = () => peticion('/api/administracion/horarios');
export const crearHorario = (datos) => peticion('/api/administracion/horarios', { method: 'POST', body: datos });
export const listarOcupacionesEquipo = () => peticion('/api/administracion/agenda-equipo');
export const guardarRutinaSemanal = (datos) => peticion('/api/administracion/horarios/rutina', { method: 'PUT', body: datos });
export const actualizarHorario = (id, datos) => peticion(`/api/administracion/horarios/${id}`, { method: 'PUT', body: datos });
export const eliminarHorario = (id) => peticion(`/api/administracion/horarios/${id}`, { method: 'DELETE' });
