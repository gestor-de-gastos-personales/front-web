import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buscarHueco,
  empaquetar,
  useDashboardLayout,
} from './useDashboardLayout.js';
import { LAYOUT_POR_DEFECTO } from './tipos.js';
import type { WidgetLayoutItem } from './tipos.js';

function item(
  id: string,
  w: number,
  h = 5,
  x = 0,
  y = 0,
): WidgetLayoutItem {
  return { id, tipo: 'total', x, y, w, h };
}

describe('useDashboardLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('arranca con el layout por defecto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    expect(result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('empaqueta en filas de 12 columnas', () => {
    const resultado = empaquetar([
      item('a', 4, 5),
      item('b', 8, 6),
      item('c', 4, 5),
    ]);

    expect(resultado.map(({ x, y, w }) => ({ x, y, w }))).toEqual([
      { x: 0, y: 0, w: 4 },
      { x: 4, y: 0, w: 8 },
      { x: 0, y: 6, w: 4 },
    ]);
  });

  it('busca el primer hueco libre, incluso entre widgets', () => {
    expect(buscarHueco([item('a', 12, 1)], 4, 5)).toEqual({ x: 0, y: 1 });
    expect(buscarHueco([item('a', 4, 5)], 4, 5)).toEqual({ x: 4, y: 0 });
    expect(
      buscarHueco([item('a', 4, 5), item('b', 4, 5, 8, 0)], 4, 5),
    ).toEqual({ x: 4, y: 0 });
  });

  it('quita una instancia y agrega otra en el primer hueco', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const id = result.current.items[0]!.id;

    act(() => result.current.quitar(id));
    expect(result.current.items.map((widget) => widget.id)).not.toContain(id);

    act(() => result.current.agregar('total'));
    const agregados = result.current.items.filter(
      (widget) => widget.tipo === 'total',
    );
    expect(agregados).toHaveLength(1);
    expect(agregados[0]).toMatchObject({ x: 0, y: 0, w: 4, h: 5 });
  });

  it('agrega al final cuando el tablero está completo', () => {
    const { result } = renderHook(() => useDashboardLayout(1));

    act(() => result.current.agregar('total'));

    const nuevo = result.current.items.at(-1)!;
    expect(nuevo).toMatchObject({ x: 0, y: 20, w: 4, h: 5 });
  });

  it('permite varias instancias del mismo tipo', () => {
    const { result } = renderHook(() => useDashboardLayout(1));

    act(() => result.current.agregar('evolucion'));
    act(() => result.current.agregar('evolucion'));

    const graficos = result.current.items.filter(
      (widget) => widget.tipo === 'evolucion',
    );
    expect(graficos).toHaveLength(3);
    expect(new Set(graficos.map((widget) => widget.id)).size).toBe(3);
  });

  it('mueve a izquierda/derecha y reacomoda las filas', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const primero = result.current.items[0]!.id;

    act(() => result.current.moverDerecha(0));
    expect(result.current.items[1]!.id).toBe(primero);

    act(() => result.current.moverIzquierda(1));
    expect(result.current.items[0]!.id).toBe(primero);
  });

  it('aplica la geometría que devuelve GridStack', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const [primero, segundo] = result.current.items;

    act(() =>
      result.current.actualizarDesdeGrilla([
        { id: primero!.id, x: 8, y: 0, w: 4, h: 5 },
        { id: segundo!.id, x: 0, y: 0, w: 8, h: 5 },
      ]),
    );

    expect(result.current.items[0]).toMatchObject({
      id: segundo!.id,
      x: 0,
      y: 0,
      w: 8,
      h: 5,
    });
    expect(result.current.items[1]).toMatchObject({
      id: primero!.id,
      x: 8,
      y: 0,
      w: 4,
      h: 5,
    });
  });

  it('ignora una sincronización vacía o sin cambios', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const anterior = result.current.items;

    act(() => result.current.actualizarDesdeGrilla([]));
    act(() =>
      result.current.actualizarDesdeGrilla(
        anterior.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })),
      ),
    );

    expect(result.current.items).toBe(anterior);
  });

  it('cambia el período de un widget sin afectar al resto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    const id = result.current.items[0]!.id;

    act(() => result.current.cambiarPeriodo(id, 'mes-anterior'));
    expect(result.current.items[0]!.periodo).toBe('mes-anterior');
    expect(result.current.items[1]!.periodo).toBeUndefined();

    act(() => result.current.cambiarPeriodo(id, 'global'));
    expect(result.current.items[0]!.periodo).toBeUndefined();
  });

  it('persiste el período elegido por widget', () => {
    const primera = renderHook(() => useDashboardLayout(4));
    const id = primera.result.current.items[0]!.id;
    act(() => primera.result.current.cambiarPeriodo(id, 'anio'));
    primera.unmount();

    const misma = renderHook(() => useDashboardLayout(4));
    expect(misma.result.current.items[0]!.periodo).toBe('anio');
  });

  it('descarta widgets eliminados sin perder el resto del layout', () => {
    localStorage.setItem(
      'mangos.dashboard.10',
      JSON.stringify([
        { id: 'total-1', tipo: 'total', x: 0, y: 0, w: 4, h: 5 },
        { id: 'ultimos-1', tipo: 'ultimos', x: 0, y: 5, w: 4, h: 7 },
        { id: 'historial-1', tipo: 'historial', x: 0, y: 12, w: 12, h: 7 },
      ]),
    );

    const { result } = renderHook(() => useDashboardLayout(10));

    expect(result.current.items.map((widget) => widget.tipo)).toEqual([
      'total',
      'historial',
    ]);
  });

  it('ignora un modo de período desconocido', () => {
    localStorage.setItem(
      'mangos.dashboard.11',
      JSON.stringify([
        { id: 'total-1', tipo: 'total', x: 0, y: 0, w: 4, h: 5, periodo: 'raro' },
      ]),
    );

    const { result } = renderHook(() => useDashboardLayout(11));
    expect(result.current.items[0]!.periodo).toBeUndefined();
  });

  it('persiste las instancias por usuario', () => {
    const primera = renderHook(() => useDashboardLayout(7));
    const id = primera.result.current.items[0]!.id;
    act(() => primera.result.current.quitar(id));
    primera.unmount();

    const misma = renderHook(() => useDashboardLayout(7));
    expect(misma.result.current.items.map((widget) => widget.id)).not.toContain(id);

    const otra = renderHook(() => useDashboardLayout(8));
    expect(otra.result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('restablece el layout por defecto', () => {
    const { result } = renderHook(() => useDashboardLayout(1));
    act(() => result.current.quitar(result.current.items[0]!.id));
    act(() => result.current.resetear());
    expect(result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });

  it('migra el formato anterior con span y sin posiciones', () => {
    localStorage.setItem(
      'mangos.dashboard.3',
      JSON.stringify([
        { tipo: 'total', span: 4 },
        { tipo: 'categorias', span: 8 },
      ]),
    );

    const { result } = renderHook(() => useDashboardLayout(3));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toMatchObject({
      tipo: 'total',
      x: 0,
      y: 0,
      w: 4,
      h: 5,
    });
    expect(result.current.items[1]).toMatchObject({
      tipo: 'categorias',
      x: 4,
      y: 0,
      w: 8,
      h: 5,
    });
    expect(result.current.items[0]!.id).toBeTruthy();
  });

  it('regenera ids repetidos', () => {
    localStorage.setItem(
      'mangos.dashboard.5',
      JSON.stringify([
        { id: 'repetido', tipo: 'total', x: 0, y: 0, w: 4, h: 5 },
        { id: 'repetido', tipo: 'categorias', x: 4, y: 0, w: 8, h: 5 },
      ]),
    );

    const { result } = renderHook(() => useDashboardLayout(5));
    const [uno, dos] = result.current.items;

    expect(uno!.id).toBe('repetido');
    expect(dos!.id).not.toBe('repetido');
  });

  it('ignora layouts corruptos o inválidos', () => {
    localStorage.setItem('mangos.dashboard.1', '{no-json');
    const corrupto = renderHook(() => useDashboardLayout(1));
    expect(corrupto.result.current.items).toEqual(LAYOUT_POR_DEFECTO);

    localStorage.setItem(
      'mangos.dashboard.2',
      JSON.stringify([{ tipo: 'total', span: 13 }]),
    );
    const anchoInvalido = renderHook(() => useDashboardLayout(2));
    expect(anchoInvalido.result.current.items).toEqual(LAYOUT_POR_DEFECTO);

    localStorage.setItem(
      'mangos.dashboard.4',
      JSON.stringify([{ tipo: 'otro', span: 4 }]),
    );
    const tipoInvalido = renderHook(() => useDashboardLayout(4));
    expect(tipoInvalido.result.current.items).toEqual(LAYOUT_POR_DEFECTO);

    localStorage.setItem(
      'mangos.dashboard.6',
      JSON.stringify([{ tipo: 'total', span: 4, h: 99 }]),
    );
    const altoInvalido = renderHook(() => useDashboardLayout(6));
    expect(altoInvalido.result.current.items).toEqual(LAYOUT_POR_DEFECTO);
  });
});
