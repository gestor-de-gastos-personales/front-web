export type TipoWidget =
  | 'total'
  | 'categorias'
  | 'evolucion'
  | 'presupuestos'
  | 'ultimos'
  | 'historial';

export const TAMANOS = [4, 6, 8, 12] as const;
export type SpanWidget = (typeof TAMANOS)[number];

export interface WidgetLayoutItem {
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
  { tipo: 'total', span: 4 },
  { tipo: 'categorias', span: 8 },
  { tipo: 'evolucion', span: 8 },
  { tipo: 'presupuestos', span: 4 },
  { tipo: 'ultimos', span: 4 },
  { tipo: 'historial', span: 8 },
];

export function esTipoWidget(valor: unknown): valor is TipoWidget {
  return typeof valor === 'string' && valor in WIDGETS;
}

export function esSpan(valor: unknown): valor is SpanWidget {
  return TAMANOS.includes(valor as SpanWidget);
}
