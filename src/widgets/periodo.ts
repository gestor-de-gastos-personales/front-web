import {
  anioActual,
  mesActual,
  mesAnterior,
  ultimosMeses,
} from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';
import type { ModoPeriodoWidget } from './tipos.js';

/**
 * Resuelve el período efectivo de un widget. `global` (o sin valor) sigue el
 * selector de la cabecera; el resto son rangos independientes.
 */
export function resolverPeriodo(
  modo: ModoPeriodoWidget | undefined,
  global: Periodo,
): Periodo {
  switch (modo) {
    case 'mes':
      return mesActual();
    case 'mes-anterior':
      return mesAnterior();
    case '3-meses':
      return ultimosMeses(3);
    case 'anio':
      return anioActual();
    default:
      return global;
  }
}
