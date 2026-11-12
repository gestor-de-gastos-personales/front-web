import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetPeriodoSelector } from './WidgetPeriodoSelector.js';

describe('WidgetPeriodoSelector', () => {
  it('muestra las opciones y avisa el cambio', () => {
    const onCambiar = vi.fn();
    render(<WidgetPeriodoSelector valor="global" onCambiar={onCambiar} />);

    const selector = screen.getByRole('combobox', {
      name: 'Período del widget',
    });
    expect(selector).toHaveValue('global');
    expect(screen.getAllByRole('option')).toHaveLength(5);

    fireEvent.change(selector, { target: { value: 'anio' } });
    expect(onCambiar).toHaveBeenCalledWith('anio');
  });
});
