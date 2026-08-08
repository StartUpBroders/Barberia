import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaginaReserva } from '../paginas/PaginaReserva';
import { PaginaReservaConfirmada } from '../paginas/PaginaReservaConfirmada';
import { crearCita } from '../api/citasApi';
import { consultarCalendarioDisponibilidad } from '../api/disponibilidadApi';
import { listarProfesionalesPublicos } from '../api/profesionalesApi';
import { listarServiciosPublicos } from '../api/serviciosApi';

const navegar = vi.fn();
vi.mock('react-router-dom', async (importarOriginal) => ({ ...(await importarOriginal()), useNavigate: () => navegar }));
vi.mock('../api/citasApi', () => ({ crearCita: vi.fn() }));
vi.mock('../api/disponibilidadApi', () => ({ consultarCalendarioDisponibilidad: vi.fn() }));
vi.mock('../api/profesionalesApi', () => ({ listarProfesionalesPublicos: vi.fn() }));
vi.mock('../api/serviciosApi', () => ({ listarServiciosPublicos: vi.fn() }));

describe('reserva pública', () => {
  beforeEach(() => {
    listarServiciosPublicos.mockResolvedValue([{ id: 1, nombre: 'Corte', precio: 18, duracionMinutos: 30 }]);
    listarProfesionalesPublicos.mockResolvedValue([{ id: 2, nombre: 'Mimi' }]);
    consultarCalendarioDisponibilidad.mockResolvedValue({ desde: '2030-09-10', hasta: '2030-10-10', diasAntelacionReserva: 30, dias: [{ fecha: '2030-09-10', disponible: true, cantidadHorarios: 1, horariosDisponibles: [{ fechaInicio: '2030-09-10T10:00:00', fechaFin: '2030-09-10T10:30:00' }] }] });
    crearCita.mockResolvedValue({ id: 7, codigoCancelacion: '00382' });
  });

  it('carga catálogo, consulta disponibilidad y envía idempotencia', async () => {
    render(<MemoryRouter><PaginaReserva /></MemoryRouter>); const usuario = userEvent.setup();
    expect(await screen.findByRole('option', { name: 'Corte · 18.00 €' })).toBeInTheDocument();
    expect(screen.queryByText('30 min')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Profesional/)).toHaveValue('2');
    await usuario.type(screen.getByLabelText(/Nombre/), 'Ana'); await usuario.type(screen.getByLabelText(/Móvil/i), '600000000');
    const dia = (await screen.findByText('1 hueco')).closest('button'); await usuario.click(dia); await usuario.selectOptions(screen.getByLabelText(/Servicio/), '1');
    const tramo = (await screen.findByText('10:00')).closest('button'); await usuario.click(tramo); await usuario.click(screen.getByRole('button', { name: 'Confirmar cita' }));
    await waitFor(() => expect(crearCita).toHaveBeenCalled());
    expect(crearCita.mock.calls[0][2]).toMatch(/[0-9a-f-]{16,}/i);
    expect(navegar).toHaveBeenCalledWith('/barberia-mimi/reserva-confirmada', expect.objectContaining({ replace: true, state: { cita: expect.objectContaining({ codigoCancelacion: '00382' }) } }));
  });

  it('actualiza los horarios tras un conflicto 409', async () => {
    crearCita.mockRejectedValue({ estadoHttp: 409, mensaje: 'Horario ocupado.' });
    render(<MemoryRouter><PaginaReserva /></MemoryRouter>); const usuario = userEvent.setup(); await screen.findByRole('option', { name: /Corte/ });
    await usuario.type(screen.getByLabelText(/Nombre/), 'Ana'); await usuario.type(screen.getByLabelText(/Móvil/i), '600000000'); await usuario.click((await screen.findByText('1 hueco')).closest('button')); await usuario.selectOptions(screen.getByLabelText(/Servicio/), '1'); await usuario.click((await screen.findByText('10:00')).closest('button')); await usuario.click(screen.getByRole('button', { name: 'Confirmar cita' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Horario ocupado.');
    expect(consultarCalendarioDisponibilidad).toHaveBeenCalledTimes(3);
  });

  it('muestra una semana cada vez y permite avanzar con flechas', async () => {
    const dias = Array.from({ length: 8 }, (_, indice) => ({ fecha: `2030-09-${String(10 + indice).padStart(2, '0')}`, disponible: true, cantidadHorarios: 1, horariosDisponibles: [] }));
    consultarCalendarioDisponibilidad.mockResolvedValue({ desde: dias[0].fecha, hasta: dias.at(-1).fecha, dias, diasAntelacionReserva: 30 });
    render(<MemoryRouter><PaginaReserva /></MemoryRouter>);
    expect(await screen.findByText('10')).toBeInTheDocument(); expect(screen.queryByText('17')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Semana siguiente' }));
    expect(screen.getByText('17')).toBeInTheDocument(); expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('ordena servicio, fecha, hora y contacto en ese orden', async () => {
    render(<MemoryRouter><PaginaReserva /></MemoryRouter>); await screen.findByRole('option', { name: /Corte/ });
    const servicio = screen.getByLabelText(/Servicio/);
    const fecha = screen.getByText('Elige el día').closest('fieldset');
    const hora = screen.getByText('Elige una hora').closest('fieldset');
    const nombre = screen.getByLabelText(/Nombre/);
    const estaAntes = (primero, segundo) => Boolean(primero.compareDocumentPosition(segundo) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(estaAntes(servicio, fecha)).toBe(true); expect(estaAntes(fecha, hora)).toBe(true); expect(estaAntes(hora, nombre)).toBe(true);
  });

  it('solo muestra el código recibido en el estado temporal', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false });
    document.execCommand = vi.fn(() => true);
    const cita = { id: 7, codigoCancelacion: '00382', servicio: 'Corte', profesional: 'Mimi', fechaInicio: '2030-09-10T10:00:00', duracionMinutos: 30, precio: 18, estado: 'RESERVADA', mensaje: 'Reserva creada' };
    render(<MemoryRouter initialEntries={[{ pathname: '/confirmada', state: { cita } }]}><PaginaReservaConfirmada /></MemoryRouter>);
    expect(screen.getByText('00382')).toBeInTheDocument(); expect(screen.queryByText('Duración')).not.toBeInTheDocument(); await userEvent.click(screen.getByRole('button', { name: 'Copiar código' })); expect(screen.getByRole('button', { name: 'Código copiado' })).toBeInTheDocument(); expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});
