import { beforeEach, describe, expect, it, vi } from 'vitest';

function respuesta(datos, estado = 200) {
  return new Response(datos === null ? null : JSON.stringify(datos), { status: estado, headers: datos === null ? {} : { 'Content-Type': 'application/json' } });
}

describe('cliente HTTP', () => {
  beforeEach(() => vi.resetModules());

  it('envía cookies, JSON y el token CSRF en una escritura', async () => {
    const fetchSimulado = vi.fn().mockResolvedValueOnce(respuesta({ cabecera: 'X-XSRF-TOKEN', parametro: '_csrf', token: 'token-prueba' })).mockResolvedValueOnce(respuesta({ id: 8 }, 201));
    vi.stubGlobal('fetch', fetchSimulado);
    const { peticion } = await import('../api/clienteHttp');
    await expect(peticion('/api/recurso', { method: 'POST', body: { nombre: 'Mimi' } })).resolves.toEqual({ id: 8 });
    expect(fetchSimulado).toHaveBeenNthCalledWith(2, 'https://barberia-zocj.onrender.com/api/recurso', expect.objectContaining({ credentials: 'include', method: 'POST', headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'token-prueba', 'Content-Type': 'application/json' }), body: JSON.stringify({ nombre: 'Mimi' }) }));
  });

  it('renueva CSRF y reintenta una sola vez ante un 403', async () => {
    const fetchSimulado = vi.fn()
      .mockResolvedValueOnce(respuesta({ cabecera: 'X-XSRF-TOKEN', token: 'uno' }))
      .mockResolvedValueOnce(respuesta({ codigo: 'CSRF_INVALIDO', mensaje: 'Token no válido' }, 403))
      .mockResolvedValueOnce(respuesta({ cabecera: 'X-XSRF-TOKEN', token: 'dos' }))
      .mockResolvedValueOnce(respuesta({ correcto: true }));
    vi.stubGlobal('fetch', fetchSimulado);
    const { peticion } = await import('../api/clienteHttp');
    await expect(peticion('/api/recurso', { method: 'PATCH', body: {} })).resolves.toEqual({ correcto: true });
    expect(fetchSimulado).toHaveBeenCalledTimes(4);
  });

  it('expone el error CSRF si el único reintento también falla', async () => {
    const fetchSimulado = vi.fn()
      .mockResolvedValueOnce(respuesta({ cabecera: 'X-XSRF-TOKEN', token: 'uno' }))
      .mockResolvedValueOnce(respuesta({ codigo: 'CSRF_INVALIDO', mensaje: 'Token no válido' }, 403))
      .mockResolvedValueOnce(respuesta({ cabecera: 'X-XSRF-TOKEN', token: 'dos' }))
      .mockResolvedValueOnce(respuesta({ codigo: 'CSRF_INVALIDO', mensaje: 'Token no válido' }, 403));
    vi.stubGlobal('fetch', fetchSimulado);
    const { peticion } = await import('../api/clienteHttp');
    await expect(peticion('/api/recurso', { method: 'DELETE' })).rejects.toMatchObject({ codigo: 'CSRF_INVALIDO', estadoHttp: 403 });
    expect(fetchSimulado).toHaveBeenCalledTimes(4);
  });

  it('no reutiliza el token de Turnstile cuando la verificación antibot falla', async () => {
    const fetchSimulado = vi.fn()
      .mockResolvedValueOnce(respuesta({ cabecera: 'X-XSRF-TOKEN', token: 'csrf' }))
      .mockResolvedValueOnce(respuesta({ codigo: 'VERIFICACION_ANTIBOT_FALLIDA', mensaje: 'Verificación no válida' }, 403));
    vi.stubGlobal('fetch', fetchSimulado);
    const { peticion } = await import('../api/clienteHttp');
    await expect(peticion('/api/barberias/mimi/citas', { method: 'POST', headers: { 'Turnstile-Token': 'token-usado' }, body: {} })).rejects.toMatchObject({ codigo: 'VERIFICACION_ANTIBOT_FALLIDA', estadoHttp: 403 });
    expect(fetchSimulado).toHaveBeenCalledTimes(2);
  });

  it('publica el evento de sesión caducada ante un 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ codigo: 'NO_AUTENTICADO', mensaje: 'Sesión caducada' }, 401)));
    const observador = vi.fn(); window.addEventListener('sesion-caducada', observador);
    const { peticion } = await import('../api/clienteHttp');
    await expect(peticion('/api/administracion/citas')).rejects.toMatchObject({ estadoHttp: 401, message: 'Sesión caducada' });
    expect(observador).toHaveBeenCalledOnce();
    window.removeEventListener('sesion-caducada', observador);
  });
});
