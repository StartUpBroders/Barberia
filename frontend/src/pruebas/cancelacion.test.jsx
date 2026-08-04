import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PaginaCancelarCita } from '../paginas/PaginaCancelarCita';
import { cancelarCitaPublica } from '../api/citasApi';

vi.mock('../api/citasApi', () => ({ cancelarCitaPublica: vi.fn() }));

describe('cancelación pública', () => {
  it('valida antes de enviar y conserva ceros iniciales', async () => {
    cancelarCitaPublica.mockResolvedValue({ mensaje: 'Cita cancelada correctamente.' });
    render(<PaginaCancelarCita />); const usuario = userEvent.setup(); await usuario.type(screen.getByLabelText(/Móvil/), '600000000'); await usuario.type(screen.getByLabelText(/Código de cancelación/), '00382'); await usuario.click(screen.getByRole('button', { name: 'Cancelar mi cita' }));
    expect(cancelarCitaPublica).toHaveBeenCalledWith('barberia-mimi', { telefonoCliente: '600000000', codigoCancelacion: '00382' });
    expect(await screen.findByText('Cita cancelada correctamente.')).toBeInTheDocument();
  });

  it('muestra el mensaje seguro del backend para un 422', async () => {
    cancelarCitaPublica.mockRejectedValue({ estadoHttp: 422, mensaje: 'No se puede cancelar la cita.' });
    render(<PaginaCancelarCita />); const usuario = userEvent.setup(); await usuario.type(screen.getByLabelText(/Móvil/), '600000000'); await usuario.type(screen.getByLabelText(/Código de cancelación/), '12345'); await usuario.click(screen.getByRole('button', { name: 'Cancelar mi cita' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede cancelar la cita.');
  });
});
