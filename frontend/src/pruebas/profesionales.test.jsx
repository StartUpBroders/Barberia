import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaginaProfesionales } from '../paginas/PaginaProfesionales';
import * as profesionalesApi from '../api/profesionalesApi';

vi.mock('../api/profesionalesApi');

describe('gestión de profesionales', () => {
  beforeEach(() => {
    profesionalesApi.listarProfesionales.mockResolvedValue([]);
    profesionalesApi.crearProfesional.mockResolvedValue({ id: 3 });
    profesionalesApi.eliminarProfesional.mockResolvedValue(null);
  });

  it('crea conjuntamente el profesional y su acceso de empleado', async () => {
    render(<PaginaProfesionales />);
    await screen.findByText('Sin profesionales');
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText(/Nombre/), 'Pepe');
    await usuario.type(screen.getByLabelText('Alias'), 'pepe');
    await usuario.type(screen.getByLabelText(/Usuario/), 'pepe.agenda');
    await usuario.type(screen.getByLabelText(/Contraseña/), 'contrasena-pepe');
    await usuario.click(screen.getByRole('button', { name: 'Crear profesional y acceso' }));
    await waitFor(() => expect(profesionalesApi.crearProfesional).toHaveBeenCalledWith({ nombre: 'Pepe', alias: 'pepe', nombreUsuario: 'pepe.agenda', contrasena: 'contrasena-pepe' }));
  });

  it('permite deshabilitar o eliminar definitivamente a un empleado', async () => {
    profesionalesApi.listarProfesionales.mockResolvedValueOnce([{ id: 3, nombre: 'Pepe', alias: 'pepe', activo: true, rol: 'BARBERO', nombreUsuario: 'pepe.agenda' }]).mockResolvedValue([]);
    profesionalesApi.cambiarEstadoProfesional.mockResolvedValue({ id: 3, activo: false });
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<PaginaProfesionales />);
    await screen.findByRole('heading', { name: 'Pepe' });
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));
    await waitFor(() => expect(profesionalesApi.eliminarProfesional).toHaveBeenCalledWith(3));
    expect(confirmar).toHaveBeenCalledWith(expect.stringContaining('citas, horarios, calendario, notificaciones y acceso'));
    confirmar.mockRestore();
  });
});
