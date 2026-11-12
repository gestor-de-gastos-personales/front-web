import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetSlot } from './WidgetSlot.js';
import { WidgetAcciones } from './WidgetAcciones.js';
import { AddWidgetModal } from '../components/AddWidgetModal.js';
import type { WidgetLayoutItem } from './tipos.js';

const ITEM: WidgetLayoutItem = { tipo: 'total', span: 4 };

describe('tablero de widgets', () => {
  it('WidgetSlot aplica el ancho y dispara los eventos de arrastre', () => {
    const onDragStart = vi.fn();
    const onDragOver = vi.fn();
    const onDrop = vi.fn();
    const onDragEnd = vi.fn();

    render(
      <WidgetSlot
        item={ITEM}
        indice={0}
        arrastrando={null}
        destino={null}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        <p>contenido</p>
      </WidgetSlot>,
    );

    const slot = screen.getByText('contenido').parentElement!;
    expect(slot).toHaveStyle({ gridColumn: 'span 4' });

    fireEvent.dragStart(slot);
    expect(onDragStart).toHaveBeenCalledWith(0);

    fireEvent.dragOver(slot);
    expect(onDragOver).toHaveBeenCalledWith(0);

    fireEvent.drop(slot);
    expect(onDrop).toHaveBeenCalledWith(0);

    fireEvent.dragEnd(slot);
    expect(onDragEnd).toHaveBeenCalled();
  });

  it('WidgetAcciones llama a los handlers y deshabilita los extremos', () => {
    const onIzquierda = vi.fn();
    const onDerecha = vi.fn();
    const onRedimensionar = vi.fn();
    const onQuitar = vi.fn();

    render(
      <WidgetAcciones
        indice={0}
        total={2}
        span={4}
        onIzquierda={onIzquierda}
        onDerecha={onDerecha}
        onRedimensionar={onRedimensionar}
        onQuitar={onQuitar}
      />,
    );

    expect(screen.getByRole('button', { name: 'Mover a la izquierda' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Mover a la derecha' }));
    fireEvent.click(screen.getByRole('button', { name: /Cambiar tamaño/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar widget' }));

    expect(onDerecha).toHaveBeenCalled();
    expect(onRedimensionar).toHaveBeenCalled();
    expect(onQuitar).toHaveBeenCalled();
    expect(onIzquierda).not.toHaveBeenCalled();
  });

  it('AddWidgetModal lista disponibles y agrega', () => {
    const onAgregar = vi.fn();
    const onCerrar = vi.fn();

    render(
      <AddWidgetModal
        disponibles={[
          {
            tipo: 'total',
            titulo: 'Total del período',
            descripcion: 'Total del período.',
            spanPorDefecto: 4,
          },
        ]}
        onAgregar={onAgregar}
        onCerrar={onCerrar}
      />,
    );

    expect(screen.getByText('Total del período')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(onAgregar).toHaveBeenCalledWith('total');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('AddWidgetModal avisa cuando no quedan widgets', () => {
    render(
      <AddWidgetModal disponibles={[]} onAgregar={vi.fn()} onCerrar={vi.fn()} />,
    );
    expect(screen.getByText(/todos los widgets/)).toBeInTheDocument();
  });
});
