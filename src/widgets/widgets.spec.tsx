import { fireEvent, render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { describe, expect, it, vi } from 'vitest';
import { WidgetSlot } from './WidgetSlot.js';
import { WidgetAcciones } from './WidgetAcciones.js';
import { WidgetResize } from './WidgetResize.js';
import { AddWidgetModal } from '../components/AddWidgetModal.js';
import type { WidgetLayoutItem } from './tipos.js';

const ITEM: WidgetLayoutItem = { id: 'total-1', tipo: 'total', span: 4 };

const CATALOGO = [
  {
    tipo: 'total' as const,
    titulo: 'Total del período',
    descripcion: 'Total del período.',
    spanPorDefecto: 4 as const,
  },
  {
    tipo: 'evolucion' as const,
    titulo: 'Evolución del gasto',
    descripcion: 'Serie temporal.',
    spanPorDefecto: 8 as const,
  },
];

describe('tablero de widgets', () => {
  it('WidgetSlot aplica el ancho e incluye el handle de resize', () => {
    render(
      <DndContext>
        <SortableContext items={[ITEM.id]}>
          <WidgetSlot item={ITEM} indice={0} onRedimensionar={vi.fn()}>
            <p>contenido</p>
          </WidgetSlot>
        </SortableContext>
      </DndContext>,
    );

    const slot = screen.getByText('contenido').closest('.widget-slot');
    const inner = screen.getByText('contenido').closest('.widget-slot__inner');

    expect(slot).toHaveStyle({ gridColumn: 'span 4' });
    expect(inner).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Redimensionar widget/ }),
    ).toBeInTheDocument();
  });

  it('WidgetResize cambia el tamaño con el teclado', () => {
    const onCambiar = vi.fn();
    const { rerender } = render(<WidgetResize span={4} onCambiar={onCambiar} />);

    fireEvent.keyDown(screen.getByRole('button', { name: /Redimensionar widget/ }), {
      key: 'ArrowRight',
    });
    expect(onCambiar).toHaveBeenLastCalledWith(5);

    rerender(<WidgetResize span={5} onCambiar={onCambiar} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /Redimensionar widget/ }), {
      key: 'ArrowLeft',
    });
    expect(onCambiar).toHaveBeenLastCalledWith(4);
    expect(onCambiar).toHaveBeenCalledTimes(2);
  });

  it('WidgetAcciones llama a los handlers y deshabilita los extremos', () => {
    const onIzquierda = vi.fn();
    const onDerecha = vi.fn();
    const onQuitar = vi.fn();

    render(
      <WidgetAcciones
        indice={0}
        total={2}
        onIzquierda={onIzquierda}
        onDerecha={onDerecha}
        onQuitar={onQuitar}
      />,
    );

    expect(screen.getByRole('button', { name: 'Mover a la izquierda' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Mover a la derecha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar widget' }));

    expect(onDerecha).toHaveBeenCalled();
    expect(onQuitar).toHaveBeenCalled();
    expect(onIzquierda).not.toHaveBeenCalled();
  });

  it('AddWidgetModal permite agregar varias veces el mismo tipo', () => {
    const onAgregar = vi.fn();
    const onCerrar = vi.fn();

    render(
      <AddWidgetModal catalogo={CATALOGO} onAgregar={onAgregar} onCerrar={onCerrar} />,
    );

    expect(screen.getByText('Total del período')).toBeInTheDocument();
    const agregar = screen.getAllByRole('button', { name: 'Agregar' })[0]!;

    fireEvent.click(agregar);
    fireEvent.click(agregar);

    expect(onAgregar).toHaveBeenCalledTimes(2);
    expect(onAgregar).toHaveBeenNthCalledWith(1, 'total');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onCerrar).toHaveBeenCalled();
  });
});
