import { pedir } from './http.js';

export interface Categoria {
  id: number;
  nombre: string;
  default?: boolean;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: string | number;
  fecha: string;
  categoriaId: number;
  categoria?: Categoria | null;
}

export interface MetaPagina {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginaGastos {
  data: Gasto[];
  meta: MetaPagina;
}

export interface FiltrosGastos {
  page?: number;
  limit?: number;
  fechaInicio?: string;
  fechaFin?: string;
  categoriaId?: number;
  montoMin?: number;
  montoMax?: number;
}

export interface GastoEntrada {
  descripcion: string;
  valor: number;
  fecha: string;
  categoria: number;
}

export const gastosService = {
  listar: (filtros: FiltrosGastos = {}) =>
    pedir<PaginaGastos>('/gastos', {
      params: {
        page: filtros.page,
        limit: filtros.limit,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        categoriaId: filtros.categoriaId,
        montoMin: filtros.montoMin,
        montoMax: filtros.montoMax,
      },
    }),

  crear: (datos: GastoEntrada) =>
    pedir<Gasto>('/gastos', { method: 'POST', body: datos }),

  actualizar: (id: number, datos: Partial<GastoEntrada>) =>
    pedir<Gasto>(`/gastos/${id}`, { method: 'PATCH', body: datos }),

  eliminar: (id: number) =>
    pedir<void>(`/gastos/${id}`, { method: 'DELETE' }),
};
