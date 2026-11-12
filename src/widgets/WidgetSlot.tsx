import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SpanWidget, WidgetLayoutItem } from './tipos.js';
import { WidgetResize } from './WidgetResize.js';

interface WidgetSlotProps {
  item: WidgetLayoutItem;
  indice: number;
  onRedimensionar?: (span: SpanWidget) => void;
  children: ReactNode;
}

const INTERACTIVOS = 'button, a, input, select, textarea';

/**
 * Celda sortable: dnd-kit mueve la tarjeta y desplaza las demás en vivo.
 * El elemento activo no aplica su propio transform (lo dibuja el DragOverlay).
 * Los listeners ignoran controles interactivos para que un clic o un resize
 * no dispare un arrastre.
 */
export function WidgetSlot({
  item,
  indice,
  onRedimensionar,
  children,
}: WidgetSlotProps) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const listenersFiltrados = useMemo(() => {
    const resultado: Record<string, (evento: Event) => void> = {};

    for (const [clave, valor] of Object.entries(listeners ?? {})) {
      if (typeof valor !== 'function') continue;
      resultado[clave] = (evento: Event) => {
        const objetivo = evento.target as HTMLElement | null;
        if (objetivo?.closest(INTERACTIVOS)) return;
        (valor as (evento: Event) => void)(evento);
      };
    }

    return resultado;
  }, [listeners]);

  return (
    <div
      ref={setNodeRef}
      className={`widget-slot${isDragging ? ' widget-slot--arrastrando' : ''}`}
      data-widget-id={item.id}
      style={{
        gridColumn: `span ${item.span}`,
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 3 : undefined,
      }}
      {...listenersFiltrados}
    >
      <div
        className="widget-slot__inner"
        style={{ animationDelay: `${Math.min(indice, 10) * 40}ms` }}
      >
        {children}
      </div>
      {onRedimensionar ? (
        <WidgetResize span={item.span} onCambiar={onRedimensionar} />
      ) : null}
    </div>
  );
}
