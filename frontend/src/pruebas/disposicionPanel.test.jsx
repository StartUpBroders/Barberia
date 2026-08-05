import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DisposicionPanel } from '../componentes/administracion/DisposicionPanel';
import * as profesionalesApi from '../api/profesionalesApi';
import * as notificacionesApi from '../api/notificacionesApi';

vi.mock('../api/profesionalesApi');
vi.mock('../api/notificacionesApi');

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
  beforeEach(() => {
    profesionalesApi.listarProfesionales.mockResolvedValue([]);
    notificacionesApi.listarNotificaciones.mockResolvedValue([]);
  });
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
      '⌂Resumen', '◷Citas', '＋Reserva Cita', '▦Calendario', '↻Rutina Laboral', '◉Notificaciones', '⊘Bloqueos parciales', '✂Servicios', '♙Profesionales',
    ]);
    expect(within(navegacion).getByRole('link', { name: /Reserva Cita/ })).toHaveAttribute('href', '/barberia-mimi-dashboard/mimi/reserva-cita');
    expect(within(navegacion).getByRole('link', { name: /Rutina Laboral/ })).toHaveAttribute('href', '/barberia-mimi-dashboard/mimi/rutina-laboral');
    expect(within(navegacion).getByRole('link', { name: /Servicios/ })).toHaveAttribute('href', '/barberia-mimi-dashboard/mimi/servicios');
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

  it('muestra tarjetas de empleados bajo Profesionales enlazadas a su calendario', async () => {
    profesionalesApi.listarProfesionales.mockResolvedValue([{ id: 3, nombre: 'Pepe', activo: true, rol: 'BARBERO' }]);
    render(<MemoryRouter initialEntries={['/barberia-mimi-dashboard/mimi']}><Routes><Route path="/barberia-mimi-dashboard/mimi" element={<DisposicionPanel />}><Route index element={<p>Resumen</p>} /></Route></Routes></MemoryRouter>);
    const enlace = await screen.findByRole('link', { name: 'Pepe' });
    expect(enlace).toHaveAttribute('href', '/barberia-mimi-dashboard/mimi/horarios?profesional=3');
    expect(enlace.closest('.tarjetas-empleados-panel')).toHaveAttribute('aria-label', 'Calendarios de empleados');
  });

  it('muestra y actualiza el contador de notificaciones pendientes', async () => {
    const intervalos = vi.spyOn(window, 'setInterval');
    notificacionesApi.listarNotificaciones
      .mockResolvedValueOnce([{ id: 1, leida: false }, { id: 2, leida: true }, { id: 3, leida: false }])
      .mockResolvedValue([{ id: 1, leida: false }, { id: 3, leida: false }, { id: 4, leida: false }]);
    render(<MemoryRouter initialEntries={['/barberia-mimi-dashboard/mimi']}><Routes><Route path="/barberia-mimi-dashboard/mimi" element={<DisposicionPanel />}><Route index element={<p>Resumen</p>} /></Route></Routes></MemoryRouter>);
    const enlace = await screen.findByRole('link', { name: 'Notificaciones, 2 pendientes' });
    expect(within(enlace).getByText('2')).toHaveClass('contador-notificaciones');
    expect(intervalos).toHaveBeenCalledWith(expect.any(Function), 15000);
    await act(async () => { window.dispatchEvent(new Event('focus')); });
    expect(await screen.findByRole('link', { name: 'Notificaciones, 3 pendientes' })).toBeInTheDocument();
    act(() => window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { detail: { pendientes: 1 } })));
    expect(await screen.findByRole('link', { name: 'Notificaciones, 1 pendiente' })).toBeInTheDocument();
    intervalos.mockRestore();
  });
});
