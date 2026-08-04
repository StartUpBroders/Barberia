import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaginaPerfil } from '../paginas/PaginaPerfil';
import * as perfilApi from '../api/perfilBarberiaApi';

vi.mock('../api/perfilBarberiaApi');

describe('perfil público de la barbería', () => {
  beforeEach(() => {
    perfilApi.consultarPerfilBarberia.mockResolvedValue({
      nombre: 'Barbería Mimi',
      telefono: '600000000',
      instagram: '@mimi',
      direccion: 'C. Pastores, 1A, 41130 La Puebla del Río, Sevilla',
      urlGoogleMaps: 'https://www.google.com/maps/place/Mimi',
      mostrarUbicacion: true,
    });
    perfilApi.actualizarPerfilBarberia.mockImplementation(async (datos) => datos);
  });

  it('edita contacto, Instagram y controla la publicación del mapa', async () => {
    render(<PaginaPerfil />);
    const nombre = await screen.findByLabelText(/Nombre de la barbería/);
    expect(nombre).toHaveValue('Barbería Mimi');
    expect(screen.getByTitle('Vista previa de la ubicación en Google Maps')).toBeInTheDocument();

    const usuario = userEvent.setup();
    const instagram = screen.getByLabelText('Instagram');
    await usuario.clear(instagram);
    await usuario.type(instagram, '@nuevo_mimi');
    await usuario.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    await waitFor(() => expect(perfilApi.actualizarPerfilBarberia).toHaveBeenCalledWith(expect.objectContaining({
      instagram: '@nuevo_mimi',
      mostrarUbicacion: true,
    })));
  });
});
