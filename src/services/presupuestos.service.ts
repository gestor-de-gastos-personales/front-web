import { pedir } from './http.js';
import type { Categoria } from './gastos.service.js';

export interface Presupuesto {
  id: number;
  categoriaId: number;
  monto: string | number;
  mes: number;
  anio: number;
  categoria?: Categoria | null;
}

export interface PresupuestoEntrada {
  categoriaId: number;
  monto: number;
  mes: number;
  anio: number;
}

export const presupuestosService = {
  listar: (mes: number, anio: number) =>
    pedir<{ data: Presupuesto[]; total: number }>('/presupuestos/mios', {
      params: { mes, anio },
    }),

  guardar: (datos: PresupuestoEntrada) =>
    pedir<Presupuesto>('/presupuestos/mios', { method: 'POST', body: datos }),
};
