import { peticion } from './clienteHttp';
export const listarBarberias = () => peticion('/api/barberias');
export const consultarBarberia = (slug) => peticion(`/api/barberias/${slug}`);
