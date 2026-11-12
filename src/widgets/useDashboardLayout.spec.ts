import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { compactarFilas, useDashboardLayout } from './useDashboardLayout.js';
import { LAYOUT_POR_DEFECTO } from './tipos.js';
import type { WidgetLayoutItem } from './tipos.js';

function item(id: string, span: number): WidgetLayoutItem {
  return { id, tipo: 'total', span };
}

describe('useDashboardLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ajusta el widget al hueco exacto de la fila', () => {
    expect(
      compactarFilas([item('a', 4), item('b', 4), item('c', 8)]).map(
        (widget) => widget.span,
      ),
    ).toEqual([4, 4, 4]);

    expect(
      compactarFilas([item('a', 7), item('b', 8)]).map((widget) => widget.span),
    ).toEqual([7, 5]);
  });

  it('conserva el tamaño cuando el widget entra completo', () => {
    expect(
      compactarFilas([item('a', 4), item('b', 8)]).map((widget) => widget.span),
    ).toEqual([4, 8]);
  });

  it('no fuerza el ajuste si el hueco es menor al mínimo', () => {
    expect(
      compactarFilas([item('a', 4), item('b', 6), item('c', 6)]).map(
        (widget) => widget.span,
      ),
    ).toEqual([4, 6, 6]);
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

  it('mueve a izquierda/derecha', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const primero = result.current.items[0]!.id;

    act(() => result.current.moverDerecha(0));
    expect(result.current.items[1]!.id).toBe(primero);

    act(() => result.current.moverIzquierda(1));
    expect(result.current.items[0]!.id).toBe(primero);
  });

  it('reordena por id (drag & drop sortable)', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const ids = result.current.items.map((item) => item.id);

    act(() => result.current.moverPorId(ids[0]!, ids[3]!));
    expect(result.current.items[3]!.id).toBe(ids[0]);

    act(() => result.current.moverPorId('no-existe', ids[0]!));
    expect(result.current.items).toHaveLength(ids.length);
  });

  it('cambia el ancho a un valor concreto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    act(() => result.current.cambiarSpan(0, 12));
    expect(result.current.items[0]!.span).toBe(12);
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
      JSON.stringify([{ tipo: 'total', span: 13 }]),
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
