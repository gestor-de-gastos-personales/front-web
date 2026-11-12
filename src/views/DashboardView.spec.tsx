import type { ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const datos = vi.hoisted(() => ({
  useResumen: vi.fn(),
  useSerie: vi.fn(),
  useGastos: vi.fn(),
  usePresupuestos: vi.fn(),
  useCategorias: vi.fn(),
}));
vi.mock('../hooks/datos.js', () => datos);

vi.mock('../widgets/WidgetGrid.js', () => ({
  WidgetGrid: ({
    items,
    editable,
    renderWidget,
  }: {
    items: Array<{ id: string }>;
    editable: boolean;
    renderWidget: (item: { id: string }) => ReactNode;
  }) => (
    <div data-testid="widget-grid" data-editable={String(editable)}>
      {items.map((item) => (
        <div key={item.id} data-widget-id={item.id}>
          {renderWidget(item)}
        </div>
      ))}
    </div>
  ),
}));

import { DashboardView } from './DashboardView.js';
import { usePeriodo } from '../state/periodo.store.js';
import { mesActual, mesAnterior } from '../utils/periodo.js';

const GASTO = {
  id: 1,
  descripcion: 'Coto',
  monto: '1500',
  fecha: '2026-11-01T00:00:00Z',
  categoriaId: 1,
  categoria: { id: 1, nombre: 'Alimentación' },
};

const RESUMEN = {
  periodo: {
    mes: 11,
    anio: 2026,
    rango: null,
    fechaInicio: '2026-11-01T00:00:00Z',
    fechaFin: '2026-11-30T23:59:59Z',
  },
  totalGeneral: 1500,
  porCategoria: [
    { categoriaId: 1, categoriaNombre: 'Alimentación', total: 1500, porcentaje: 100 },
  ],
  mayorGasto: {
    id: 1,
    monto: 1500,
    descripcion: 'Coto',
    fecha: '2026-11-01T00:00:00Z',
    categoria: { id: 1, nombre: 'Alimentación' },
  },
  cantidad: 1,
};

function ok<T>(data: T) {
  return { data, cargando: false, error: null, recargar: vi.fn() };
}

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    usePeriodo.setState({ periodo: mesActual(new Date(2026, 10, 11)) });
  });

  it('muestra todos los widgets con datos', () => {
    datos.useResumen.mockReturnValue(ok(RESUMEN));
    datos.useSerie.mockReturnValue(
      ok({
        desde: '2026-11-01',
        hasta: '2026-11-30',
        agrupacion: 'dia',
        puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 1500 }],
        totalGeneral: 1500,
      }),
    );
    datos.useGastos.mockReturnValue(
      ok({ data: [GASTO], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } }),
    );
    datos.usePresupuestos.mockReturnValue(ok({ data: [], total: 0 }));

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Total del período')).toBeInTheDocument();
    expect(screen.getAllByText(/1\.500/).length).toBeGreaterThan(0);
    expect(screen.getByText('Gasto por categoría')).toBeInTheDocument();
    expect(screen.getByText('Evolución del gasto')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Presupuestos')).toBeInTheDocument();
  });

  it('permite elegir el período de total, categorías y evolución', () => {
    datos.useResumen.mockReturnValue(ok(RESUMEN));
    datos.useSerie.mockReturnValue(
      ok({
        desde: '2026-11-01',
        hasta: '2026-11-30',
        agrupacion: 'dia',
        puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 1500 }],
        totalGeneral: 1500,
      }),
    );
    datos.useGastos.mockReturnValue(
      ok({ data: [GASTO], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } }),
    );
    datos.usePresupuestos.mockReturnValue(ok({ data: [], total: 0 }));

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    const selectores = screen.getAllByRole('combobox', {
      name: 'Período del widget',
    });
    expect(selectores).toHaveLength(3);

    const esperado = mesAnterior();
    fireEvent.change(selectores[0]!, {
      target: { value: 'mes-anterior' },
    });

    expect(selectores[0]).toHaveValue('mes-anterior');
    expect(
      datos.useResumen.mock.calls.some(
        ([periodo]) =>
          periodo.desde === esperado.desde &&
          periodo.hasta === esperado.hasta,
      ),
    ).toBe(true);
  });

  it('solo permite editar los widgets en modo edición', () => {
    datos.useResumen.mockReturnValue(ok(RESUMEN));
    datos.useSerie.mockReturnValue(
      ok({
        desde: '2026-11-01',
        hasta: '2026-11-30',
        agrupacion: 'dia',
        puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 1500 }],
        totalGeneral: 1500,
      }),
    );
    datos.useGastos.mockReturnValue(
      ok({ data: [GASTO], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } }),
    );
    datos.usePresupuestos.mockReturnValue(ok({ data: [], total: 0 }));

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: 'Quitar widget' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Arrastrar widget'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('widget-grid')).toHaveAttribute(
      'data-editable',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getAllByRole('button', { name: 'Quitar widget' })).toHaveLength(5);
    expect(screen.getAllByLabelText('Arrastrar widget')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Agregar widget' })).toBeInTheDocument();
    expect(screen.getByTestId('widget-grid')).toHaveAttribute(
      'data-editable',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Listo' }));

    expect(
      screen.queryByRole('button', { name: 'Quitar widget' }),
    ).not.toBeInTheDocument();
  });

  it('permite quitar un widget y volver a agregarlo', async () => {
    datos.useResumen.mockReturnValue(ok(RESUMEN));
    datos.useSerie.mockReturnValue(
      ok({
        desde: '2026-11-01',
        hasta: '2026-11-30',
        agrupacion: 'dia',
        puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 1500 }],
        totalGeneral: 1500,
      }),
    );
    datos.useGastos.mockReturnValue(
      ok({ data: [GASTO], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } }),
    );
    datos.usePresupuestos.mockReturnValue(ok({ data: [], total: 0 }));

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar widget' })[0]!);
    expect(screen.queryByText('Total del período')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar widget' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.click(within(dialogo).getAllByRole('button', { name: 'Agregar' })[0]!);
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Cerrar' }));

    expect(await screen.findByText('Total del período')).toBeInTheDocument();
  });

  it('pide confirmación antes de restablecer el tablero', () => {
    datos.useResumen.mockReturnValue(ok(RESUMEN));
    datos.useSerie.mockReturnValue(
      ok({
        desde: '2026-11-01',
        hasta: '2026-11-30',
        agrupacion: 'dia',
        puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 1500 }],
        totalGeneral: 1500,
      }),
    );
    datos.useGastos.mockReturnValue(
      ok({ data: [GASTO], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } }),
    );
    datos.usePresupuestos.mockReturnValue(ok({ data: [], total: 0 }));

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar widget' })[0]!);
    expect(screen.queryByText('Total del período')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    const dialogo = screen.getByRole('dialog', { name: 'Restablecer tablero' });
    expect(within(dialogo).getByText(/¿Seguro que querés volver/)).toBeInTheDocument();
    expect(
      within(dialogo).queryByRole('button', { name: 'Cerrar' }),
    ).not.toBeInTheDocument();

    fireEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(
      screen.queryByRole('dialog', { name: 'Restablecer tablero' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Total del período')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    const confirmacion = screen.getByRole('dialog', { name: 'Restablecer tablero' });
    fireEvent.click(
      within(confirmacion).getByRole('button', { name: 'Restablecer' }),
    );

    expect(
      screen.queryByRole('dialog', { name: 'Restablecer tablero' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Total del período')).toBeInTheDocument();
  });

  it('muestra estados de carga', () => {
    const cargando = { data: null, cargando: true, error: null, recargar: vi.fn() };
    datos.useResumen.mockReturnValue(cargando);
    datos.useSerie.mockReturnValue(cargando);
    datos.useGastos.mockReturnValue(cargando);
    datos.usePresupuestos.mockReturnValue(cargando);

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(5);
  });

  it('muestra errores con reintento', () => {
    const error = { data: null, cargando: false, error: 'boom', recargar: vi.fn() };
    datos.useResumen.mockReturnValue(error);
    datos.useSerie.mockReturnValue(error);
    datos.useGastos.mockReturnValue(error);
    datos.usePresupuestos.mockReturnValue(error);

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(4);
  });
});
