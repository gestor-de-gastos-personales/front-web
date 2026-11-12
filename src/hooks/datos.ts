import { gastosService } from '../services/gastos.service.js';
import type { FiltrosGastos } from '../services/gastos.service.js';
import { resumenService } from '../services/resumen.service.js';
import { serieService } from '../services/serie.service.js';
import { categoriasService } from '../services/categorias.service.js';
import { presupuestosService } from '../services/presupuestos.service.js';
import { useAsync } from './useAsync.js';
import type { Periodo } from '../utils/periodo.js';
import { mesYAnio } from '../utils/periodo.js';

export function useGastos(filtros: FiltrosGastos) {
  return useAsync(
    () => gastosService.listar(filtros),
    [
      filtros.page,
      filtros.limit,
      filtros.fechaInicio,
      filtros.fechaFin,
      filtros.categoriaId,
    ],
  );
}

export function useResumen(periodo: Periodo) {
  return useAsync(
    () => resumenService.obtener(periodo.desde, periodo.hasta),
    [periodo.desde, periodo.hasta],
  );
}

export function useSerie(periodo: Periodo) {
  return useAsync(
    () => serieService.obtener(periodo.desde, periodo.hasta, periodo.agrupacion),
    [periodo.desde, periodo.hasta, periodo.agrupacion],
  );
}

export function useCategorias() {
  return useAsync(() => categoriasService.listar(), []);
}

export function usePresupuestos(periodo: Periodo) {
  const { mes, anio } = mesYAnio(periodo);
  return useAsync(() => presupuestosService.listar(mes, anio), [mes, anio]);
}
