import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const datos = vi.hoisted(() => ({
  useCategorias: vi.fn(),
  useGastos: vi.fn(),
  usePresupuestos: vi.fn(),
  useResumen: vi.fn(),
  useSerie: vi.fn(),
}));
vi.mock('../hooks/datos.js', () => datos);

const servicios = vi.hoisted(() => ({
  gastos: { crear: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn(), listar: vi.fn() },
  categorias: { crear: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn(), listar: vi.fn() },
  presupuestos: { guardar: vi.fn(), listar: vi.fn() },
}));
vi.mock('../services/gastos.service.js', () => ({ gastosService: servicios.gastos }));
vi.mock('../services/categorias.service.js', () => ({ categoriasService: servicios.categorias }));
vi.mock('../services/presupuestos.service.js', () => ({ presupuestosService: servicios.presupuestos }));

import { GastosView } from './GastosView.js';
import { CategoriasView } from './CategoriasView.js';
import { PresupuestosView } from './PresupuestosView.js';
import { usePeriodo } from '../state/periodo.store.js';
import { mesActual } from '../utils/periodo.js';

const CATEGORIA = { id: 1, nombre: 'Alimentación', default: true };
const GASTO = {
  id: 1,
  descripcion: 'Coto',
  monto: '1500',
  fecha: '2026-11-01T00:00:00Z',
  categoriaId: 1,
  categoria: CATEGORIA,
};

function ok<T>(data: T) {
  return { data, cargando: false, error: null, recargar: vi.fn() };
}

describe('GastosView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePeriodo.setState({ periodo: mesActual(new Date(2026, 10, 11)) });
    datos.useCategorias.mockReturnValue(ok([CATEGORIA]));
    datos.useGastos.mockReturnValue(
      ok({ data: [GASTO], meta: { total: 1, page: 1, limit: 8, totalPages: 1 } }),
    );
    servicios.gastos.crear.mockResolvedValue(GASTO);
    servicios.gastos.actualizar.mockResolvedValue(GASTO);
    servicios.gastos.eliminar.mockResolvedValue(undefined);
  });

  it('crea un gasto desde el modal', async () => {
    render(
      <MemoryRouter>
        <GastosView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo gasto' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.change(within(dialogo).getByLabelText('Descripción'), {
      target: { value: 'Verdulería' },
    });
    fireEvent.change(within(dialogo).getByLabelText('Monto'), {
      target: { value: '900' },
    });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Registrar gasto' }));

    await waitFor(() =>
      expect(servicios.gastos.crear).toHaveBeenCalledWith(
        expect.objectContaining({ descripcion: 'Verdulería', valor: 900, categoria: 1 }),
      ),
    );
  });

  it('por defecto muestra todos los gastos sin filtro de fecha', () => {
    render(
      <MemoryRouter>
        <GastosView />
      </MemoryRouter>,
    );

    expect(datos.useGastos).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 8,
        fechaInicio: undefined,
        fechaFin: undefined,
        montoMin: undefined,
        montoMax: undefined,
      }),
    );
  });

  it('filtra por período, categoría y monto', () => {
    render(
      <MemoryRouter>
        <GastosView />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2026-11-05' },
    });
    fireEvent.change(screen.getByLabelText('Hasta'), {
      target: { value: '2026-11-20' },
    });
    fireEvent.change(screen.getByLabelText('Monto mínimo'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Monto máximo'), {
      target: { value: '2000' },
    });
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: '1' },
    });

    expect(datos.useGastos.mock.calls.at(-1)?.[0]).toMatchObject({
      page: 1,
      limit: 8,
      fechaInicio: '05-11-2026',
      fechaFin: '20-11-2026',
      categoriaId: 1,
      montoMin: 100,
      montoMax: 2000,
    });
  });

  it('edita un gasto existente', async () => {
    render(
      <MemoryRouter>
        <GastosView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar Coto' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.change(within(dialogo).getByLabelText('Monto'), {
      target: { value: '2000' },
    });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(servicios.gastos.actualizar).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ valor: 2000 }),
      ),
    );
  });

  it('elimina un gasto con confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <MemoryRouter>
        <GastosView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Coto' }));

    await waitFor(() => expect(servicios.gastos.eliminar).toHaveBeenCalledWith(1));
  });
});

describe('CategoriasView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    datos.useCategorias.mockReturnValue(
      ok([CATEGORIA, { id: 2, nombre: 'Mascotas' }, { id: 3, nombre: 'Viajes' }]),
    );
    servicios.categorias.crear.mockResolvedValue({ id: 3 });
    servicios.categorias.actualizar.mockResolvedValue({ id: 1 });
    servicios.categorias.eliminar.mockResolvedValue(undefined);
  });

  it('crea, renombra y elimina categorías', async () => {
    render(
      <MemoryRouter>
        <CategoriasView />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('columnheader', { name: 'Tipo' }),
    ).not.toBeInTheDocument();
    const filaSistema = screen.getByText('Alimentación').closest('tr')!;
    expect(
      within(filaSistema).queryByRole('button', { name: 'Renombrar' }),
    ).not.toBeInTheDocument();
    expect(
      within(filaSistema).queryByRole('button', { name: 'Eliminar' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Renombrar' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Nueva categoría'), {
      target: { value: 'Viajes' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(servicios.categorias.crear).toHaveBeenCalledWith('Viajes'));

    vi.spyOn(window, 'prompt').mockReturnValue('Pets');
    fireEvent.click(screen.getAllByRole('button', { name: 'Renombrar' })[0]!);
    await waitFor(() =>
      expect(servicios.categorias.actualizar).toHaveBeenCalledWith(2, 'Pets'),
    );

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]!);
    await waitFor(() => expect(servicios.categorias.eliminar).toHaveBeenCalledWith(3));
  });
});

describe('PresupuestosView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePeriodo.setState({ periodo: mesActual(new Date(2026, 10, 11)) });
    datos.useCategorias.mockReturnValue(ok([CATEGORIA]));
    datos.usePresupuestos.mockReturnValue(
      ok({
        data: [
          {
            id: 1,
            categoriaId: 1,
            monto: '1000',
            mes: 11,
            anio: 2026,
            categoria: CATEGORIA,
          },
        ],
        total: 1,
      }),
    );
    datos.useResumen.mockReturnValue(
      ok({
        periodo: {},
        totalGeneral: 1500,
        porCategoria: [
          { categoriaId: 1, categoriaNombre: 'Alimentación', total: 1500, porcentaje: 100 },
        ],
        mayorGasto: null,
        cantidad: 1,
      }),
    );
    servicios.presupuestos.guardar.mockResolvedValue({ id: 2 });
  });

  it('guarda un tope y marca el excedido', async () => {
    render(
      <MemoryRouter>
        <PresupuestosView />
      </MemoryRouter>,
    );

    expect(screen.getByText('excedido')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Tope mensual'), { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tope' }));

    await waitFor(() =>
      expect(servicios.presupuestos.guardar).toHaveBeenCalledWith({
        categoriaId: 1,
        monto: 5000,
        mes: 11,
        anio: 2026,
      }),
    );
  });

  it('valida el monto', () => {
    render(
      <MemoryRouter>
        <PresupuestosView />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Tope mensual'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tope' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/mayor a 0/);
  });
});
