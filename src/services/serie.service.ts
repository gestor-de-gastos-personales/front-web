import { pedir } from './http.js';
import type { Agrupacion } from '../utils/periodo.js';

export interface PuntoSerie {
  clave: string;
  etiqueta: string;
  total: number;
}

export interface Serie {
  desde: string;
  hasta: string;
  agrupacion: Agrupacion;
  puntos: PuntoSerie[];
  totalGeneral: number;
}

export const serieService = {
  obtener: (desde: string, hasta: string, agrupacion: Agrupacion) =>
    pedir<Serie>('/gastos/serie', { params: { desde, hasta, agrupacion } }),
};
