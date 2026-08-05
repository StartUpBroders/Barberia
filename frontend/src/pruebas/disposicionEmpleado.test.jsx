import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DisposicionPanel } from '../componentes/administracion/DisposicionPanel';

vi.mock('../hooks/usarAutenticacion', () => ({
  usarAutenticacion: () => ({
    sesion: { usuario: 'pepe', rol: 'BARBERO', barberia: { nombre: 'Barbería Mimi' }, profesional: { id: 3, nombre: 'Pepe', alias: 'pepe' } },
    cerrarSesion: vi.fn(),
  }),
}));

describe('panel de empleado', () => {
  it('usa su propia ruta y no muestra la gestión de profesionales', () => {
    render(<MemoryRouter initialEntries={['/barberia-mimi-dashboard/pepe']}><Routes><Route path="/barberia-mimi-dashboard/:identidad" element={<DisposicionPanel />}><Route index element={<p>Resumen de Pepe</p>} /></Route></Routes></MemoryRouter>);
    const navegacion = screen.getByRole('navigation', { name: 'Navegación administrativa' });
    expect(within(navegacion).queryByRole('link', { name: /Profesionales/ })).not.toBeInTheDocument();
    expect(within(navegacion).getAllByRole('link')).toHaveLength(1);
    expect(within(navegacion).getByRole('link', { name: /Calendario/ })).toHaveAttribute('href', '/barberia-mimi-dashboard/pepe/horarios');
    expect(screen.getByRole('link', { name: 'Abrir perfil de Pepe' })).toHaveTextContent('EMPLEADO');
  });
});
