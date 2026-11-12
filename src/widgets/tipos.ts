export type TipoWidget =
  | 'total'
  | 'categorias'
  | 'evolucion'
  | 'presupuestos'
  | 'historial';

/** Período que puede elegir cada widget de forma independiente. */
export type ModoPeriodoWidget =
  | 'global'
  | 'hoy'
  | 'semana'
  | 'mes'
  | 'mes-anterior'
  | '15-dias'
  | '3-meses'
  | 'anio';

/** Columnas del tablero en escritorio (GridStack). */
export const COLUMNAS = 12;
export const W_MIN = 3;
export const W_MAX = COLUMNAS;
export const H_MIN = 3;
export const H_MAX = 20;

/**
 * Posición y tamaño de una instancia del tablero, con el mismo formato que
 * guarda GridStack (`x`, `y`, `w`, `h`). `x`/`y` son la celda de origen y
 * `w`/`h` el ancho y alto en celdas.
 */
export interface WidgetLayoutItem {
  id: string;
  tipo: TipoWidget;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Si se omite, el widget sigue el período global del dashboard. */
  periodo?: ModoPeriodoWidget;
}

/** Geometría que llega desde GridStack al sincronizar el tablero. */
export interface NodoGrilla {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetMeta {
  titulo: string;
  descripcion: string;
  wPorDefecto: number;
  hPorDefecto: number;
  /** Tamaño mínimo legible al que se puede reducir el widget. */
  minW: number;
  minH: number;
}

/** Catálogo de widgets disponibles para el tablero. */
export const WIDGETS: Record<TipoWidget, WidgetMeta> = {
  total: {
    titulo: 'Total del período',
    descripcion: 'Total, cantidad de gastos y mayor gasto del período.',
    wPorDefecto: 4,
    hPorDefecto: 5,
    minW: 4,
    minH: 4,
  },
  categorias: {
    titulo: 'Gasto por categoría',
    descripcion: 'Barras comparativas por categoría.',
    wPorDefecto: 8,
    hPorDefecto: 5,
    minW: 6,
    minH: 4,
  },
  evolucion: {
    titulo: 'Evolución del gasto',
    descripcion: 'Serie temporal según el período elegido.',
    wPorDefecto: 8,
    hPorDefecto: 7,
    minW: 6,
    minH: 6,
  },
  presupuestos: {
    titulo: 'Presupuestos',
    descripcion: 'Tope mensual contra el gasto real por categoría.',
    wPorDefecto: 4,
    hPorDefecto: 5,
    minW: 4,
    minH: 4,
  },
  historial: {
    titulo: 'Historial',
    descripcion: 'Listado paginado del período con acciones.',
    wPorDefecto: 12,
    hPorDefecto: 7,
    minW: 6,
    minH: 6,
  },
};

export const ORDEN_WIDGETS: TipoWidget[] = [
  'total',
  'categorias',
  'evolucion',
  'presupuestos',
  'historial',
];

export const LAYOUT_POR_DEFECTO: WidgetLayoutItem[] = [
  { id: 'total-1', tipo: 'total', x: 0, y: 0, w: 4, h: 5 },
  { id: 'categorias-1', tipo: 'categorias', x: 4, y: 0, w: 8, h: 5 },
  { id: 'evolucion-1', tipo: 'evolucion', x: 0, y: 5, w: 8, h: 7 },
  { id: 'presupuestos-1', tipo: 'presupuestos', x: 8, y: 5, w: 4, h: 5 },
  { id: 'historial-1', tipo: 'historial', x: 0, y: 12, w: 12, h: 7 },
];

export function esTipoWidget(valor: unknown): valor is TipoWidget {
  return (
    typeof valor === 'string' &&
    Object.prototype.hasOwnProperty.call(WIDGETS, valor)
  );
}

export function esModoPeriodoWidget(
  valor: unknown,
): valor is ModoPeriodoWidget {
  return (
    valor === 'global' ||
    valor === 'hoy' ||
    valor === 'semana' ||
    valor === 'mes' ||
    valor === 'mes-anterior' ||
    valor === '15-dias' ||
    valor === '3-meses' ||
    valor === 'anio'
  );
}

/** Entero dentro de un rango inclusivo. */
export function esEntero(
  valor: unknown,
  minimo: number,
  maximo: number,
): valor is number {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= minimo &&
    valor <= maximo
  );
}

/** Id único por instancia: permite tener dos widgets del mismo tipo. */
export function nuevoId(tipo: TipoWidget): string {
  const azar =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${tipo}-${azar}`;
}
