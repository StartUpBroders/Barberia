import { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextoAutenticacion, ProveedorAutenticacion } from '../contexto/ContextoAutenticacion';
import { cerrarSesion, consultarSesion, iniciarSesion } from '../api/autenticacionApi';

vi.mock('../api/autenticacionApi', () => ({ cerrarSesion: vi.fn(), consultarSesion: vi.fn(), iniciarSesion: vi.fn() }));

function SondaSesion() {
  const contexto = useContext(ContextoAutenticacion);
  return <div><span>{contexto.comprobando ? 'Comprobando' : contexto.autenticado ? contexto.sesion.usuario : 'Sin sesión'}</span><button onClick={() => contexto.iniciarSesion({ nombreUsuario: 'mimi', contrasena: 'segura' })}>Entrar</button><button onClick={contexto.cerrarSesion}>Salir</button></div>;
}

describe('contexto de autenticación', () => {
  beforeEach(() => { consultarSesion.mockResolvedValue({ autenticado: true, usuario: 'mimi', rol: 'PROPIETARIO' }); cerrarSesion.mockResolvedValue({ mensaje: 'Sesión cerrada' }); });

  it('consulta y conserva solo la sesión pública al cargar', async () => {
    render(<ProveedorAutenticacion><SondaSesion /></ProveedorAutenticacion>);
    expect(await screen.findByText('mimi')).toBeInTheDocument(); expect(consultarSesion).toHaveBeenCalledOnce();
  });

  it('actualiza el contexto al iniciar y cerrar sesión', async () => {
    consultarSesion.mockRejectedValue(new Error('Sin sesión')); iniciarSesion.mockResolvedValue({ autenticado: true, usuario: 'mimi', rol: 'PROPIETARIO' });
    render(<ProveedorAutenticacion><SondaSesion /></ProveedorAutenticacion>); await screen.findByText('Sin sesión'); await userEvent.click(screen.getByRole('button', { name: 'Entrar' })); expect(await screen.findByText('mimi')).toBeInTheDocument(); await userEvent.click(screen.getByRole('button', { name: 'Salir' })); expect(await screen.findByText('Sin sesión')).toBeInTheDocument(); expect(cerrarSesion).toHaveBeenCalledOnce();
  });

  it('limpia la sesión cuando el cliente HTTP avisa de caducidad', async () => {
    render(<ProveedorAutenticacion><SondaSesion /></ProveedorAutenticacion>); await screen.findByText('mimi'); window.dispatchEvent(new CustomEvent('sesion-caducada')); await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument());
  });
});
