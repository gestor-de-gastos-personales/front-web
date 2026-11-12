import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetPeriodoSelector } from './WidgetPeriodoSelector.js';

describe('WidgetPeriodoSelector', () => {
  it('muestra las opciones y avisa el cambio', () => {
    const onCambiar = vi.fn();
    render(<WidgetPeriodoSelector valor="mes" onCambiar={onCambiar} />);

    const selector = screen.getByRole('combobox', {
      name: 'Período del widget',
    });
    expect(selector).toHaveValue('mes');
    expect(screen.getAllByRole('option')).toHaveLength(7);
    expect(screen.getByRole('option', { name: 'Hoy' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Esta semana' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Últimos 15 días' }),
    ).toBeInTheDocument();

    fireEvent.change(selector, { target: { value: 'anio' } });
    expect(onCambiar).toHaveBeenCalledWith('anio');
  });
});
