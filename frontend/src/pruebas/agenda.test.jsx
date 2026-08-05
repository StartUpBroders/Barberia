import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaginaHorarios } from '../paginas/PaginaHorarios';
import { PaginaRutinaLaboral } from '../paginas/PaginaRutinaLaboral';
import { PaginaDiasBloqueados } from '../paginas/PaginaDiasBloqueados';
import * as horariosApi from '../api/horariosApi';
import * as bloqueosApi from '../api/diasBloqueadosApi';
import * as profesionalesApi from '../api/profesionalesApi';
import * as trabajosApi from '../api/diasTrabajoEspecialApi';
import * as configuracionApi from '../api/configuracionReservasApi';
import * as citasApi from '../api/citasApi';

vi.mock('../api/horariosApi'); vi.mock('../api/diasBloqueadosApi'); vi.mock('../api/profesionalesApi'); vi.mock('../api/diasTrabajoEspecialApi'); vi.mock('../api/configuracionReservasApi'); vi.mock('../api/citasApi');
vi.mock('../hooks/usarAutenticacion', () => ({ usarAutenticacion: () => ({ sesion: { rol: 'PROPIETARIO', profesional: { id: 2, nombre: 'Mimi', alias: 'mimi' } } }) }));

describe('gestión de agenda', () => {
  beforeEach(() => {
    profesionalesApi.listarEquipo.mockResolvedValue([{ id: 2, nombre: 'Mimi', activo: true }]);
    horariosApi.listarHorarios.mockResolvedValue([]); bloqueosApi.listarDiasBloqueados.mockResolvedValue([]);
    horariosApi.listarOcupacionesEquipo.mockResolvedValue([]);
    trabajosApi.listarDiasTrabajoEspecial.mockResolvedValue([]); citasApi.listarCitas.mockResolvedValue([]);
    configuracionApi.consultarConfiguracionReservas.mockResolvedValue({ intervaloMinutos: 30, diasAntelacionReserva: 30 });
    configuracionApi.actualizarConfiguracionReservas.mockResolvedValue({ intervaloMinutos: 30, diasAntelacionReserva: 30 });
    horariosApi.crearHorario.mockResolvedValue({ id: 1 }); bloqueosApi.crearDiaBloqueado.mockResolvedValue({ id: 1 });
    horariosApi.guardarRutinaSemanal.mockResolvedValue([]);
    bloqueosApi.crearBloqueosParciales.mockResolvedValue({ mensaje: '2 tramos bloqueados. No había citas afectadas.', citasAfectadas: [] });
  });

  it('pregunta primero la duración y calcula con ella los finales de turno', async () => {
    render(<PaginaRutinaLaboral />); await screen.findByText('Días y jornada habitual'); const usuario = userEvent.setup();
    const tiempoCliente = screen.getByLabelText(/Tiempo por cliente/); const primerDesde = screen.getAllByLabelText('Desde')[0];
    expect(tiempoCliente.compareDocumentPosition(primerDesde) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await usuario.selectOptions(tiempoCliente, '45');
    const finales = [...screen.getAllByLabelText('Hasta')[0].options].map((opcion) => opcion.value);
    expect(finales).toContain('08:45'); expect(finales).toContain('09:30'); expect(finales).not.toContain('09:00');
  });

  it('guarda días laborables, dos turnos y reglas de reserva', async () => {
    render(<PaginaRutinaLaboral />); await screen.findByText('Días y jornada habitual'); const usuario = userEvent.setup();
    expect([...screen.getByLabelText(/Reserva anticipada/).options].map((opcion) => opcion.value)).toEqual(['7', '10', '15', '20', '30', '45', '60', '90']);
    await usuario.selectOptions(screen.getByLabelText(/Tiempo por cliente/), '45'); await usuario.selectOptions(screen.getByLabelText(/Reserva anticipada/), '7'); await usuario.click(screen.getByRole('button', { name: 'Guardar rutina' }));
    await waitFor(() => expect(horariosApi.guardarRutinaSemanal).toHaveBeenCalledOnce());
    expect(horariosApi.guardarRutinaSemanal).toHaveBeenCalledWith({ profesionalId: 2, tramos: expect.arrayContaining([expect.objectContaining({ diaSemana: 'MONDAY', horaInicio: '08:00:00', horaFin: '14:00:00' })]), intervaloMinutos: 45, diasAntelacionReserva: 7 });
  });

  it('marca confirmadas y completadas y muestra el cliente del profesional', async () => {
    const hoy = new Date();
    const fecha = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')].join('-');
    horariosApi.listarOcupacionesEquipo.mockResolvedValue([
      { profesionalId: 2, profesional: 'Mimi', nombreCliente: 'Álvaro Ruiz', estado: 'COMPLETADA', fechaInicio: `${fecha}T10:00:00`, fechaFin: `${fecha}T10:30:00` },
      { profesionalId: 2, profesional: 'Mimi', nombreCliente: 'Primo José', estado: 'CONFIRMADA', fechaInicio: `${fecha}T11:00:00`, fechaFin: `${fecha}T11:30:00` },
      { profesionalId: 3, profesional: 'Otro', nombreCliente: 'Luis', estado: 'CONFIRMADA', fechaInicio: `${fecha}T12:00:00`, fechaFin: `${fecha}T12:30:00` },
    ]);
    render(<MemoryRouter><PaginaHorarios /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Citas (2)' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tiene citas')).toBeInTheDocument();
    expect(screen.getByText('Álvaro Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Primo José')).toBeInTheDocument();
    expect(screen.getByText('Finalizado')).toHaveClass('estado-completada');
    expect(screen.getByText('Confirmada')).toHaveClass('estado-confirmada');
    expect(screen.queryByText('Luis')).not.toBeInTheDocument();
    expect(screen.queryByText('Días y jornada habitual')).not.toBeInTheDocument();
  });

  it('permite volver al día de hoy después de navegar a otro mes', async () => {
    render(<MemoryRouter><PaginaHorarios /></MemoryRouter>);
    const usuario = userEvent.setup();
    const hoy = new Date();
    const mesActual = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(hoy);

    await screen.findByRole('heading', { name: mesActual });
    await usuario.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.queryByRole('heading', { name: mesActual })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Volver a hoy' }));

    expect(screen.getByRole('heading', { name: mesActual })).toBeInTheDocument();
    const botonHoy = screen.getByRole('button', { name: new RegExp(`^${hoy.getDate()} de`) });
    expect(botonHoy).toHaveAttribute('aria-pressed', 'true');
    expect(botonHoy).toHaveAttribute('class', expect.stringContaining('seleccionado'));
  });

  it('avisa antes de cerrar un día con citas y confirma su cancelación', async () => {
    const fecha = new Date();
    const iso = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-');
    const dias = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    horariosApi.listarHorarios.mockResolvedValue([{ id: 1, profesionalId: 2, diaSemana: dias[fecha.getDay()], horaInicio: '09:00:00', horaFin: '14:00:00', activo: true }]);
    horariosApi.listarOcupacionesEquipo.mockResolvedValue([
      { profesionalId: 2, profesional: 'Mimi', nombreCliente: 'Ana', estado: 'CONFIRMADA', fechaInicio: `${iso}T10:00:00`, fechaFin: `${iso}T10:30:00` },
      { profesionalId: 2, profesional: 'Mimi', nombreCliente: 'Luis', estado: 'CONFIRMADA', fechaInicio: `${iso}T11:00:00`, fechaFin: `${iso}T11:30:00` },
      { profesionalId: 2, profesional: 'Mimi', nombreCliente: 'Finalizada', estado: 'COMPLETADA', fechaInicio: `${iso}T09:00:00`, fechaFin: `${iso}T09:30:00` },
    ]);
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const actualizarNotificaciones = vi.fn();
    window.addEventListener('notificaciones-actualizadas', actualizarNotificaciones);
    render(<MemoryRouter><PaginaHorarios /></MemoryRouter>);
    const usuario = userEvent.setup();
    const boton = await screen.findByRole('button', { name: 'Marcar como descanso' });
    await usuario.click(boton);
    expect(confirmar).toHaveBeenLastCalledWith(expect.stringContaining('Este día tiene 2 citas confirmadas'));
    expect(bloqueosApi.crearDiaBloqueado).not.toHaveBeenCalled();
    await usuario.click(boton);
    await waitFor(() => expect(bloqueosApi.crearDiaBloqueado).toHaveBeenCalledWith({ profesionalId: 2, fecha: iso, horaInicio: null, horaFin: null, motivo: 'Descanso desde el calendario' }));
    expect(actualizarNotificaciones).toHaveBeenCalledOnce();
    expect(await screen.findByText(/se han cancelado 2 citas/i)).toBeInTheDocument();
    window.removeEventListener('notificaciones-actualizadas', actualizarNotificaciones);
  });

  it('permite elegir visualmente varios tramos libres y bloquearlos juntos', async () => {
    const fecha = new Date(); fecha.setDate(fecha.getDate() + 1); const dias = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    horariosApi.listarHorarios.mockResolvedValue([{ id: 1, profesionalId: 2, diaSemana: dias[fecha.getDay()], horaInicio: '09:00:00', horaFin: '10:00:00', activo: true }]);
    render(<PaginaDiasBloqueados />); await screen.findByText('Sin bloqueos parciales'); const usuario = userEvent.setup(); await usuario.click(await screen.findByRole('button', { name: /09:00.*Libre/ })); await usuario.click(screen.getByRole('button', { name: /09:30.*Libre/ })); await usuario.type(screen.getByLabelText('Motivo'), 'Gestión personal'); await usuario.click(screen.getByRole('button', { name: 'Bloquear 2 tramos' }));
    await waitFor(() => expect(bloqueosApi.crearBloqueosParciales).toHaveBeenCalledWith({ profesionalId: 2, fecha: expect.any(String), tramos: [{ horaInicio: '09:00:00', horaFin: '09:30:00' }, { horaInicio: '09:30:00', horaFin: '10:00:00' }], motivo: 'Gestión personal' }));
  });
});
