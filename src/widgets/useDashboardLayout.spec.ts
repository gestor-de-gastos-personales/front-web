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
  });

  it('quita una instancia y agrega otra', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const id = result.current.items[0]!.id;

    act(() => result.current.quitar(id));
    expect(result.current.items.map((item) => item.id)).not.toContain(id);

    act(() => result.current.agregar('total'));
    expect(result.current.items.filter((item) => item.tipo === 'total')).toHaveLength(1);
  });

  it('permite varias instancias del mismo tipo', () => {
    const { result } = renderHook(() => useDashboardLayout(1));

    act(() => result.current.agregar('evolucion'));
    act(() => result.current.agregar('evolucion'));

    const graficos = result.current.items.filter((item) => item.tipo === 'evolucion');
    expect(graficos).toHaveLength(3);
    expect(new Set(graficos.map((item) => item.id)).size).toBe(3);
  });

  it('mueve a izquierda/derecha y redimensiona', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const primero = result.current.items[0]!.id;

    act(() => result.current.moverDerecha(0));
    expect(result.current.items[1]!.id).toBe(primero);

    act(() => result.current.moverIzquierda(1));
    expect(result.current.items[0]!.id).toBe(primero);

    const spanInicial = result.current.items[0]!.span;
    act(() => result.current.redimensionar(0));
    expect(result.current.items[0]!.span).not.toBe(spanInicial);
  });

  it('reordena por id (drag & drop sortable)', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const ids = result.current.items.map((item) => item.id);

    act(() => result.current.moverPorId(ids[0]!, ids[3]!));
    expect(result.current.items[3]!.id).toBe(ids[0]);

    act(() => result.current.moverPorId('no-existe', ids[0]!));
    expect(result.current.items).toHaveLength(ids.length);
  });

  it('persiste las instancias por usuario', () => {
    const primera = renderHook(() => useDashboardLayout(7));
    const id = primera.result.current.items[0]!.id;
    act(() => primera.result.current.quitar(id));
    primera.unmount();

    const misma = renderHook(() => useDashboardLayout(7));
    expect(misma.result.current.items.map((item) => item.id)).not.toContain(id);

    const otra = renderHook(() => useDashboardLayout(8));
    expect(otra.result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('restablece el layout por defecto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    act(() => result.current.quitar(result.current.items[0]!.id));
    act(() => result.current.resetear());
    expect(result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('migra el formato anterior sin id', () => {
    localStorage.setItem(
      'mangos.dashboard.3',
      JSON.stringify([{ tipo: 'total', span: 4 }]),
    );

    const { result } = renderHook(() => useDashboardLayout(3));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ tipo: 'total', span: 4 });
    expect(result.current.items[0]!.id).toBeTruthy();
  });

  it('ignora layouts corruptos o inválidos', () => {
    localStorage.setItem('mangos.dashboard.1', '{no-json');
    const corrupto = renderHook(() => useDashboardLayout(1));
    expect(corrupto.result.current.items).toEqual(LAYOUT_POR_DEFECTO);

    localStorage.setItem(
      'mangos.dashboard.2',
      JSON.stringify([{ tipo: 'total', span: 5 }]),
    );
    const spanInvalido = renderHook(() => useDashboardLayout(2));
    expect(spanInvalido.result.current.items).toEqual(LAYOUT_POR_DEFECTO);

    localStorage.setItem(
      'mangos.dashboard.4',
      JSON.stringify([{ tipo: 'otro', span: 4 }]),
    );
    const tipoInvalido = renderHook(() => useDashboardLayout(4));
    expect(tipoInvalido.result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });
});
