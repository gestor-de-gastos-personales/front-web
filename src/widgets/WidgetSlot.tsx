import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WidgetLayoutItem } from './tipos.js';

interface WidgetSlotProps {
  item: WidgetLayoutItem;
  indice: number;
  children: ReactNode;
}

/**
 * Celda sortable: dnd-kit mueve la tarjeta y desplaza las demás en vivo.
 * Los listeners van en la tarjeta (mantener y arrastrar, estilo Android);
 * los botones de mover siguen disponibles para teclado y accesibilidad.
 */
export function WidgetSlot({ item, indice, children }: WidgetSlotProps) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`widget-slot${isDragging ? ' widget-slot--arrastrando' : ''}`}
      style={{
        gridColumn: `span ${item.span}`,
        transform: CSS.Transform.toString(transform),
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
    </div>
  );
}
