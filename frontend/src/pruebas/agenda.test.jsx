import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaginaHorarios } from '../paginas/PaginaHorarios';
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
    profesionalesApi.listarProfesionales.mockResolvedValue([{ id: 2, nombre: 'Mimi', activo: true }]);
    horariosApi.listarHorarios.mockResolvedValue([]); bloqueosApi.listarDiasBloqueados.mockResolvedValue([]);
    horariosApi.listarOcupacionesEquipo.mockResolvedValue([]);
    trabajosApi.listarDiasTrabajoEspecial.mockResolvedValue([]); citasApi.listarCitas.mockResolvedValue([]);
    configuracionApi.consultarConfiguracionReservas.mockResolvedValue({ intervaloMinutos: 30, diasAntelacionReserva: 30 });
    configuracionApi.actualizarConfiguracionReservas.mockResolvedValue({ intervaloMinutos: 30, diasAntelacionReserva: 30 });
    horariosApi.crearHorario.mockResolvedValue({ id: 1 }); bloqueosApi.crearDiaBloqueado.mockResolvedValue({ id: 1 });
    horariosApi.guardarRutinaSemanal.mockResolvedValue([]);
    bloqueosApi.crearBloqueosParciales.mockResolvedValue({ mensaje: '2 tramos bloqueados. No había citas afectadas.', citasAfectadas: [] });
  });

  it('impide guardar una rutina con horas invertidas', async () => {
    render(<PaginaHorarios />); await screen.findByText('Días y jornada habitual'); const usuario = userEvent.setup(); await usuario.selectOptions(screen.getAllByLabelText('Desde')[0], '14:00'); await usuario.selectOptions(screen.getAllByLabelText('Hasta')[0], '09:00'); await usuario.click(screen.getByRole('button', { name: 'Guardar rutina' })); expect(screen.getByRole('alert')).toHaveTextContent('La hora final debe ser posterior'); expect(horariosApi.guardarRutinaSemanal).not.toHaveBeenCalled();
  });

  it('guarda días laborables, dos turnos y reglas de reserva', async () => {
    render(<PaginaHorarios />); await screen.findByText('Días y jornada habitual'); await userEvent.click(screen.getByRole('button', { name: 'Guardar rutina' }));
    await waitFor(() => expect(horariosApi.guardarRutinaSemanal).toHaveBeenCalledOnce());
    expect(horariosApi.guardarRutinaSemanal).toHaveBeenCalledWith({ profesionalId: 2, tramos: expect.arrayContaining([expect.objectContaining({ diaSemana: 'MONDAY', horaInicio: '08:00:00', horaFin: '14:00:00' })]), intervaloMinutos: 30, diasAntelacionReserva: 30 });
  });

  it('marca y lista solamente las citas confirmadas del profesional', async () => {
    const hoy = new Date();
    const fecha = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')].join('-');
    horariosApi.listarOcupacionesEquipo.mockResolvedValue([
      { profesionalId: 2, profesional: 'Mimi', servicio: 'Corte', fechaInicio: `${fecha}T10:00:00`, fechaFin: `${fecha}T10:30:00` },
      { profesionalId: 3, profesional: 'Otro', servicio: 'Corte', fechaInicio: `${fecha}T12:00:00`, fechaFin: `${fecha}T12:30:00` },
    ]);
    render(<PaginaHorarios />);
    expect(await screen.findByRole('heading', { name: 'Citas (1)' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tiene citas')).toBeInTheDocument();
    expect(screen.getByText('Corte')).toBeInTheDocument();
    expect(screen.queryByText('Luis')).not.toBeInTheDocument();
  });

  it('permite elegir visualmente varios tramos libres y bloquearlos juntos', async () => {
    const fecha = new Date(); fecha.setDate(fecha.getDate() + 1); const dias = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    horariosApi.listarHorarios.mockResolvedValue([{ id: 1, profesionalId: 2, diaSemana: dias[fecha.getDay()], horaInicio: '09:00:00', horaFin: '10:00:00', activo: true }]);
    render(<PaginaDiasBloqueados />); await screen.findByText('Sin bloqueos parciales'); const usuario = userEvent.setup(); await usuario.click(await screen.findByRole('button', { name: /09:00.*Libre/ })); await usuario.click(screen.getByRole('button', { name: /09:30.*Libre/ })); await usuario.type(screen.getByLabelText('Motivo'), 'Gestión personal'); await usuario.click(screen.getByRole('button', { name: 'Bloquear 2 tramos' }));
    await waitFor(() => expect(bloqueosApi.crearBloqueosParciales).toHaveBeenCalledWith({ profesionalId: 2, fecha: expect.any(String), tramos: [{ horaInicio: '09:00:00', horaFin: '09:30:00' }, { horaInicio: '09:30:00', horaFin: '10:00:00' }], motivo: 'Gestión personal' }));
  });
});
