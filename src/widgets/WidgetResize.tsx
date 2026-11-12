import type { KeyboardEvent, PointerEvent } from 'react';
import { SPAN_MAX, SPAN_MIN } from './tipos.js';
import type { SpanWidget } from './tipos.js';

interface WidgetResizeProps {
  span: SpanWidget;
  onCambiar: (span: SpanWidget) => void;
}

const GAP = 16;

/**
 * Handle de la esquina inferior derecha para redimensionar arrastrando.
 * Usa listeners de window (más robusto que el pointer capture) y flechas
 * del teclado como alternativa.
 */
export function WidgetResize({ span, onCambiar }: WidgetResizeProps) {
  const bajar = (evento: PointerEvent<HTMLButtonElement>) => {
    evento.stopPropagation();
    evento.preventDefault();

    const inicioX = evento.clientX;
    const inicial = span;
    let ultimo: SpanWidget = span;

    const slot = evento.currentTarget.closest('.widget-slot');
    const grid = slot?.closest('.grid');
    if (!grid) return;

    const anchoGrid = grid.getBoundingClientRect().width;
    const anchoColumna = (anchoGrid - GAP * 11) / 12;
    const paso = anchoColumna + GAP;
    if (paso <= 0) return;

    const mover = (movimiento: globalThis.PointerEvent) => {
      const columnas = Math.round((movimiento.clientX - inicioX) / paso);
      const nuevo = Math.max(
        SPAN_MIN,
        Math.min(SPAN_MAX, Math.round(inicial + columnas)),
      );

      if (nuevo !== ultimo) {
        ultimo = nuevo;
        onCambiar(nuevo);
      }
    };

    const soltar = () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
    };

    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
  };

  const tecla = (evento: KeyboardEvent<HTMLButtonElement>) => {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();

    const siguiente = Math.max(
      SPAN_MIN,
      Math.min(SPAN_MAX, span + (evento.key === 'ArrowRight' ? 1 : -1)),
    );
    if (siguiente !== span) onCambiar(siguiente);
  };

  return (
    <button
      type="button"
      className="widget-resize"
      aria-label={`Redimensionar widget (ancho ${span} de 12)`}
      title="Arrastrá para redimensionar"
      onPointerDown={bajar}
      onMouseDown={(evento) => evento.stopPropagation()}
      onTouchStart={(evento) => evento.stopPropagation()}
      onKeyDown={tecla}
      onClick={(evento) => evento.stopPropagation()}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M11 1 1 11M11 5 5 11M11 9 9 11" />
      </svg>
    </button>
  );
}
