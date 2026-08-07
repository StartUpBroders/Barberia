const URL_API = (import.meta.env.VITE_API_URL || 'https://barberia-zocj.onrender.com').replace(/\/$/, '');
const METODOS_ESCRITURA = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let datosCsrf = null;

export class ErrorApi extends Error {
  constructor({ codigo, mensaje, detalles = [], estadoHttp = 0 }) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.mensaje = mensaje;
    this.detalles = detalles;
    this.estadoHttp = estadoHttp;
  }
}

async function interpretarError(respuesta) {
  let datos = {};
  try {
    const tipo = respuesta.headers.get('content-type') || '';
    if (tipo.includes('application/json')) datos = await respuesta.json();
  } catch {
    datos = {};
  }
  return new ErrorApi({
    codigo: datos.codigo || `ERROR_HTTP_${respuesta.status}`,
    mensaje: datos.mensaje || mensajePorEstado(respuesta.status),
    detalles: Array.isArray(datos.detalles) ? datos.detalles : [],
    estadoHttp: respuesta.status,
  });
}

function mensajePorEstado(estado) {
  const mensajes = {
    400: 'La solicitud contiene datos inválidos.',
    401: 'La sesión no es válida o ha caducado.',
    403: 'No tienes permisos para realizar esta operación.',
    404: 'No se ha encontrado el recurso solicitado.',
    409: 'La operación entra en conflicto con datos existentes.',
    422: 'La operación no cumple una regla de negocio.',
    429: 'Se han realizado demasiados intentos. Inténtalo más tarde.',
    500: 'El servidor no ha podido completar la operación.',
    503: 'La agenda no está disponible temporalmente. Inténtalo de nuevo en unos segundos.',
  };
  return mensajes[estado] || 'No se ha podido completar la solicitud.';
}

async function obtenerCsrf(forzar = false) {
  if (datosCsrf && !forzar) return datosCsrf;
  const respuesta = await fetch(`${URL_API}/api/autenticacion/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!respuesta.ok) throw await interpretarError(respuesta);
  datosCsrf = await respuesta.json();
  return datosCsrf;
}

export function limpiarCsrf() {
  datosCsrf = null;
}

export async function peticion(ruta, opciones = {}, reintentoCsrf = false) {
  const metodo = (opciones.method || 'GET').toUpperCase();
  const escritura = METODOS_ESCRITURA.has(metodo);
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), opciones.tiempoEspera || 15000);
  try {
    const cabeceras = { Accept: 'application/json', ...(opciones.headers || {}) };
    if (opciones.body !== undefined && !(opciones.body instanceof FormData)) cabeceras['Content-Type'] = 'application/json';
    if (escritura) {
      const csrf = await obtenerCsrf(reintentoCsrf);
      cabeceras[csrf.cabecera] = csrf.token;
    }
    const respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      credentials: 'include',
      headers: cabeceras,
      body: opciones.body === undefined ? undefined : opciones.body instanceof FormData ? opciones.body : JSON.stringify(opciones.body),
      signal: opciones.signal || controlador.signal,
    });
    if (!respuesta.ok) {
      const error = await interpretarError(respuesta);
      if (respuesta.status === 403 && escritura && !reintentoCsrf && error.codigo !== 'VERIFICACION_ANTIBOT_FALLIDA') {
        limpiarCsrf();
        return peticion(ruta, opciones, true);
      }
      if (respuesta.status === 401) window.dispatchEvent(new CustomEvent('sesion-caducada'));
      throw error;
    }
    if (respuesta.status === 204) return null;
    const tipo = respuesta.headers.get('content-type') || '';
    return tipo.includes('application/json') ? respuesta.json() : null;
  } catch (error) {
    if (error instanceof ErrorApi) throw error;
    if (error?.name === 'AbortError') throw new ErrorApi({ codigo: 'TIEMPO_AGOTADO', mensaje: 'La solicitud ha tardado demasiado. Inténtalo de nuevo.' });
    throw new ErrorApi({ codigo: 'SIN_CONEXION', mensaje: 'No se puede conectar con el servidor. Comprueba tu conexión.' });
  } finally {
    clearTimeout(temporizador);
  }
}

export const configuracionApi = { url: URL_API };
