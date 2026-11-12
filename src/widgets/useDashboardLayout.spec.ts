import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useDashboardLayout } from './useDashboardLayout.js';
import { LAYOUT_POR_DEFECTO } from './tipos.js';

describe('useDashboardLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('arranca con el layout por defecto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));

    expect(result.current.items).toEqual(LAYOUT_POR_DEFECTO);
    expect(result.current.disponibles).toEqual([]);
  });

  it('quita y vuelve a agregar un widget', () => {
    const { result } = renderHook(() => useDashboardLayout(1));

    act(() => result.current.quitar('total'));

    expect(result.current.items.map((item) => item.tipo)).not.toContain('total');
    expect(result.current.disponibles).toContain('total');

    act(() => result.current.agregar('total'));

    expect(result.current.items.map((item) => item.tipo)).toContain('total');
  });

  it('mueve a izquierda/derecha y redimensiona', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const primero = result.current.items[0]!.tipo;

    act(() => result.current.moverDerecha(0));
    expect(result.current.items[1]!.tipo).toBe(primero);

    act(() => result.current.moverIzquierda(1));
    expect(result.current.items[0]!.tipo).toBe(primero);

    const spanInicial = result.current.items[0]!.span;
    act(() => result.current.redimensionar(0));
    expect(result.current.items[0]!.span).not.toBe(spanInicial);
  });

  it('persiste el layout por usuario', () => {
    const primera = renderHook(() => useDashboardLayout(7));
    act(() => primera.result.current.quitar('historial'));
    primera.unmount();

    const misma = renderHook(() => useDashboardLayout(7));
    expect(misma.result.current.items.map((item) => item.tipo)).not.toContain(
      'historial',
    );

    const otra = renderHook(() => useDashboardLayout(8));
    expect(otra.result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('restablece el layout por defecto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    act(() => result.current.quitar('total'));
    act(() => result.current.resetear());
    expect(result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('ignora un layout corrupto o inválido', () => {
    localStorage.setItem('mangos.dashboard.1', '{no-json');
    const corrupto = renderHook(() => useDashboardLayout(1));
    expect(corrupto.result.current.items).toEqual(LAYOUT_POR_DEFECTO);

    localStorage.setItem(
      'mangos.dashboard.2',
      JSON.stringify([
        { tipo: 'otro', span: 4 },
        { tipo: 'total', span: 4 },
        { tipo: 'total', span: 8 },
      ]),
    );
    const invalido = renderHook(() => useDashboardLayout(2));
    expect(invalido.result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });
});
