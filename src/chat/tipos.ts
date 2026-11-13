import type { Periodo } from '../utils/periodo.js';
import type { Categoria, Gasto, PaginaGastos } from '../services/gastos.service.js';
import type { Resumen } from '../services/resumen.service.js';
import type { PuntoSerie } from '../services/serie.service.js';
import type { Agrupacion } from '../utils/periodo.js';

export type Frecuencia = 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';

export type RangoIA =
  | 'WEEK'
  | '15_DAYS'
  | 'MONTH'
  | '2_MONTHS'
  | 'YEAR'
  | null;

/** Contrato que devuelve servicio-ia a través del proxy de api-gastos. */
export interface AnalisisIA {
  intent: string;
  monto: number | null;
  comercio: string | null;
  categoria: string | null;
  descripcion: string | null;
  fecha: string | null;
  rango: RangoIA;
  recurringHint: string | null;
  searchHint: string | null;
  campos?: Record<string, unknown> | null;
  target?: string | null;
  campo?: string | null;
  valor?: number | string | null;
  query?: string | null;
  frecuencia?: string | null;
  dia?: number | null;
}

export interface DatosGasto {
  descripcion: string;
  valor: number;
  fecha: string;
  categoria: number;
}

export interface OpcionesBorrador {
  recurrente: boolean;
  frecuencia: Frecuencia;
}

export type MensajeChat =
  | { id: string; rol: 'usuario'; tipo: 'texto'; texto: string }
  | { id: string; rol: 'usuario'; tipo: 'imagen'; nombre: string }
  | { id: string; rol: 'asistente'; tipo: 'texto'; texto: string }
  | {
      id: string;
      rol: 'asistente';
      tipo: 'borrador';
      analisis: AnalisisIA;
      modo: 'crear' | 'editar';
      gasto?: Gasto;
      categoriaId?: number;
    }
  | {
      id: string;
      rol: 'asistente';
      tipo: 'resumen';
      periodo: Periodo;
      resumen: Resumen;
    }
  | {
      id: string;
      rol: 'asistente';
      tipo: 'grafico';
      periodo: Periodo;
      puntos: PuntoSerie[];
      agrupacion: Agrupacion;
    }
  | {
      id: string;
      rol: 'asistente';
      tipo: 'historial';
      periodo: Periodo;
      pagina: PaginaGastos;
    }
  | {
      id: string;
      rol: 'asistente';
      tipo: 'candidatos';
      accion: 'eliminar' | 'editar';
      gastos: Gasto[];
    }
  | {
      id: string;
      rol: 'asistente';
      tipo: 'categoria';
      nombre: string;
    }
  | { id: string; rol: 'asistente'; tipo: 'error'; texto: string };

export interface EstadoChat {
  mensajes: MensajeChat[];
  cargando: boolean;
}

export type CategoriaChat = Categoria;
