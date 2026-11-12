import { describe, expect, it } from 'vitest';
import {
  aDDMMYYYY,
  anioActual,
  estaSemana,
  hoyPeriodo,
  mesActual,
  mesAnterior,
  mesYAnio,
  periodoPersonalizado,
  ultimosDias,
  ultimosMeses,
} from './periodo.js';

const HOY = new Date(2026, 10, 11); // 11/11/2026

describe('periodo', () => {
  it('calcula el mes actual completo', () => {
    expect(mesActual(HOY)).toMatchObject({
      desde: '2026-11-01',
      hasta: '2026-11-30',
      agrupacion: 'dia',
    });
  });

  it('calcula el mes anterior cruzando de año', () => {
    const enero = new Date(2026, 0, 15);
    expect(mesAnterior(enero).desde).toBe('2025-12-01');
    expect(mesAnterior(enero).hasta).toBe('2025-12-31');
  });

  it('calcula los últimos meses con agrupación semanal o mensual', () => {
    expect(ultimosMeses(3, HOY).desde).toBe('2026-09-01');
    expect(ultimosMeses(3, HOY).agrupacion).toBe('semana');
    expect(ultimosMeses(6, HOY).agrupacion).toBe('mes');
  });

  it('calcula hoy, esta semana y los últimos 15 días', () => {
    expect(hoyPeriodo(HOY)).toMatchObject({
      desde: '2026-11-11',
      hasta: '2026-11-11',
      etiqueta: 'Hoy',
      agrupacion: 'dia',
    });
    expect(estaSemana(HOY)).toMatchObject({
      desde: '2026-11-09',
      hasta: '2026-11-15',
      etiqueta: 'Esta semana',
    });
    expect(ultimosDias(15, HOY)).toMatchObject({
      desde: '2026-10-28',
      hasta: '2026-11-11',
      etiqueta: 'Últimos 15 días',
    });
  });

  it('calcula el año calendario', () => {
    expect(anioActual(HOY)).toMatchObject({
      desde: '2026-01-01',
      hasta: '2026-12-31',
      agrupacion: 'mes',
    });
  });

  it('valida el período personalizado', () => {
    expect(periodoPersonalizado('2026-11-01', '2026-11-10')).toMatchObject({
      desde: '2026-11-01',
      hasta: '2026-11-10',
      agrupacion: 'dia',
    });
    expect(periodoPersonalizado('2026-11-10', '2026-11-01')).toBeNull();
    expect(periodoPersonalizado('', '2026-11-01')).toBeNull();
  });

  it('convierte a DD-MM-YYYY y extrae mes/año', () => {
    expect(aDDMMYYYY('2026-11-01')).toBe('01-11-2026');
    expect(mesYAnio(mesActual(HOY))).toEqual({ mes: 11, anio: 2026 });
  });
});
