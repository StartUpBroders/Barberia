import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DisposicionPanel } from '../componentes/administracion/DisposicionPanel';

vi.mock('../hooks/usarAutenticacion', () => ({
  usarAutenticacion: () => ({
    sesion: {
      usuario: 'mimi',
      rol: 'PROPIETARIO',
      barberia: { nombre: 'Barbería Mimi' },
    },
    cerrarSesion: vi.fn(),
  }),
}));

describe('disposición móvil del panel', () => {
  it('abre y cierra la navegación desde el botón de menú', async () => {
    render(
      <MemoryRouter initialEntries={['/barberia-mimi-dashboard/mimi']}>
        <Routes>
          <Route path="/barberia-mimi-dashboard/mimi" element={<DisposicionPanel />}>
            <Route index element={<p>Resumen</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const usuario = userEvent.setup();
    const menu = screen.getByRole('complementary');
    const navegacion = screen.getByRole('navigation', { name: 'Navegación administrativa' });
    expect(within(navegacion).getAllByRole('link').map((enlace) => enlace.textContent.trim())).toEqual([
      '⌂Resumen', '◷Citas', '▦Calendario', '◉Notificaciones', '⊘Bloqueos parciales', '♙Profesionales',
    ]);
    expect(document.querySelectorAll('.marca-imagen-panel, .imagen-usuario-panel')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Abrir perfil de mimi' })).toHaveTextContent('PROPIETARIO');
    expect(menu).not.toHaveClass('abierta');

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(menu).toHaveClass('abierta');
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await usuario.click(screen.getAllByRole('button', { name: 'Cerrar menú' })[0]);
    expect(menu).not.toHaveClass('abierta');
  });
});
