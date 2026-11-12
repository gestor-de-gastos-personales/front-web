export type TipoWidget =
  | 'total'
  | 'categorias'
  | 'evolucion'
  | 'presupuestos'
  | 'ultimos'
  | 'historial';

export const SPAN_MIN = 3;
export const SPAN_MAX = 12;
export type SpanWidget = number;

export interface WidgetLayoutItem {
  id: string;
  tipo: TipoWidget;
  span: SpanWidget;
}

export interface WidgetMeta {
  titulo: string;
  descripcion: string;
  spanPorDefecto: SpanWidget;
}

/** Catálogo de widgets disponibles para el tablero. */
export const WIDGETS: Record<TipoWidget, WidgetMeta> = {
  total: {
    titulo: 'Total del período',
    descripcion: 'Total, cantidad de gastos y mayor gasto del período.',
    spanPorDefecto: 4,
  },
  categorias: {
    titulo: 'Gasto por categoría',
    descripcion: 'Barras comparativas por categoría.',
    spanPorDefecto: 8,
  },
  evolucion: {
    titulo: 'Evolución del gasto',
    descripcion: 'Serie temporal según el período elegido.',
    spanPorDefecto: 8,
  },
  presupuestos: {
    titulo: 'Presupuestos',
    descripcion: 'Tope mensual contra el gasto real por categoría.',
    spanPorDefecto: 4,
  },
  ultimos: {
    titulo: 'Últimos gastos',
    descripcion: 'Los últimos movimientos cargados.',
    spanPorDefecto: 4,
  },
  historial: {
    titulo: 'Historial',
    descripcion: 'Listado paginado del período con acciones.',
    spanPorDefecto: 8,
  },
};

export const ORDEN_WIDGETS: TipoWidget[] = [
  'total',
  'categorias',
  'evolucion',
  'presupuestos',
  'ultimos',
  'historial',
];

export const LAYOUT_POR_DEFECTO: WidgetLayoutItem[] = [
  { id: 'total-1', tipo: 'total', span: 4 },
  { id: 'categorias-1', tipo: 'categorias', span: 8 },
  { id: 'evolucion-1', tipo: 'evolucion', span: 8 },
  { id: 'presupuestos-1', tipo: 'presupuestos', span: 4 },
  { id: 'ultimos-1', tipo: 'ultimos', span: 4 },
  { id: 'historial-1', tipo: 'historial', span: 8 },
];

export function esTipoWidget(valor: unknown): valor is TipoWidget {
  return typeof valor === 'string' && valor in WIDGETS;
}

export function esSpan(valor: unknown): valor is SpanWidget {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= SPAN_MIN &&
    valor <= SPAN_MAX
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
