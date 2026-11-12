import { createRef } from 'react';
import type { ForwardedRef, ReactNode, Ref } from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WidgetLayoutItem } from './tipos.js';

const gridStub = vi.hoisted(() => ({
  getColumn: vi.fn(() => 12),
  save: vi.fn((): Array<Record<string, unknown>> => []),
  engine: { nodes: [] as Array<{ el?: HTMLElement }> },
  refreshDragHandles: vi.fn(),
  el: null as unknown as HTMLElement,
}));

const capturado = vi.hoisted(() => ({
  props: null as null | Record<string, unknown>,
}));

vi.mock('gridstack/dist/react', async () => {
  const React = await import('react');

  return {
    GridStack: React.forwardRef(
      (props: Record<string, unknown>, ref: ForwardedRef<unknown>) => {
        capturado.props = props;
        React.useImperativeHandle(ref, () => ({ getGrid: () => gridStub }), []);
        return React.createElement(
          'div',
          {
            className: props.className as string,
            'data-testid': 'gridstack',
          },
          props.children as ReactNode,
        );
      },
    ),
    GridStackItem: ({
      id,
      options,
      children,
    }: {
      id: string;
      options: Record<string, unknown>;
      children: ReactNode;
    }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'gridstack-item',
          'data-id': id,
          'data-options': JSON.stringify(options),
        },
        children,
      ),
  };
});

import { WidgetGrid } from './WidgetGrid.js';
import type { WidgetGridHandle } from './WidgetGrid.js';

const ITEMS: WidgetLayoutItem[] = [
  { id: 'a', tipo: 'total', x: 0, y: 0, w: 4, h: 5 },
  { id: 'b', tipo: 'categorias', x: 4, y: 0, w: 8, h: 5 },
];

function renderGrid(
  opciones: {
    editable?: boolean;
    onCambio?: (nodos: unknown[]) => void;
    ref?: Ref<WidgetGridHandle>;
  } = {},
) {
  return render(
    <WidgetGrid
      ref={opciones.ref}
      items={ITEMS}
      editable={opciones.editable ?? false}
      onCambio={opciones.onCambio ?? vi.fn()}
      renderWidget={(item) => <p>{item.id}</p>}
    />,
  );
}

describe('WidgetGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gridStub.getColumn.mockReturnValue(12);
    gridStub.save.mockReturnValue([]);
    gridStub.engine.nodes = [];
    gridStub.el = document.createElement('div');
    capturado.props = null;
  });

  it('renderiza un item de GridStack por widget con su geometría', () => {
    renderGrid();

    const items = screen.getAllByTestId('gridstack-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('data-id', 'a');
    expect(JSON.parse(items[0]!.getAttribute('data-options')!)).toMatchObject({
      x: 0,
      y: 0,
      w: 4,
      h: 5,
      minW: 3,
      minH: 3,
    });
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('activa y desactiva el modo estático según edición', () => {
    const { rerender } = renderGrid();

    expect(capturado.props?.options).toMatchObject({
      staticGrid: true,
      disableDrag: true,
      disableResize: true,
      animate: true,
      column: 12,
    });
    expect(screen.getByTestId('gridstack')).toHaveClass('widget-grid');
    expect(screen.getByTestId('gridstack')).not.toHaveClass(
      'widget-grid--editable',
    );

    rerender(
      <WidgetGrid
        items={ITEMS}
        editable
        onCambio={vi.fn()}
        renderWidget={(item) => <p>{item.id}</p>}
      />,
    );

    expect(capturado.props?.options).toMatchObject({
      staticGrid: false,
      disableDrag: false,
      disableResize: false,
    });
    expect(screen.getByTestId('gridstack')).toHaveClass(
      'widget-grid--editable',
    );
  });

  it('sincroniza la geometría al agregar, cambiar o quitar items', () => {
    const onCambio = vi.fn();
    gridStub.save.mockReturnValue([
      { id: 'a', x: 0, y: 0, w: 4, h: 5 },
      { id: 'b', x: 4, y: 0, w: 8, h: 5 },
    ]);

    renderGrid({ onCambio });

    const props = capturado.props!;
    act(() => {
      (props.onChange as () => void)();
      (props.onAdded as () => void)();
      (props.onRemoved as () => void)();
    });

    expect(onCambio).toHaveBeenCalledTimes(3);
    expect(onCambio).toHaveBeenCalledWith([
      { id: 'a', x: 0, y: 0, w: 4, h: 5 },
      { id: 'b', x: 4, y: 0, w: 8, h: 5 },
    ]);
  });

  it('descarta nodos incompletos y no persiste en mobile', () => {
    const onCambio = vi.fn();
    gridStub.save.mockReturnValue([
      { id: 'a', x: 0, y: 0, w: 4, h: 5 },
      { id: '', x: 0, y: 0, w: 4, h: 5 },
      { id: 'b', x: '0', y: 0, w: 8, h: 5 },
    ]);

    renderGrid({ onCambio });
    act(() => (capturado.props!.onChange as () => void)());

    expect(onCambio).toHaveBeenCalledWith([
      { id: 'a', x: 0, y: 0, w: 4, h: 5 },
    ]);

    onCambio.mockClear();
    gridStub.getColumn.mockReturnValue(1);
    act(() => (capturado.props!.onChange as () => void)());

    expect(onCambio).not.toHaveBeenCalled();
  });

  it('re-escanea los handles de arrastre al entrar en edición', () => {
    const el = document.createElement('div');
    gridStub.engine.nodes = [{ el }];

    renderGrid({ editable: true });

    expect(gridStub.refreshDragHandles).toHaveBeenCalledWith(el);
  });

  it('expone la grilla por ref y limpia items huérfanos', async () => {
    const ref = createRef<WidgetGridHandle>();
    const huerfano = document.createElement('div');
    huerfano.className = 'grid-stack-item';
    huerfano.setAttribute('gs-id', 'viejo');
    gridStub.el.appendChild(huerfano);

    renderGrid({ ref });

    expect(ref.current?.getGrid()).toBe(gridStub);

    await act(async () => {
      await Promise.resolve();
    });

    expect(huerfano.parentElement).toBeNull();
  });
});
