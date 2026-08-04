import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PaginaInicioSesion } from '../paginas/PaginaInicioSesion';
import { RutaProtegida } from '../rutas/RutaProtegida';

const estadoAutenticacion = { autenticado: false, comprobando: false, iniciarSesion: vi.fn() };
vi.mock('../hooks/usarAutenticacion', () => ({ usarAutenticacion: () => estadoAutenticacion }));

describe('autenticación y rutas protegidas', () => {
  it('inicia sesión y vuelve a la ruta solicitada', async () => {
    estadoAutenticacion.autenticado = false; estadoAutenticacion.comprobando = false; estadoAutenticacion.iniciarSesion.mockResolvedValue({ autenticado: true });
    render(<MemoryRouter initialEntries={[{ pathname: '/barber-login', state: { desde: '/barberia-mimi-dashboard/mimi/citas' } }]}><Routes><Route path="/barber-login" element={<PaginaInicioSesion />} /><Route path="/barberia-mimi-dashboard/mimi/citas" element={<p>Agenda privada</p>} /></Routes></MemoryRouter>);
    const usuario = userEvent.setup(); await usuario.type(screen.getByLabelText('Usuario'), 'mimi'); await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena-segura'); await usuario.click(screen.getByRole('button', { name: 'Entrar al panel' }));
    expect(estadoAutenticacion.iniciarSesion).toHaveBeenCalledWith({ nombreUsuario: 'mimi', contrasena: 'contrasena-segura' });
    expect(await screen.findByText('Agenda privada')).toBeInTheDocument();
  });

  it('muestra el error seguro de credenciales', async () => {
    estadoAutenticacion.iniciarSesion.mockRejectedValue({ mensaje: 'Credenciales incorrectas.' });
    render(<MemoryRouter><PaginaInicioSesion /></MemoryRouter>); const usuario = userEvent.setup(); await usuario.type(screen.getByLabelText('Usuario'), 'mimi'); await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta'); await usuario.click(screen.getByRole('button', { name: 'Entrar al panel' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas.');
  });

  it('muestra únicamente el acceso necesario y vuelve a la raíz', () => {
    estadoAutenticacion.autenticado = false; estadoAutenticacion.comprobando = false;
    render(<MemoryRouter><PaginaInicioSesion /></MemoryRouter>);
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Accede a tu agenda' })).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver al listado de barberías' })).toHaveAttribute('href', '/');
    expect(screen.queryByText('Más tiempo para tu oficio.')).not.toBeInTheDocument();
    expect(screen.queryByText('Barbería Mimi')).not.toBeInTheDocument();
  });

  it('redirige al login conservando la ruta cuando no hay sesión', () => {
    estadoAutenticacion.autenticado = false; estadoAutenticacion.comprobando = false;
    render(<MemoryRouter initialEntries={['/privada']}><Routes><Route element={<RutaProtegida />}><Route path="/privada" element={<p>Privada</p>} /></Route><Route path="/barber-login" element={<p>Inicio de sesión requerido</p>} /></Routes></MemoryRouter>);
    expect(screen.getByText('Inicio de sesión requerido')).toBeInTheDocument();
  });
});
