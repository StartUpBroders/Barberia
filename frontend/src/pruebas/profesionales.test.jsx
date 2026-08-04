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
});
