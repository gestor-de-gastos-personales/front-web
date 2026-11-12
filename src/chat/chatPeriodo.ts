import {
  anioActual,
  estaSemana,
  mesActual,
  ultimosDias,
  ultimosMeses,
} from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';
import type { AnalisisIA, RangoIA } from './tipos.js';

/** Traduce el rango que devuelve la IA a un período concreto. */
export function periodoDesdeRango(
  rango: RangoIA | undefined,
  porDefecto: Periodo,
): Periodo {
  switch (rango) {
    case 'WEEK':
      return estaSemana();
    case '15_DAYS':
      return ultimosDias(15);
    case 'MONTH':
      return mesActual();
    case '2_MONTHS':
      return ultimosMeses(2);
    case 'YEAR':
      return anioActual();
    default:
      return porDefecto;
  }
}

export function fechaHoyISO(): string {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/** Busca la categoría que mencionó la IA dentro del catálogo real. */
export function categoriaSugerida(
  analisis: AnalisisIA,
  categorias: Array<{ id: number; nombre: string }>,
) {
  const buscada = analisis.categoria;
  if (!buscada) return undefined;

  const objetivo = normalizar(buscada);
  return (
    categorias.find((categoria) => normalizar(categoria.nombre) === objetivo) ??
    categorias.find((categoria) => {
      const nombre = normalizar(categoria.nombre);
      return nombre.includes(objetivo) || objetivo.includes(nombre);
    })
  );
}
