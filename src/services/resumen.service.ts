import { pedir } from './http.js';

export interface GrupoResumen {
  categoriaId: number;
  categoriaNombre: string;
  total: number;
  porcentaje: number;
}

export interface Resumen {
  periodo: {
    mes: number | null;
    anio: number;
    rango: string | null;
    fechaInicio: string;
    fechaFin: string;
  };
  totalGeneral: number;
  porCategoria: GrupoResumen[];
  mayorGasto: {
    id: number;
    monto: number;
    descripcion: string;
    fecha: string;
    categoria: { id: number; nombre: string } | null;
  } | null;
  cantidad: number;
}

export const resumenService = {
  obtener: (desde: string, hasta: string, categoria?: string) =>
    pedir<Resumen>('/gastos/resumen', {
      params: { desde, hasta, categoria },
    }),
};
