import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { GridStack, GridStackItem } from 'gridstack/dist/react';
import type {
  GridStackHandle,
  GridStackOptions,
  GridStackWidget,
} from 'gridstack/dist/react';
import type { GridStack as GridStackCore } from 'gridstack';
import type { NodoGrilla, WidgetLayoutItem } from './tipos.js';

export interface WidgetGridHandle {
  getGrid: () => GridStackCore | null;
}

interface WidgetGridProps {
  items: WidgetLayoutItem[];
  editable: boolean;
  onCambio: (nodos: NodoGrilla[]) => void;
  renderWidget: (item: WidgetLayoutItem) => ReactNode;
}

/**
 * Opciones comunes del tablero:
 * - 12 columnas en escritorio y 1 en mobile (`columnOpts`).
 * - Animación y empaquetado superior nativos de GridStack.
 * - El único handle de arrastre es el agarre de la tarjeta; los controles
 *   y enlaces no disparan un drag.
 * - El resize usa la esquina inferior derecha nativa.
 */
const OPCIONES_BASE: GridStackOptions = {
  column: 12,
  cellHeight: 54,
  margin: 8,
  animate: true,
  alwaysShowResizeHandle: true,
  mode: 'top',
  draggable: { handle: '.widget__drag' },
  resizable: { handles: 'se' },
  columnOpts: {
    breakpointForWindow: true,
    breakpoints: [{ w: 980, c: 1 }],
    layout: 'moveScale',
  },
};

const MIN_W = 3;
const MIN_H = 3;

function leerNodos(grid: GridStackCore): NodoGrilla[] {
  const guardados = grid.save(false) as GridStackWidget[];
  const nodos: NodoGrilla[] = [];

  for (const widget of guardados) {
    const { id, x, y, w, h } = widget;
    if (typeof id !== 'string' || !id) continue;
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof w !== 'number' ||
      typeof h !== 'number'
    ) {
      continue;
    }
    nodos.push({ id, x, y, w, h });
  }

  return nodos;
}

function WidgetGridInterno(
  { items, editable, onCambio, renderWidget }: WidgetGridProps,
  ref: ForwardedRef<WidgetGridHandle>,
) {
  const gridRef = useRef<GridStackHandle>(null);
  const idsRef = useRef<Set<string>>(new Set());

  useImperativeHandle(
    ref,
    () => ({
      getGrid: () => gridRef.current?.getGrid() ?? null,
    }),
    [],
  );

  const opciones = useMemo<GridStackOptions>(
    () => ({
      ...OPCIONES_BASE,
      staticGrid: !editable,
      disableDrag: !editable,
      disableResize: !editable,
    }),
    [editable],
  );

  /**
   * GridStack ya reacomodó y compactó; se copia su geometría al estado.
   * En mobile (1 columna) no se persiste para no pisar el layout de escritorio.
   */
  const sincronizar = useCallback(() => {
    const grid = gridRef.current?.getGrid();
    if (!grid?.el || grid.getColumn() !== 12) return;
    onCambio(leerNodos(grid));
  }, [onCambio]);

  // Al entrar en edición aparece el agarre; GridStack debe re-escanearlo.
  useEffect(() => {
    const grid = gridRef.current?.getGrid();
    if (!grid?.engine || !editable) return;

    for (const nodo of grid.engine.nodes) {
      if (nodo.el) grid.refreshDragHandles(nodo.el);
    }
  }, [editable, items.length]);

  // GridStack crea el elemento del item; si React lo desmonta, se limpia el shell.
  useEffect(() => {
    const grid = gridRef.current?.getGrid();
    const raiz = grid?.el;
    if (!raiz) return;

    idsRef.current = new Set(items.map((item) => item.id));

    // Después del cleanup de los portales de React.
    Promise.resolve().then(() => {
      const vigentes = idsRef.current;
      Array.from(raiz.children).forEach((hijo) => {
        if (!hijo.classList.contains('grid-stack-item')) return;
        const id = hijo.getAttribute('gs-id');
        if (id && !vigentes.has(id)) hijo.remove();
      });
    });
  }, [items]);

  return (
    <GridStack
      ref={gridRef}
      options={opciones}
      className={`widget-grid${editable ? ' widget-grid--editable' : ''}`}
      onChange={sincronizar}
      onAdded={sincronizar}
      onRemoved={sincronizar}
    >
      {items.map((item) => (
        <GridStackItem
          key={item.id}
          id={item.id}
          options={{
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: MIN_W,
            minH: MIN_H,
          }}
        >
          {renderWidget(item)}
        </GridStackItem>
      ))}
    </GridStack>
  );
}

export const WidgetGrid = forwardRef(WidgetGridInterno);
