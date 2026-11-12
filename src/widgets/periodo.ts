import {
  anioActual,
  estaSemana,
  hoyPeriodo,
  mesActual,
  mesAnterior,
  ultimosDias,
  ultimosMeses,
} from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';
import type { ModoPeriodoWidget } from './tipos.js';

/**
 * Resuelve el período efectivo de un widget. `global` (o sin valor) usa el
 * período por defecto del dashboard; el resto son rangos independientes.
 */
export function resolverPeriodo(
  modo: ModoPeriodoWidget | undefined,
  global: Periodo,
): Periodo {
  switch (modo) {
    case 'hoy':
      return hoyPeriodo();
    case 'semana':
      return estaSemana();
    case 'mes':
      return mesActual();
    case 'mes-anterior':
      return mesAnterior();
    case '15-dias':
      return ultimosDias(15);
    case '3-meses':
      return ultimosMeses(3);
    case 'anio':
      return anioActual();
    default:
      return global;
  }
}
