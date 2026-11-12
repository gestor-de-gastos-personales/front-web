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

import { DashboardView } from './DashboardView.js';
import { usePeriodo } from '../state/periodo.store.js';
import { mesActual } from '../utils/periodo.js';

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

    expect(screen.getByText('Total del período')).toBeInTheDocument();
    expect(screen.getAllByText(/1\.500/).length).toBeGreaterThan(0);
    expect(screen.getByText('Gasto por categoría')).toBeInTheDocument();
    expect(screen.getByText('Evolución del gasto')).toBeInTheDocument();
    expect(screen.getByText('Últimos gastos')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Presupuestos')).toBeInTheDocument();
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

    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar widget' })[0]!);
    expect(screen.queryByText('Total del período')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar widget' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Agregar' }));

    expect(await screen.findByText('Total del período')).toBeInTheDocument();
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
