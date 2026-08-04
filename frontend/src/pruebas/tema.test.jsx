import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BotonTema } from '../componentes/comunes/BotonTema';

describe('selector de tema', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: false })) });
  });

  it('alterna entre modo oscuro y claro y recuerda la elección', async () => {
    render(<BotonTema />);
    expect(document.documentElement.dataset.tema).toBe('oscuro');
    await userEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    expect(document.documentElement.dataset.tema).toBe('claro');
    expect(window.localStorage.getItem('barberia-mimi-tema')).toBe('claro');
  });
});
