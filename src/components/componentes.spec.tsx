import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Widget } from './Widget.js';
import { EmptyState } from './EmptyState.js';
import { ErrorState } from './ErrorState.js';
import { Loading } from './Loading.js';
import { Modal } from './Modal.js';
import { TotalWidget } from './TotalWidget.js';
import { CategoryBars } from './CategoryBars.js';
import { BudgetWidget } from './BudgetWidget.js';
import type { Resumen } from '../services/resumen.service.js';

const RESUMEN: Resumen = {
  periodo: {
    mes: 11,
    anio: 2026,
    rango: null,
    fechaInicio: '2026-11-01T00:00:00Z',
    fechaFin: '2026-11-30T23:59:59Z',
  },
  totalGeneral: 2500,
  porCategoria: [
    { categoriaId: 1, categoriaNombre: 'Alimentación', total: 2000, porcentaje: 80 },
    { categoriaId: 2, categoriaNombre: 'Transporte', total: 500, porcentaje: 20 },
  ],
  mayorGasto: {
    id: 1,
    monto: 2000,
    descripcion: 'Coto',
    fecha: '2026-11-02T00:00:00Z',
    categoria: { id: 1, nombre: 'Alimentación' },
  },
  cantidad: 3,
};

describe('componentes base', () => {
  it('Widget muestra título, tag y contenido', () => {
    render(
      <Widget titulo="Total" tag="3 gastos">
        <p>contenido</p>
      </Widget>,
    );
    expect(screen.getByRole('heading', { name: 'Total' })).toBeInTheDocument();
    expect(screen.getByText('3 gastos')).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('EmptyState muestra detalle y acción', () => {
    render(<EmptyState titulo="Sin datos" detalle="Probá otro rango" accion={<button>Crear</button>} />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByText('Probá otro rango')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });

  it('ErrorState reintenta', () => {
    const reintentar = vi.fn();
    render(<ErrorState mensaje="boom" onReintentar={reintentar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reintentar).toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
  });

  it('Loading muestra estado', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando');
  });

  it('Modal cierra desde el botón y el fondo', () => {
    const cerrar = vi.fn();
    render(
      <Modal titulo="Editar" onCerrar={cerrar}>
        <p>form</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(cerrar).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(cerrar).toHaveBeenCalledTimes(2);
  });

  it('Modal puede ocultar el botón Cerrar', () => {
    render(
      <Modal titulo="Confirmar" onCerrar={vi.fn()} mostrarCerrar={false}>
        <p>mensaje</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Confirmar' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cerrar' }),
    ).not.toBeInTheDocument();
  });

  it('TotalWidget muestra total, cantidad y mayor gasto', () => {
    render(<TotalWidget resumen={RESUMEN} />);
    expect(screen.getByText(/2\.500/)).toBeInTheDocument();
    expect(screen.getByText('3 gastos')).toBeInTheDocument();
    expect(screen.getByText(/Mayor: Coto/)).toBeInTheDocument();
  });

  it('TotalWidget sin mayor gasto avisa que no hay gastos', () => {
    render(<TotalWidget resumen={{ ...RESUMEN, mayorGasto: null, totalGeneral: 0 }} />);
    expect(screen.getByText(/Sin gastos en el período/)).toBeInTheDocument();
  });

  it('CategoryBars dibuja una barra por categoría con colores distintos', () => {
    const { container } = render(<CategoryBars grupos={RESUMEN.porCategoria} />);
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Alimentación/ })).toBeInTheDocument();

    const barras = container.querySelectorAll<HTMLElement>('.barra__relleno');
    expect(barras).toHaveLength(2);
    expect(barras[0]!.style.background).not.toBe(barras[1]!.style.background);
  });

  it('CategoryBars sin datos muestra vacío', () => {
    render(<CategoryBars grupos={[]} />);
    expect(screen.getByText(/Todavía no hay gastos/)).toBeInTheDocument();
  });

  it('BudgetWidget sin presupuestos ofrece crearlos', () => {
    render(
      <MemoryRouter>
        <BudgetWidget presupuestos={[]} resumen={RESUMEN} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Crear presupuesto' })).toBeInTheDocument();
  });

  it('BudgetWidget compara tope contra gasto real', () => {
    render(
      <BudgetWidget
        presupuestos={[
          { id: 1, categoriaId: 1, monto: '1000', mes: 11, anio: 2026, categoria: { id: 1, nombre: 'Alimentación' } },
        ]}
        resumen={RESUMEN}
      />,
    );
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
    expect(screen.getByText(/2\.000.*1\.000/)).toBeInTheDocument();
  });
});
