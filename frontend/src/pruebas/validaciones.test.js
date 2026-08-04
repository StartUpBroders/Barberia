import { describe, expect, it } from 'vitest';
import { hayErrores, validarCancelacion, validarReserva } from '../utilidades/validaciones';

describe('validaciones de reserva', () => {
  it('detecta todos los campos obligatorios ausentes', () => {
    const errores = validarReserva({ nombreCliente: '', telefonoCliente: '', servicioId: '', profesionalId: '', fecha: '', fechaInicio: '', notaCliente: '' });
    expect(errores).toMatchObject({ nombreCliente: expect.any(String), telefonoCliente: expect.any(String), servicioId: expect.any(String), profesionalId: expect.any(String), fecha: expect.any(String), fechaInicio: expect.any(String) });
    expect(hayErrores(errores)).toBe(true);
  });

  it('conserva y acepta códigos de cinco cifras con ceros iniciales', () => {
    expect(validarCancelacion({ telefonoCliente: '600000000', codigoCancelacion: '00382' })).toEqual({});
  });

  it('exige exactamente nueve cifras en el móvil', () => {
    expect(validarReserva({ nombreCliente: 'Ana', telefonoCliente: '60000000', servicioId: '1', profesionalId: '2', fecha: '2030-09-10', fechaInicio: '2030-09-10T10:00:00', notaCliente: '' }).telefonoCliente).toBe('El móvil debe tener exactamente 9 cifras.');
    expect(validarReserva({ nombreCliente: 'Ana', telefonoCliente: '600000000', servicioId: '1', profesionalId: '2', fecha: '2030-09-10', fechaInicio: '2030-09-10T10:00:00', notaCliente: '' }).telefonoCliente).toBeUndefined();
  });

  it('rechaza teléfono y código inválidos', () => {
    expect(validarCancelacion({ telefonoCliente: '12', codigoCancelacion: '382' })).toEqual({ telefonoCliente: expect.any(String), codigoCancelacion: expect.any(String) });
  });
});
