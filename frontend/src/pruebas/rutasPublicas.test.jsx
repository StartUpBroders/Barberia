import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RutasAplicacion } from '../rutas/RutasAplicacion';
import { listarProfesionalesPublicos } from '../api/profesionalesApi';
import { listarServiciosPublicos } from '../api/serviciosApi';
import { consultarBarberia, listarBarberias } from '../api/barberiasApi';

vi.mock('../api/profesionalesApi', () => ({ listarProfesionalesPublicos: vi.fn(), listarProfesionales: vi.fn() }));
vi.mock('../api/serviciosApi', () => ({ listarServiciosPublicos: vi.fn(), listarServicios: vi.fn() }));
vi.mock('../api/barberiasApi', () => ({ consultarBarberia: vi.fn(), listarBarberias: vi.fn() }));
vi.mock('../hooks/usarAutenticacion', () => ({ usarAutenticacion: () => ({ autenticado: false, comprobando: false }) }));

describe('rutas públicas de Mimi', () => {
  beforeEach(() => {
    listarServiciosPublicos.mockResolvedValue([]);
    listarProfesionalesPublicos.mockResolvedValue([]);
    listarBarberias.mockResolvedValue([{ id: 1, nombre: 'Barbería Mimi', slug: 'barberia-mimi' }]);
    consultarBarberia.mockResolvedValue({
      nombre: 'Barbería Mimi',
      slug: 'barberia-mimi',
      telefono: '600000000',
      instagram: '@mimi',
      direccion: 'C. Pastores, 1A, 41130 La Puebla del Río, Sevilla',
      urlGoogleMaps: 'https://www.google.com/maps/place/Mimi',
      mostrarUbicacion: true,
      activa: true,
    });
  });

  it('muestra la información de Mimi en la ruta base', async () => {
    render(<MemoryRouter initialEntries={['/barberia-mimi/']}><RutasAplicacion /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Barbería Mimi' })).toBeInTheDocument();
    expect(screen.queryByText('Carta de servicios')).not.toBeInTheDocument();
    const navegacion = screen.getByRole('navigation', { name: 'Navegación pública' });
    expect(navegacion).toHaveTextContent('Cancelar cita');
    expect(navegacion).toHaveTextContent('Reservar cita');
    expect(navegacion).not.toHaveTextContent('La barbería');
    expect(screen.getByRole('link', { name: 'Reservar ahora' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Cancelar una cita' })).not.toBeInTheDocument();
    expect(screen.queryByText('Un espacio cercano para cuidar tu estilo.')).not.toBeInTheDocument();
    expect(screen.queryByText('El equipo')).not.toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Acceso profesional');
    expect(screen.getByTitle('Ubicación de Barbería Mimi en Google Maps')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@mimi' })).toHaveAttribute('href', 'https://www.instagram.com/mimi/');
  });

  it('abre la reserva en su ruta específica', async () => {
    render(<MemoryRouter initialEntries={['/barberia-mimi/reservar']}><RutasAplicacion /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Prepara tu cita' })).toBeInTheDocument();
  });

  it('muestra en la raíz las barberías activas de la base de datos', async () => {
    render(<MemoryRouter initialEntries={['/']}><RutasAplicacion /></MemoryRouter>);
    expect(screen.queryByText('Tu tiempo, bien organizado.')).not.toBeInTheDocument();
    expect(screen.queryByText('Una forma sencilla de gestionar citas y mantener cada jornada bajo control.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Barbería Mimi/ })).toHaveAttribute('href', '/barberia-mimi');
    expect(document.querySelector('.imagen-barberia-directorio')).toBeInTheDocument();
    expect(listarBarberias).toHaveBeenCalledOnce();
  });
});
