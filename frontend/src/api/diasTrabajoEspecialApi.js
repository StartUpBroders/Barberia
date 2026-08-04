import { peticion } from './clienteHttp';
export const listarDiasTrabajoEspecial = () => peticion('/api/administracion/dias-trabajo-especial');
export const crearDiaTrabajoEspecial = (datos) => peticion('/api/administracion/dias-trabajo-especial', { method: 'POST', body: datos });
export const actualizarDiaTrabajoEspecial = (id, datos) => peticion(`/api/administracion/dias-trabajo-especial/${id}`, { method: 'PUT', body: datos });
export const eliminarDiaTrabajoEspecial = (id) => peticion(`/api/administracion/dias-trabajo-especial/${id}`, { method: 'DELETE' });
