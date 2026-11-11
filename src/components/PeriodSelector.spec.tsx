import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PeriodSelector } from './PeriodSelector.js';
import { usePeriodo } from '../state/periodo.store.js';
import { mesActual } from '../utils/periodo.js';

const HOY = new Date(2026, 10, 11);

describe('PeriodSelector', () => {
  beforeEach(() => {
    usePeriodo.setState({ periodo: mesActual(HOY) });
  });

  it('cambia a mes anterior y a últimos 3 meses', () => {
    render(<PeriodSelector />);
    const selector = screen.getByLabelText('Rango');

    fireEvent.change(selector, { target: { value: 'mes-anterior' } });
    expect(usePeriodo.getState().periodo.etiqueta).toMatch(/octubre/i);

    fireEvent.change(selector, { target: { value: '3-meses' } });
    expect(usePeriodo.getState().periodo.desde).toBe('2026-09-01');
    expect(usePeriodo.getState().periodo.agrupacion).toBe('semana');
  });

  it('aplica un rango personalizado válido', () => {
    render(<PeriodSelector />);
    fireEvent.change(screen.getByLabelText('Rango'), { target: { value: 'custom' } });

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-01' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(usePeriodo.getState().periodo).toMatchObject({
      desde: '2026-11-01',
      hasta: '2026-11-10',
      etiqueta: '01/11/2026 — 10/11/2026',
    });
  });

  it('avisa cuando el rango es inválido', () => {
    render(<PeriodSelector />);
    fireEvent.change(screen.getByLabelText('Rango'), { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-10' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/rango válido/);
  });

  it('cambia al año actual', () => {
    render(<PeriodSelector />);
    fireEvent.change(screen.getByLabelText('Rango'), { target: { value: 'anio' } });
    expect(usePeriodo.getState().periodo.desde).toBe('2026-01-01');
    expect(usePeriodo.getState().periodo.agrupacion).toBe('mes');
  });
});
