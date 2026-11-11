import { describe, expect, it } from 'vitest';
import { formatearFecha, formatearMonto, formatearPorcentaje, mensajeDeError } from './format.js';

describe('format', () => {
  it('formatea montos en pesos sin decimales', () => {
    expect(formatearMonto(1500)).toContain('1.500');
    expect(formatearMonto('2500.75')).toContain('2.501');
  });

  it('usa cero para valores inválidos', () => {
    expect(formatearMonto(null)).toContain('0');
    expect(formatearMonto('no-es-numero')).toContain('0');
  });

  it('formatea fechas ISO y tolera vacíos', () => {
    expect(formatearFecha('2026-11-01T12:00:00Z')).toBe('01/11/2026');
    expect(formatearFecha(null)).toBe('—');
    expect(formatearFecha('invalida')).toBe('—');
  });

  it('formatea porcentajes con un decimal', () => {
    expect(formatearPorcentaje(33.333)).toBe('33.3%');
  });

  it('extrae el mensaje de un Error', () => {
    expect(mensajeDeError(new Error('falló'))).toBe('falló');
    expect(mensajeDeError('otro')).toBe('No se pudo completar la operación');
  });
});
