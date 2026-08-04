import { peticion } from './clienteHttp';
export const listarDiasBloqueados = () => peticion('/api/administracion/dias-bloqueados');
export const crearDiaBloqueado = (datos) => peticion('/api/administracion/dias-bloqueados', { method: 'POST', body: datos });
export const crearBloqueoParcial = (datos) => peticion('/api/administracion/dias-bloqueados/parcial', { method: 'POST', body: datos });
export const crearBloqueosParciales = (datos) => peticion('/api/administracion/dias-bloqueados/parciales', { method: 'POST', body: datos });
export const actualizarDiaBloqueado = (id, datos) => peticion(`/api/administracion/dias-bloqueados/${id}`, { method: 'PUT', body: datos });
export const eliminarDiaBloqueado = (id) => peticion(`/api/administracion/dias-bloqueados/${id}`, { method: 'DELETE' });
