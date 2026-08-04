import { peticion } from './clienteHttp';
export const consultarConfiguracionReservas = () => peticion('/api/administracion/configuracion-reservas');
export const actualizarConfiguracionReservas = (datos) => peticion('/api/administracion/configuracion-reservas', { method: 'PUT', body: datos });
