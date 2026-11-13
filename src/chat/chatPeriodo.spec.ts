import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  categoriaSugerida,
  fechaHoyISO,
  periodoDesdeRango,
} from './chatPeriodo.js';
import type { AnalisisIA } from './tipos.js';

const GLOBAL = {
  desde: '2026-11-01',
  hasta: '2026-11-30',
  etiqueta: 'Global',
  agrupacion: 'dia' as const,
};

function analisis(overrides: Partial<AnalisisIA> = {}): AnalisisIA {
  return {
    intent: 'CREATE_EXPENSE',
    monto: null,
    comercio: null,
    categoria: null,
    descripcion: null,
    fecha: null,
    rango: null,
    recurringHint: null,
    searchHint: null,
    campos: null,
    ...overrides,
  };
}

describe('chatPeriodo', () => {
  afterEach(() => vi.useRealTimers());

  it('resuelve cada rango de la IA', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 12, 12));

    expect(periodoDesdeRango('WEEK', GLOBAL)).toMatchObject({
      desde: '2026-11-09',
      hasta: '2026-11-15',
    });
    expect(periodoDesdeRango('15_DAYS', GLOBAL)).toMatchObject({
      desde: '2026-10-29',
      hasta: '2026-11-12',
    });
    expect(periodoDesdeRango('MONTH', GLOBAL)).toMatchObject({
      desde: '2026-11-01',
      hasta: '2026-11-30',
    });
    expect(periodoDesdeRango('2_MONTHS', GLOBAL)).toMatchObject({
      desde: '2026-10-01',
      hasta: '2026-11-30',
    });
    expect(periodoDesdeRango('YEAR', GLOBAL)).toMatchObject({
      desde: '2026-01-01',
      hasta: '2026-12-31',
    });
    expect(periodoDesdeRango(null, GLOBAL)).toBe(GLOBAL);
    expect(periodoDesdeRango(undefined, GLOBAL)).toBe(GLOBAL);
  });

  it('calcula la fecha local de hoy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 12, 23, 30));
    expect(fechaHoyISO()).toBe('2026-11-12');
  });

  it('sugiere una categoría por nombre, sin acentos y por coincidencia parcial', () => {
    const categorias = [
      { id: 1, nombre: 'Alimentación' },
      { id: 2, nombre: 'Ocio y Entretenimiento' },
    ];

    expect(categoriaSugerida(analisis({ categoria: 'alimentacion' }), categorias)?.id).toBe(1);
    expect(categoriaSugerida(analisis({ categoria: 'OCIO' }), categorias)?.id).toBe(2);
    expect(categoriaSugerida(analisis({ categoria: 'inexistente' }), categorias)).toBeUndefined();
    expect(categoriaSugerida(analisis(), categorias)).toBeUndefined();
  });
});
