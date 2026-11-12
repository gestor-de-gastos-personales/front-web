import type { ReactNode } from 'react';
import type { WidgetLayoutItem } from './tipos.js';

interface WidgetSlotProps {
  item: WidgetLayoutItem;
  indice: number;
  arrastrando: number | null;
  destino: number | null;
  onDragStart: (indice: number) => void;
  onDragOver: (indice: number) => void;
  onDrop: (indice: number) => void;
  onDragEnd: () => void;
  children: ReactNode;
}

/** Celda de la grilla: define el ancho y permite arrastrar para reordenar. */
export function WidgetSlot({
  item,
  indice,
  arrastrando,
  destino,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  children,
}: WidgetSlotProps) {
  const clases = [
    'widget-slot',
    arrastrando === indice ? 'widget-slot--arrastrando' : '',
    destino === indice && arrastrando !== indice ? 'widget-slot--destino' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={clases}
      style={{ gridColumn: `span ${item.span}` }}
      draggable
      onDragStart={(evento) => {
        evento.dataTransfer?.setData('text/plain', String(indice));
        if (evento.dataTransfer) evento.dataTransfer.effectAllowed = 'move';
        onDragStart(indice);
      }}
      onDragOver={(evento) => {
        evento.preventDefault();
        if (evento.dataTransfer) evento.dataTransfer.dropEffect = 'move';
        onDragOver(indice);
      }}
      onDrop={(evento) => {
        evento.preventDefault();
        onDrop(indice);
      }}
      onDragEnd={onDragEnd}
    >
      {children}
    </div>
  );
}
