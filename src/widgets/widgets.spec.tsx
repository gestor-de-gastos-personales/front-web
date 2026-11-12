import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetAcciones } from './WidgetAcciones.js';
import { AddWidgetModal } from '../components/AddWidgetModal.js';

const CATALOGO = [
  {
    tipo: 'total' as const,
    titulo: 'Total del período',
    descripcion: 'Total del período.',
    wPorDefecto: 4,
    hPorDefecto: 5,
    minW: 4,
    minH: 4,
  },
  {
    tipo: 'evolucion' as const,
    titulo: 'Evolución del gasto',
    descripcion: 'Serie temporal.',
    wPorDefecto: 8,
    hPorDefecto: 7,
    minW: 6,
    minH: 6,
  },
];

describe('tablero de widgets', () => {
  it('WidgetAcciones llama a los handlers y deshabilita los extremos', () => {
    const onIzquierda = vi.fn();
    const onDerecha = vi.fn();
    const onQuitar = vi.fn();

    render(
      <WidgetAcciones
        puedeIzquierda={false}
        puedeDerecha
        onIzquierda={onIzquierda}
        onDerecha={onDerecha}
        onQuitar={onQuitar}
      />,
    );

    expect(screen.getByRole('button', { name: 'Mover a la izquierda' })).toBeDisabled();
    expect(screen.getByLabelText('Arrastrar widget')).toHaveAttribute(
      'title',
      'Arrastrá desde el encabezado para mover',
    );

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
