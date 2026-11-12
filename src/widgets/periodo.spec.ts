import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolverPeriodo } from './periodo.js';
import type { Periodo } from '../utils/periodo.js';

const GLOBAL: Periodo = {
  desde: '2026-11-01',
  hasta: '2026-11-30',
  etiqueta: 'Global',
  agrupacion: 'dia',
};

describe('resolverPeriodo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sigue el período global cuando no hay override', () => {
    expect(resolverPeriodo(undefined, GLOBAL)).toBe(GLOBAL);
    expect(resolverPeriodo('global', GLOBAL)).toBe(GLOBAL);
  });

  it('resuelve los rangos predefinidos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 12, 12));

    expect(resolverPeriodo('mes', GLOBAL)).toMatchObject({
      desde: '2026-11-01',
      hasta: '2026-11-30',
      agrupacion: 'dia',
    });
    expect(resolverPeriodo('mes-anterior', GLOBAL)).toMatchObject({
      desde: '2026-10-01',
      hasta: '2026-10-31',
    });
    expect(resolverPeriodo('3-meses', GLOBAL)).toMatchObject({
      desde: '2026-09-01',
      hasta: '2026-11-30',
      agrupacion: 'semana',
    });
    expect(resolverPeriodo('anio', GLOBAL)).toMatchObject({
      desde: '2026-01-01',
      hasta: '2026-12-31',
      agrupacion: 'mes',
    });
  });
});
