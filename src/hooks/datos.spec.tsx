import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const servicios = vi.hoisted(() => ({
  gastos: { listar: vi.fn() },
  resumen: { obtener: vi.fn() },
  serie: { obtener: vi.fn() },
  categorias: { listar: vi.fn() },
  presupuestos: { listar: vi.fn() },
}));
vi.mock('../services/gastos.service.js', () => ({ gastosService: servicios.gastos }));
vi.mock('../services/resumen.service.js', () => ({ resumenService: servicios.resumen }));
vi.mock('../services/serie.service.js', () => ({ serieService: servicios.serie }));
vi.mock('../services/categorias.service.js', () => ({ categoriasService: servicios.categorias }));
vi.mock('../services/presupuestos.service.js', () => ({ presupuestosService: servicios.presupuestos }));

import {
  useCategorias,
  useGastos,
  usePresupuestos,
  useResumen,
  useSerie,
} from './datos.js';
import type { Periodo } from '../utils/periodo.js';

const PERIODO: Periodo = {
  desde: '2026-11-01',
  hasta: '2026-11-30',
  etiqueta: 'noviembre',
  agrupacion: 'dia',
};

describe('hooks de datos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    servicios.gastos.listar.mockResolvedValue({ data: [], meta: {} });
    servicios.resumen.obtener.mockResolvedValue({ totalGeneral: 0 });
    servicios.serie.obtener.mockResolvedValue({ puntos: [] });
    servicios.categorias.listar.mockResolvedValue([]);
    servicios.presupuestos.listar.mockResolvedValue({ data: [], total: 0 });
  });

  it('useGastos llama al listado con filtros', async () => {
    const { result } = renderHook(() => useGastos({ page: 2, limit: 5 }));
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(servicios.gastos.listar).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });

  it('useResumen y useSerie usan el período', async () => {
    const resumen = renderHook(() => useResumen(PERIODO));
    const serie = renderHook(() => useSerie(PERIODO));
    await waitFor(() => expect(resumen.result.current.cargando).toBe(false));
    await waitFor(() => expect(serie.result.current.cargando).toBe(false));

    expect(servicios.resumen.obtener).toHaveBeenCalledWith('2026-11-01', '2026-11-30');
    expect(servicios.serie.obtener).toHaveBeenCalledWith('2026-11-01', '2026-11-30', 'dia');
  });

  it('useCategorias lista categorías', async () => {
    const { result } = renderHook(() => useCategorias());
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(servicios.categorias.listar).toHaveBeenCalled();
  });

  it('usePresupuestos pide mes y año del período', async () => {
    const { result } = renderHook(() => usePresupuestos(PERIODO));
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(servicios.presupuestos.listar).toHaveBeenCalledWith(11, 2026);
  });
});
