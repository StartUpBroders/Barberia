import { peticion } from './clienteHttp';

export const consultarPerfilBarberia = () => peticion('/api/administracion/perfil');
export const actualizarPerfilBarberia = (datos) => peticion('/api/administracion/perfil', { method: 'PUT', body: datos });
