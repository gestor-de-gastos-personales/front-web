import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetGrid } from './WidgetGrid.js';
import type { WidgetLayoutItem } from './tipos.js';

const ITEMS: WidgetLayoutItem[] = [
  { id: 'total-1', tipo: 'total', x: 0, y: 0, w: 4, h: 5 },
  { id: 'categorias-1', tipo: 'categorias', x: 4, y: 0, w: 8, h: 5 },
];

function renderGrid(items: WidgetLayoutItem[], editable: boolean) {
  return render(
    <WidgetGrid
      items={items}
      editable={editable}
      onCambio={vi.fn()}
      renderWidget={(item) => <p>contenido {item.id}</p>}
    />,
  );
}

describe('WidgetGrid con GridStack real', () => {
  it('inicializa la grilla y monta el contenido de cada widget', async () => {
    renderGrid(ITEMS, true);

    await screen.findByText('contenido total-1');

    expect(document.querySelectorAll('.grid-stack-item')).toHaveLength(2);
    expect(document.querySelectorAll('.ui-resizable-se').length).toBeGreaterThan(0);
  });

  it('en modo lectura no crea handles de arrastre ni resize', async () => {
    renderGrid(ITEMS, false);

    await screen.findByText('contenido total-1');

    expect(document.querySelectorAll('.ui-resizable-se')).toHaveLength(0);
    expect(
      document.querySelectorAll('.grid-stack-item.ui-draggable-disabled'),
    ).toHaveLength(2);
  });

  it('pasa a una columna en mobile', async () => {
    const anchoOriginal = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });

    try {
      renderGrid(ITEMS, true);
      await screen.findByText('contenido total-1');

      const grilla = document.querySelector('.grid-stack')!;
      expect(grilla.classList.contains('gs-1')).toBe(true);

      const items = document.querySelectorAll<HTMLElement & {
        gridstackNode?: { w: number };
      }>('.grid-stack-item');
      items.forEach((item) => {
        expect(item.gridstackNode?.w).toBe(1);
      });
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: anchoOriginal,
      });
    }
  });

  it('agrega y quita items sin dejar elementos huérfanos', async () => {
    const tercero: WidgetLayoutItem = {
      id: 'evolucion-1',
      tipo: 'evolucion',
      x: 0,
      y: 5,
      w: 8,
      h: 6,
    };

    const { rerender } = renderGrid(ITEMS, true);
    await screen.findByText('contenido total-1');

    rerender(
      <WidgetGrid
        items={[...ITEMS, tercero]}
        editable
        onCambio={vi.fn()}
        renderWidget={(item) => <p>contenido {item.id}</p>}
      />,
    );

    await screen.findByText('contenido evolucion-1');
    expect(document.querySelectorAll('.grid-stack-item')).toHaveLength(3);

    rerender(
      <WidgetGrid
        items={[ITEMS[1]!]}
        editable
        onCambio={vi.fn()}
        renderWidget={(item) => <p>contenido {item.id}</p>}
      />,
    );

    await waitFor(() => {
      expect(document.querySelectorAll('.grid-stack-item')).toHaveLength(1);
    });
    expect(screen.queryByText('contenido total-1')).not.toBeInTheDocument();
    expect(screen.queryByText('contenido evolucion-1')).not.toBeInTheDocument();
  });
});
