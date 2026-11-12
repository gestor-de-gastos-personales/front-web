import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseForm } from './ExpenseForm.js';

const CATEGORIAS = [
  { id: 1, nombre: 'Alimentación' },
  { id: 2, nombre: 'Transporte' },
];

describe('ExpenseForm', () => {
  it('envía un gasto válido', () => {
    const onGuardar = vi.fn();
    render(
      <ExpenseForm
        categorias={CATEGORIAS}
        onGuardar={onGuardar}
        onCancelar={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Coto' },
    });
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '1500' } });
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }));

    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({
        descripcion: 'Coto',
        valor: 1500,
        categoria: 2,
      }),
    );
  });

  it('valida monto y descripción', () => {
    const onGuardar = vi.fn();
    render(
      <ExpenseForm categorias={CATEGORIAS} onGuardar={onGuardar} onCancelar={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Coto' },
    });
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/monto/);
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('precarga los datos de edición', () => {
    render(
      <ExpenseForm
        categorias={CATEGORIAS}
        inicial={{
          id: 5,
          descripcion: 'Nafta',
          monto: '2300',
          fecha: '2026-11-02T00:00:00Z',
          categoriaId: 2,
        }}
        onGuardar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Descripción')).toHaveValue('Nafta');
    expect(screen.getByLabelText('Monto')).toHaveValue(2300);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  it('cancela y muestra errores externos', () => {
    const onCancelar = vi.fn();
    render(
      <ExpenseForm
        categorias={CATEGORIAS}
        error="No se pudo guardar"
        onGuardar={vi.fn()}
        onCancelar={onCancelar}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
