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

/**
 * Celda sortable: dnd-kit mueve la tarjeta y desplaza las demás en vivo.
 * El elemento activo no aplica su propio transform (lo dibuja el DragOverlay),
 * así no se deforma con el reflujo de la grilla.
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

  return (
    <div
      ref={setNodeRef}
      className={`widget-slot${isDragging ? ' widget-slot--arrastrando' : ''}`}
      style={{
        gridColumn: `span ${item.span}`,
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 3 : undefined,
      }}
      {...listeners}
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
