import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryTable } from './HistoryTable.js';
import type { PaginaGastos } from '../services/gastos.service.js';

const PAGINA: PaginaGastos = {
  data: [
    {
      id: 1,
      descripcion: 'Coto',
      monto: '1500',
      fecha: '2026-11-01T00:00:00Z',
      categoriaId: 1,
      categoria: { id: 1, nombre: 'Alimentación' },
    },
  ],
  meta: { total: 6, page: 1, limit: 5, totalPages: 2 },
};

describe('HistoryTable', () => {
  it('muestra la fila y dispara editar/eliminar', () => {
    const onEditar = vi.fn();
    const onEliminar = vi.fn();
    const onPagina = vi.fn();

    render(
      <HistoryTable pagina={PAGINA} onEditar={onEditar} onEliminar={onEliminar} onPagina={onPagina} />,
    );

    expect(screen.getByText('Coto')).toBeInTheDocument();
    expect(screen.getByText('Alimentación')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar Coto' }));
    expect(onEditar).toHaveBeenCalledWith(PAGINA.data[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Coto' }));
    expect(onEliminar).toHaveBeenCalledWith(PAGINA.data[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onPagina).toHaveBeenCalledWith(2);
  });

  it('deshabilita Anterior en la primera página', () => {
    render(
      <HistoryTable
        pagina={PAGINA}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
        onPagina={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('muestra vacío sin gastos', () => {
    render(
      <HistoryTable
        pagina={{ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } }}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
        onPagina={vi.fn()}
      />,
    );
    expect(screen.getByText(/No hay gastos en este período/)).toBeInTheDocument();
  });
});
